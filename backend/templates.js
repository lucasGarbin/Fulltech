import crypto from "node:crypto";
import path from "node:path";

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Assunto numa só linha (evita injeção de cabeçalhos) */
const oneLine = (s) => String(s).replace(/[\r\n]+/g, " ").trim();

export const generateProtocol = () => "FT-" + crypto.randomBytes(3).toString("hex").toUpperCase();

function build(title, rows) {
  const text = [title, "", ...rows.map(([k, v]) => `${k}: ${v || "—"}`)].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#24272c;max-width:640px">
<h2 style="margin:0 0 16px;color:#E8490F">${escapeHtml(title)}</h2>
<table style="border-collapse:collapse;width:100%">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:8px 12px;border:1px solid #e2e5ea;background:#f3f4f6;width:160px;vertical-align:top"><b>${escapeHtml(k)}</b></td>` +
      `<td style="padding:8px 12px;border:1px solid #e2e5ea;white-space:pre-wrap">${escapeHtml(v || "—")}</td></tr>`
  )
  .join("\n")}
</table></div>`;
  return { text, html };
}

export function contatoEmail(d) {
  const { text, html } = build("Nova mensagem pelo site", [
    ["Nome", d.nome],
    ["E-mail", d.email],
    ["Assunto", d.assunto],
    ["Mensagem", d.mensagem],
  ]);
  return { subject: oneLine(`[Contato] ${d.assunto || "Mensagem pelo site"} — ${d.nome}`), replyTo: d.email, text, html };
}

export function chamadoEmail(d, protocolo, file) {
  const { text, html } = build(`Chamado técnico ${protocolo}`, [
    ["Protocolo", protocolo],
    ["Empresa", d.empresa],
    ["Responsável", d.responsavel],
    ["E-mail", d.email],
    ["Telefone", d.telefone],
    ["Equipamento", d.equipamento],
    ["Nº de série", d.serial],
    ["Descrição", d.descricao],
    ["Anexo", file ? path.basename(file.originalname) : "nenhum"],
  ]);
  return {
    subject: oneLine(`[Chamado ${protocolo}] ${d.empresa} — ${d.equipamento}`),
    replyTo: d.email,
    text,
    html,
    attachments: file
      ? [{ filename: path.basename(file.originalname), content: file.buffer, contentType: file.mimetype }]
      : [],
  };
}
