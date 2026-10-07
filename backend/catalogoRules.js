/* Regras puras (sem Express) para categorias e catálogos */
export const ICONES = ["gamepad", "blueprint", "building", "gradcap", "desktop", "monitor", "workstation", "printer", "shield", "support"];

const s = (v, max) => String(v ?? "").trim().slice(0, max);
const isHttp = (u) => { try { return ["http:", "https:"].includes(new URL(u).protocol); } catch { return false; } };
export const norm = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function parseCategoria(body = {}) {
  const data = { nome: s(body.nome, 60), descricao: s(body.descricao, 200), icone: s(body.icone, 20) || "desktop" };
  const errors = {};
  if (data.nome.length < 2) errors.nome = "Informe o nome (mínimo 2 caracteres).";
  if (!ICONES.includes(data.icone)) errors.icone = "Ícone inválido.";
  return { data, errors };
}

/* hasFile: há ficheiro novo ou já existente depois da edição */
export function parseCatalogo(body = {}, hasFile) {
  const data = { titulo: s(body.titulo, 120), descricao: s(body.descricao, 300), url: s(body.url, 500) };
  const errors = {};
  if (data.titulo.length < 2) errors.titulo = "Informe o título (mínimo 2 caracteres).";
  if (data.url && !isHttp(data.url)) errors.url = "Informe um link válido (http:// ou https://).";
  if (!hasFile && !data.url) errors.pdf = "Envie um PDF ou informe um link.";
  return { data, errors };
}
