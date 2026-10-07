/* Contato ainda usa o backend Node. O chamado técnico vai para a Edge Function do Supabase. */
import { supabase } from "./supabase";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const TIMEOUT_MS = 30000;

/* Deve coincidir com MAX_FILE_MB do backend */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; /* 0 = sem resposta do servidor (rede/timeout) */
    this.fieldErrors = fieldErrors;
  }
}

async function post(path, body, asJson) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      /* FormData: o browser define o Content-Type (multipart + boundary) sozinho */
      headers: asJson ? { "Content-Type": "application/json" } : undefined,
      body: asJson ? JSON.stringify(body) : body,
      signal: ctrl.signal,
    });
  } catch (err) {
    throw new ApiError(err.name === "AbortError" ? "TIMEOUT" : "NETWORK");
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || `HTTP ${res.status}`, { status: res.status, fieldErrors: data.errors });
  }
  return data;
}

/* Contato → JSON */
export function sendContactForm({ nome, email, assunto, mensagem }) {
  return post("/api/contato", { nome, email, assunto, mensagem }, true);
}

const MAX_CHAMADO_ANEXO = 4 * 1024 * 1024;

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function readFunctionError(error) {
  const status = error?.context?.status || 0;
  try {
    const body = typeof error?.context?.json === "function" ? await error.context.json() : null;
    return { status, message: body?.message || "", errors: body?.errors };
  } catch {
    return { status, message: "" };
  }
}

/* Chamado técnico → Edge Function do Supabase, que envia o e-mail para o contato da empresa.
   Devolve { ok, protocolo } */
export async function sendSupportForm(values, formEl) {
  const body = {};
  Object.entries(values).forEach(([key, value]) => {
    body[key] = String(value ?? "").trim();
  });

  const file = formEl?.elements?.nota?.files?.[0];
  if (file) {
    if (file.size > MAX_CHAMADO_ANEXO) {
      throw new ApiError("O anexo é demasiado grande (máx. 4 MB).", { status: 413 });
    }
    body.anexo = {
      name: file.name,
      type: file.type || "application/octet-stream",
      data: toBase64(await file.arrayBuffer()),
    };
  }

  const { data, error } = await supabase.functions.invoke("chamado", { body });
  if (error) {
    const payload = await readFunctionError(error);
    throw new ApiError(payload.message || "Não foi possível enviar agora.", {
      status: payload.status || 502,
      fieldErrors: payload.errors,
    });
  }
  if (!data?.protocolo) throw new ApiError("Não foi possível enviar agora.", { status: 502 });
  return data;
}

/* Mensagem amigável para cada tipo de falha */
export function getEmailErrorMessage(err) {
  if (err?.status === 0 || err instanceof TypeError) {
    return err?.message === "TIMEOUT"
      ? "O servidor demorou a responder. Tente novamente."
      : "Não foi possível ligar ao servidor. Verifique a ligação e tente novamente.";
  }
  if (err?.status === 400 && err.message) return err.message;
  if (err?.status === 413) return err.message || "O anexo é demasiado grande (máx. 10 MB).";
  if (err?.status === 429) return "Demasiados pedidos. Tente novamente dentro de instantes.";
  if (err?.status === 503) return "Envio de e-mail indisponível no momento. Ligue para nós.";
  return "Não foi possível enviar agora. Tente novamente ou ligue para nós.";
}
