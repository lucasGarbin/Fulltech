# Backend Fulltech — Node + Express + Nodemailer (Gmail SMTP)

```bash
cd backend
npm install
cp .env.example .env    # preencha GMAIL_USER, GMAIL_APP_PASSWORD, MAIL_TO
npm run dev             # http://localhost:5000
```

## Senha de app do Gmail
1. Conta Google → Segurança → ative a **Verificação em 2 passos**.
2. https://myaccount.google.com/apppasswords → crie uma senha de app (16 caracteres).
3. Cole em `GMAIL_APP_PASSWORD` (com ou sem espaços).

## Rotas
| Método | Rota           | Corpo                                                                                                  |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------ |
| GET    | /api/health    | —                                                                                                      |
| POST   | /api/contato   | JSON: `nome`, `email`, `assunto`, `mensagem`                                                           |
| POST   | /api/chamado   | multipart: `empresa`, `responsavel`, `email`, `telefone`, `equipamento`, `serial`, `descricao`, `nota` (ficheiro) |

`/api/chamado` responde `{ ok: true, protocolo: "FT-XXXXXX" }`.

## Produção
- Defina `CORS_ORIGIN=https://seu-site.com.br` e, no frontend, `VITE_API_URL=https://api.seu-dominio.com.br`.
- Hospede em qualquer host Node (Render, Railway, VPS...). Mantenha o `.env` fora do Git.
- Contas Gmail têm limite diário de envio (cerca de 500 destinatários/dia em contas gratuitas).
