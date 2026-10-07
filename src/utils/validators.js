/* Cada validador devolve uma mensagem de erro (string) ou null se válido */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REQUIRED_MSG = "Campo obrigatório.";

export const validateText = (min = 1) => (value) => {
  const v = String(value ?? "").trim();
  if (!v) return REQUIRED_MSG;
  if (v.length < min) return `Informe pelo menos ${min} caracteres.`;
  return null;
};

export function validateEmail(value) {
  const v = String(value ?? "").trim();
  if (!v) return REQUIRED_MSG;
  if (!EMAIL_RE.test(v)) return "Informe um e-mail válido.";
  return null;
}

export function validatePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return REQUIRED_MSG;
  if (digits.length < 10 || digits.length > 11) return "Informe um telefone válido com DDD.";
  return null;
}

/* Máscara (49) 99999-9999 / (49) 9999-9999 */
export function formatPhone(value) {
  const d = String(value ?? "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
