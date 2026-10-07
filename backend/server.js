import "./env.js";
import path from "node:path";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { HttpError } from "./errors.js";
import catalogosRouter from "./catalogos.js";
import { UPLOAD_DIR } from "./store.js";
import { isMailConfigured, sendMail, verifyMailer } from "./mailer.js";
import { pick, validateContato, validateChamado, CONTATO_FIELDS, CHAMADO_FIELDS } from "./validators.js";
import { contatoEmail, chamadoEmail, generateProtocol } from "./templates.js";

const PORT = Number(process.env.PORT) || 5000;
const MAX_FILE_BYTES = (Number(process.env.MAX_FILE_MB) || 10) * 1024 * 1024;
const ALLOWED_EXT = new Set(["png", "jpg", "jpeg", "pdf", "zip", "rar", "txt"]); /* igual ao frontend */
const ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",").map((s) => s.trim()).filter(Boolean);

const app = express();
app.disable("x-powered-by");

/* ---------- CORS ---------- */
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || ORIGINS.includes(origin)) return cb(null, true); /* sem origin = curl/Postman */
      cb(new HttpError(403, "Origem não permitida."));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "100kb" }));

/* PDFs dos catálogos (só leitura) */
app.use("/uploads", express.static(UPLOAD_DIR, {
  index: false, dotfiles: "deny",
  setHeaders: (res) => { res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("Content-Type", "application/pdf"); },
}));

/* ---------- Anti-abuso: 20 envios / 15 min por IP ---------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Demasiados pedidos. Tente novamente dentro de instantes." },
});

/* ---------- Multer: multipart/form-data (ficheiro em memória → anexo) ---------- */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 20, fieldSize: 20 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) return cb(new HttpError(400, `Formato .${ext || "?"} não permitido.`));
    cb(null, true);
  },
});

/* ---------- Rotas ---------- */
app.get("/api/health", (req, res) => res.json({ ok: true, mailConfigured: isMailConfigured() }));

app.post("/api/contato", limiter, async (req, res, next) => {
  try {
    const data = pick(req.body, CONTATO_FIELDS);
    if (data.website) return res.json({ ok: true }); /* honeypot: robô → finge sucesso */

    const errors = validateContato(data);
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Verifique os campos destacados.", errors });
    }
    await sendMail(contatoEmail(data));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post("/api/chamado", limiter, upload.single("nota"), async (req, res, next) => {
  try {
    const data = pick(req.body, CHAMADO_FIELDS);
    const errors = validateChamado(data);
    if (Object.keys(errors).length) {
      return res.status(400).json({ ok: false, message: "Verifique os campos destacados.", errors });
    }
    const protocolo = generateProtocol();
    await sendMail(chamadoEmail(data, protocolo, req.file)); /* req.file → anexo */
    res.json({ ok: true, protocolo });
  } catch (err) {
    next(err);
  }
});

app.use("/api", catalogosRouter); /* /api/catalogos + /api/admin/... */

app.use((req, res) => res.status(404).json({ ok: false, message: "Rota não encontrada." }));

/* ---------- Tratamento de erros ---------- */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    return res.status(tooBig ? 413 : 400).json({
      ok: false,
      message: tooBig ? `O anexo excede ${MAX_FILE_BYTES / 1048576} MB.` : "Pedido inválido.",
    });
  }
  if (err instanceof HttpError) return res.status(err.status).json({ ok: false, message: err.message, ...(err.errors && { errors: err.errors }) });
  if (err?.type === "entity.parse.failed") return res.status(400).json({ ok: false, message: "JSON inválido." });

  console.error("Erro ao enviar e-mail:", err); /* detalhe só no log do servidor */
  res.status(502).json({ ok: false, message: "Não foi possível enviar o e-mail agora." });
});

const server = app.listen(PORT, async () => {
  console.log(`API Fulltech a correr em http://localhost:${PORT}`);
  if (!isMailConfigured()) {
    console.warn("⚠ Defina GMAIL_USER e GMAIL_APP_PASSWORD no backend/.env");
    return;
  }
  try {
    await verifyMailer();
    console.log("✔ SMTP do Gmail autenticado.");
  } catch (err) {
    console.warn("⚠ Falha ao autenticar no Gmail (verifique a senha de app):", err.message);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ A porta ${PORT} já está em uso por outro processo.`);
    console.error("Verifique se já existe outra instância do backend a correr ou finalize o processo anterior antes de reiniciar.\n");
  } else {
    console.error("Erro no servidor HTTP:", err);
  }
  process.exit(1);
});

function gracefulShutdown() {
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

