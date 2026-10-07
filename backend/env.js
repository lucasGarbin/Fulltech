/* Carrega o backend/.env ANTES de qualquer outro módulo.
   override: true → o .env ganha de variáveis GMAIL_* que já existam no Windows. */
import dotenv from "dotenv";
dotenv.config({ override: true });
