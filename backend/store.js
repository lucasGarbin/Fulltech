/* Armazenamento simples em ficheiro JSON (sem base de dados). */
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(ROOT, "data", "catalogos.json");
export const UPLOAD_DIR = path.join(ROOT, "uploads");

export const newId = () => crypto.randomBytes(6).toString("hex");

const seed = () => ({
  categorias: [
    { id: newId(), nome: "Gamer", descricao: "Computadores de alta performance para jogos e streaming.", icone: "gamepad", catalogos: [] },
    { id: newId(), nome: "Projetos Especiais", descricao: "Soluções sob medida para licitações e demandas técnicas.", icone: "blueprint", catalogos: [] },
    { id: newId(), nome: "Corporativo", descricao: "Equipamentos para escritórios e ambientes empresariais.", icone: "building", catalogos: [] },
    { id: newId(), nome: "Educacional", descricao: "Laboratórios e soluções para instituições de ensino.", icone: "gradcap", catalogos: [] },
  ],
});

async function write(data) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE); /* escrita atómica */
}

export async function read() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    const data = seed();
    await write(data);
    return data;
  }
}

/* Fila: uma alteração de cada vez (evita corrida entre pedidos).
   Se `mutator` lançar erro, nada é gravado. */
let queue = Promise.resolve();
export function update(mutator) {
  const run = queue.then(async () => {
    const data = await read();
    const result = await mutator(data);
    await write(data);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export async function removeUpload(name) {
  if (!name) return;
  await fs.rm(path.join(UPLOAD_DIR, path.basename(name)), { force: true });
}
