/* Diagnóstico do login no Gmail:  node check-mail.js
   Não envia e-mail; só testa a autenticação e mostra o motivo exato da falha. */
import "./env.js";
import nodemailer from "nodemailer";

const user = (process.env.GMAIL_USER || "").trim();
const raw = process.env.GMAIL_APP_PASSWORD || "";
const pass = raw.replace(/[^A-Za-z0-9]/g, ""); /* tira espaços, aspas e caracteres invisíveis */

const mask = (u) => (u ? u.replace(/^(.{2}).*(@.*)$/, "$1***$2") : "(vazio)");
console.log("Conta (GMAIL_USER):      ", mask(user));
console.log("Senha (GMAIL_APP_PASSWORD):", raw ? `${pass.length} caracteres úteis (uma senha de app tem 16)` : "(vazia)");

if (!user.includes("@")) console.warn("⚠ GMAIL_USER deve ser o e-mail completo, ex.: site@gmail.com");
if (raw && raw.trim() !== raw.trim().replace(/^["']|["']$/g, "")) console.warn("⚠ A senha tem aspas no .env — remova-as.");
if (pass.length !== 16) console.warn("⚠ Não parece uma senha de app (16 letras). Provavelmente é a senha normal da conta, que NÃO funciona aqui.");

const modes = [
  { name: "porta 465 (SSL)", cfg: { host: "smtp.gmail.com", port: 465, secure: true } },
  { name: "porta 587 (STARTTLS)", cfg: { host: "smtp.gmail.com", port: 587, secure: false, requireTLS: true } },
];

for (const { name, cfg } of modes) {
  try {
    await nodemailer.createTransport({ ...cfg, auth: { user, pass }, connectionTimeout: 15000 }).verify();
    console.log(`✔ ${name}: login OK`);
  } catch (e) {
    console.log(`✖ ${name}: ${e.code || ""} ${e.responseCode || ""}`);
    console.log("  ", String(e.response || e.message).replace(/\s+/g, " ").slice(0, 220));
  }
}
console.log("\nCódigo 535 = utilizador/senha recusados. Código 534 = Google exige login no navegador/bloqueou a tentativa.");
