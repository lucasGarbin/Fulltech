/* Busca sem acentos e sem diferenciar maiúsculas; todas as palavras têm de aparecer */
export const norm = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const hit = (text, tokens) => {
  const t = norm(text);
  return tokens.every((k) => t.includes(k));
};

/* Se a categoria bate → mostra todos os filhos; senão só os catálogos que batem.
   Cada resultado traz `total` (nº de catálogos antes do filtro). */
export function filterCategorias(categorias, query) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return categorias.map((c) => ({ ...c, total: c.catalogos.length }));
  const out = [];
  for (const c of categorias) {
    const catHit = hit(`${c.nome} ${c.descricao}`, tokens);
    const items = catHit ? c.catalogos : c.catalogos.filter((i) => hit(`${i.titulo} ${i.descricao}`, tokens));
    if (catHit || items.length) out.push({ ...c, catalogos: items, total: c.catalogos.length });
  }
  return out;
}
