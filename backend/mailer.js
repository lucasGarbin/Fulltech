import nodemailer from "nodemailer";
import { HttpError } from "./errors.js";

const user = process.env.GMAIL_USER;
/* Gmail mostra a senha de app com espaços; removemos */
const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

export const isMailConfigured = () => Boolean(user && pass);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user, pass },
});

export async function verifyMailer() {
  if (!isMailConfigured()) return false;
  await transporter.verify();
  return true;
}

export async function sendMail({ subject, text, html, replyTo, attachments }) {
  if (!isMailConfigured()) throw new HttpError(503, "Servidor de e-mail não configurado.");
  return transporter.sendMail({
    from: `"Site Fulltech" <${user}>`, /* o Gmail só envia em nome da própria conta */
    to: process.env.MAIL_TO || user,
    replyTo,
    subject,
    text,
    html,
    attachments,
  });
}
