import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const DESTINO = "contato@fulltechequipamentos.com.br";
const MAX_ANEXO = 4 * 1024 * 1024;
const EXTENSOES = new Set(["png", "jpg", "jpeg", "pdf", "zip", "rar", "txt"]);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char
  );

const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

function adminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  let key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, string>;
    key = parsed.default || Object.values(parsed)[0] || key;
  }
  if (!url || !key) throw new Error("Chave de serviço do Supabase ausente.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function protocolo() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return "FT-" + [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function campo(body: Record<string, unknown>, nome: string, max: number) {
  return String(body[nome] ?? "").trim().slice(0, max);
}

function validar(data: Record<string, string>) {
  const errors: Record<string, string> = {};
  const texto = (valor: string, min: number) =>
    !valor ? "Campo obrigatório." : valor.length < min ? `Informe pelo menos ${min} caracteres.` : "";
  const email = !data.email
    ? "Campo obrigatório."
    : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)
      ? ""
      : "Informe um e-mail válido.";
  const digitos = data.telefone.replace(/\D/g, "");
  const regras: Record<string, string> = {
    empresa: texto(data.empresa, 2),
    responsavel: texto(data.responsavel, 3),
    email,
    telefone: !digitos ? "Campo obrigatório." : digitos.length < 10 || digitos.length > 11 ? "Informe um telefone válido com DDD." : "",
    equipamento: texto(data.equipamento, 2),
    descricao: texto(data.descricao, 10),
  };
  for (const [nome, mensagem] of Object.entries(regras)) {
    if (mensagem) errors[nome] = mensagem;
  }
  return errors;
}

function emailBody(data: Record<string, string>, codigo: string, anexo: string) {
  const linhas: [string, string][] = [
    ["Protocolo", codigo],
    ["Empresa", data.empresa],
    ["Responsável", data.responsavel],
    ["E-mail", data.email],
    ["Telefone", data.telefone],
    ["Equipamento", data.equipamento],
    ["Nº de série", data.serial || "—"],
    ["Descrição", data.descricao],
    ["Anexo", anexo || "nenhum"],
  ];
  const text = [`Chamado técnico ${codigo}`, "", ...linhas.map(([rotulo, valor]) => `${rotulo}: ${valor}`)].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#24272c;max-width:640px">
<h2 style="margin:0 0 16px;color:#E8490F">${escapeHtml(`Chamado técnico ${codigo}`)}</h2>
<table style="border-collapse:collapse;width:100%">
${linhas
  .map(
    ([rotulo, valor]) =>
      `<tr><td style="padding:8px 12px;border:1px solid #e2e5ea;background:#f3f4f6;width:160px;vertical-align:top"><b>${escapeHtml(rotulo)}</b></td>` +
      `<td style="padding:8px 12px;border:1px solid #e2e5ea;white-space:pre-wrap">${escapeHtml(valor)}</td></tr>`
  )
  .join("\n")}
</table></div>`;
  return { text, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ message: "Método não permitido." }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ message: "Pedido inválido." }, 400);
  }

  const data = {
    empresa: campo(body, "empresa", 150),
    responsavel: campo(body, "responsavel", 120),
    email: campo(body, "email", 160),
    telefone: campo(body, "telefone", 20),
    equipamento: campo(body, "equipamento", 150),
    serial: campo(body, "serial", 100),
    descricao: campo(body, "descricao", 5000),
  };
  const errors = validar(data);
  if (Object.keys(errors).length) {
    return json({ message: "Verifique os campos destacados.", errors }, 400);
  }

  const anexo = body.anexo as { name?: string; type?: string; data?: string } | null;
  let arquivo = "";
  let anexoBytes: Uint8Array | null = null;
  if (anexo?.data) {
    const nome = String(anexo.name || "nota").split(/[/\\]/).pop() || "nota";
    const ext = nome.split(".").pop()?.toLowerCase() || "";
    if (!EXTENSOES.has(ext)) return json({ message: `Formato .${ext || "?"} não permitido.` }, 400);
    try {
      anexoBytes = Uint8Array.from(atob(anexo.data), (char) => char.charCodeAt(0));
    } catch {
      return json({ message: "O anexo está inválido." }, 400);
    }
    if (anexoBytes.byteLength > MAX_ANEXO) {
      return json({ message: "O anexo é demasiado grande (máx. 4 MB)." }, 413);
    }
    arquivo = nome.replace(/[^\w.\- ]+/g, "_").slice(0, 80);
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return json({ message: "Envio de e-mail indisponível no momento. Ligue para nós." }, 503);
  }

  const admin = adminClient();
  const desde = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .eq("email", data.email)
    .gte("created_at", desde);
  if (countError) {
    console.error("contagem de chamados", countError.code);
    return json({ message: "Não foi possível enviar o e-mail agora." }, 502);
  }
  if ((count ?? 0) >= 5) {
    return json({ message: "Demasiados pedidos. Tente novamente dentro de instantes." }, 429);
  }

  const codigo = protocolo();
  let anexoPath = "";
  if (anexoBytes && arquivo) {
    anexoPath = `${codigo}/${arquivo}`;
    const { error: uploadError } = await admin.storage.from("chamados").upload(anexoPath, anexoBytes, {
      contentType: String(anexo.type || "application/octet-stream"),
      upsert: false,
    });
    if (uploadError) {
      console.error("upload do anexo", uploadError.message);
      return json({ message: "Não foi possível guardar o anexo." }, 502);
    }
  }

  const { text, html } = emailBody(data, codigo, arquivo);
  const resend = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("RESEND_FROM") || `Fulltech <${DESTINO}>`,
      to: [DESTINO],
      reply_to: data.email,
      subject: oneLine(`[Chamado ${codigo}] ${data.empresa} — ${data.equipamento}`),
      text,
      html,
      attachments: anexoBytes && arquivo ? [{ filename: arquivo, content: anexo!.data }] : undefined,
    }),
  });
  if (!resend.ok) {
    console.error("resend", resend.status);
    return json({ message: "Não foi possível enviar o e-mail agora." }, 502);
  }

  const { error: insertError } = await admin.from("support_tickets").insert({
    protocolo: codigo,
    ...data,
    anexo_path: anexoPath,
  });
  if (insertError) console.error("registro do chamado", insertError.code);

  return json({ ok: true, protocolo: codigo });
});
