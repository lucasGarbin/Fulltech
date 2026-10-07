/* Cliente do backend Node (Nodemailer + Gmail SMTP) para contato e chamados.
   URL da API: variável VITE_API_URL (ver .env.example); por omissão http://localhost:5000 */
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

/* Chamado técnico → multipart/form-data (campos + ficheiro "nota").
   Devolve { ok, protocolo } */
export function sendSupportForm(values, formEl) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? "").trim()));
  const file = formEl?.elements?.nota?.files?.[0];
  if (file) fd.append("nota", file, file.name);
  return post("/api/chamado", fd, false);
}

/* Mensagem amigável para cada tipo de falha */
export function getEmailErrorMessage(err) {
  if (err?.status === 0 || err instanceof TypeError) {
    return err?.message === "TIMEOUT"
      ? "O servidor demorou a responder. Tente novamente."
      : "Não foi possível ligar ao servidor. Verifique a ligação e tente novamente.";
  }
  if (err?.status === 400 && err.message) return err.message;
  if (err?.status === 413) return "O anexo é demasiado grande (máx. 10 MB).";
  if (err?.status === 429) return "Demasiados pedidos. Tente novamente dentro de instantes.";
  if (err?.status === 503) return "Envio de e-mail indisponível no momento. Ligue para nós.";
  return "Não foi possível enviar agora. Tente novamente ou ligue para nós.";
}
