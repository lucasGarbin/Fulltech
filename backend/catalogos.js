import fs from "node:fs";
import crypto from "node:crypto";
import { Router } from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { HttpError } from "./errors.js";
import { read, update, newId, removeUpload, UPLOAD_DIR } from "./store.js";
import { checkPassword, issueToken, isAdminConfigured, requireAdmin } from "./auth.js";
import { parseCategoria, parseCatalogo, norm } from "./catalogoRules.js";

const MAX_PDF_MB = Number(process.env.MAX_PDF_MB) || 20;
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const router = Router();
const ah = (fn) => (req, res, next) => fn(req, res, next).catch(next); /* Express 4 + async */

/* ---------- Upload de PDF (disco, nome aleatório) ---------- */
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, crypto.randomBytes(10).toString("hex") + ".pdf"),
  }),
  limits: { fileSize: MAX_PDF_MB * 1024 * 1024, files: 1, fields: 10, fieldSize: 20 * 1024 },
  fileFilter: (req, file, cb) =>
    /\.pdf$/i.test(file.originalname) ? cb(null, true) : cb(new HttpError(400, "Envie apenas ficheiros PDF.")),
});

const uploadPdf = (req, res, next) =>
  upload.single("pdf")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return next(new HttpError(err.code === "LIMIT_FILE_SIZE" ? 413 : 400, err.code === "LIMIT_FILE_SIZE" ? `O PDF excede ${MAX_PDF_MB} MB.` : "Pedido inválido."));
    }
    next(err);
  });

/* Confere se o ficheiro é mesmo um PDF (assinatura "%PDF") */
function isRealPdf(file) {
  const fd = fs.openSync(file.path, "r");
  try {
    const buf = Buffer.alloc(5);
    fs.readSync(fd, buf, 0, 5, 0);
    return buf.toString("latin1") === "%PDF-";
  } finally {
    fs.closeSync(fd);
  }
}
const discard = (file) => file && removeUpload(file.filename);

const bad = (errors) => Object.assign(new HttpError(400, "Verifique os campos destacados."), { errors });
const notFound = (what) => new HttpError(404, `${what} não encontrado.`);

/* ---------- Público ---------- */
router.get("/catalogos", ah(async (req, res) => {
  const { categorias } = await read();
  res.json({ ok: true, categorias });
}));

/* ---------- Login ---------- */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { ok: false, message: "Demasiadas tentativas. Tente novamente mais tarde." },
});

router.post("/admin/login", loginLimiter, (req, res, next) => {
  if (!isAdminConfigured()) return next(new HttpError(503, "Administração não configurada (defina ADMIN_PASSWORD no .env)."));
  if (!checkPassword(req.body?.password ?? "")) return next(new HttpError(401, "Senha incorreta."));
  res.json({ ok: true, token: issueToken() });
});

/* ---------- Tudo abaixo exige token de administrador ---------- */
router.use("/admin", requireAdmin);

const dupName = (categorias, nome, ignoreId) =>
  categorias.some((c) => c.id !== ignoreId && norm(c.nome) === norm(nome));

router.post("/admin/categorias", ah(async (req, res) => {
  const { data, errors } = parseCategoria(req.body);
  if (Object.keys(errors).length) throw bad(errors);
  const categoria = await update(({ categorias }) => {
    if (dupName(categorias, data.nome)) throw bad({ nome: "Já existe uma categoria com esse nome." });
    const c = { id: newId(), ...data, catalogos: [] };
    categorias.push(c);
    return c;
  });
  res.status(201).json({ ok: true, categoria });
}));

router.put("/admin/categorias/:id", ah(async (req, res) => {
  const { data, errors } = parseCategoria(req.body);
  if (Object.keys(errors).length) throw bad(errors);
  const categoria = await update(({ categorias }) => {
    const c = categorias.find((x) => x.id === req.params.id);
    if (!c) throw notFound("Categoria");
    if (dupName(categorias, data.nome, c.id)) throw bad({ nome: "Já existe uma categoria com esse nome." });
    Object.assign(c, data);
    return c;
  });
  res.json({ ok: true, categoria });
}));

router.delete("/admin/categorias/:id", ah(async (req, res) => {
  const files = await update((db) => {
    const i = db.categorias.findIndex((x) => x.id === req.params.id);
    if (i < 0) throw notFound("Categoria");
    const [removed] = db.categorias.splice(i, 1);
    return removed.catalogos.map((c) => c.arquivo).filter(Boolean);
  });
  await Promise.all(files.map(removeUpload)); /* apaga também os PDFs dos catálogos filhos */
  res.json({ ok: true });
}));

/* ---------- Catálogos (filhos de uma categoria) ---------- */
router.post("/admin/categorias/:id/catalogos", uploadPdf, ah(async (req, res) => {
  const file = req.file;
  try {
    if (file && !isRealPdf(file)) throw bad({ pdf: "O ficheiro não é um PDF válido." });
    const { data, errors } = parseCatalogo(req.body, Boolean(file));
    if (Object.keys(errors).length) throw bad(errors);
    const catalogo = await update(({ categorias }) => {
      const c = categorias.find((x) => x.id === req.params.id);
      if (!c) throw notFound("Categoria");
      const item = {
        id: newId(), ...data,
        arquivo: file ? `/uploads/${file.filename}` : "",
        criadoEm: new Date().toISOString(),
      };
      c.catalogos.push(item);
      return item;
    });
    res.status(201).json({ ok: true, catalogo });
  } catch (err) {
    await discard(file); /* não deixa PDF órfão se algo falhou */
    throw err;
  }
}));

router.put("/admin/catalogos/:id", uploadPdf, ah(async (req, res) => {
  const file = req.file;
  let oldFile = "";
  try {
    if (file && !isRealPdf(file)) throw bad({ pdf: "O ficheiro não é um PDF válido." });
    const catalogo = await update(({ categorias }) => {
      const item = categorias.flatMap((c) => c.catalogos).find((x) => x.id === req.params.id);
      if (!item) throw notFound("Catálogo");
      const remove = req.body.removerArquivo === "1";
      const keepsFile = Boolean(file) || (Boolean(item.arquivo) && !remove);
      const { data, errors } = parseCatalogo(req.body, keepsFile);
      if (Object.keys(errors).length) throw bad(errors);
      Object.assign(item, data);
      if (file || remove) { oldFile = item.arquivo; item.arquivo = file ? `/uploads/${file.filename}` : ""; }
      return item;
    });
    await removeUpload(oldFile);
    res.json({ ok: true, catalogo });
  } catch (err) {
    await discard(file);
    throw err;
  }
}));

router.delete("/admin/catalogos/:id", ah(async (req, res) => {
  const arquivo = await update(({ categorias }) => {
    for (const c of categorias) {
      const i = c.catalogos.findIndex((x) => x.id === req.params.id);
      if (i >= 0) return c.catalogos.splice(i, 1)[0].arquivo;
    }
    throw notFound("Catálogo");
  });
  await removeUpload(arquivo);
  res.json({ ok: true });
}));

export default router;
