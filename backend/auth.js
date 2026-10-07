/* Login de administrador por senha (ADMIN_PASSWORD) + token assinado (HMAC), sem dependências. */
import crypto from "node:crypto";
import { HttpError } from "./errors.js";

const TTL_MS = 8 * 60 * 60 * 1000; /* 8 horas */
const sha = (v) => crypto.createHash("sha256").update(String(v)).digest();
const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = (payload) => crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

export const isAdminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export const checkPassword = (input) =>
  isAdminConfigured() && crypto.timingSafeEqual(sha(input), sha(process.env.ADMIN_PASSWORD));

export function issueToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token = "") {
  const [payload, sig] = String(token).split(".");
  if (!payload || !sig) return false;
  const good = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (good.length !== got.length || !crypto.timingSafeEqual(good, got)) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req, res, next) {
  if (!isAdminConfigured()) return next(new HttpError(503, "Administração não configurada (defina ADMIN_PASSWORD no .env)."));
  const header = req.headers.authorization || "";
  if (!verifyToken(header.startsWith("Bearer ") ? header.slice(7) : "")) {
    return next(new HttpError(401, "Sessão expirada. Faça login novamente."));
  }
  next();
}
