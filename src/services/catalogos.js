import { API_URL } from "./email";
import { supabase } from "./supabase";

export const MAX_PDF_BYTES = 20 * 1024 * 1024;
const STORAGE_BUCKET = "catalogos";

export class CatalogError extends Error {
  constructor(message, { status = 0, fieldErrors } = {}) {
    super(message);
    this.name = "CatalogError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function throwSupabaseError(error) {
  if (error.code === "23505") {
    throw new CatalogError("Já existe uma categoria com esse nome.", {
      status: 400,
      fieldErrors: { nome: "Já existe uma categoria com esse nome." },
    });
  }
  if (error.code === "42501") {
    throw new CatalogError("Sua conta não tem permissão para esta ação.", { status: 403 });
  }
  throw new CatalogError(error.message || "Ocorreu um erro no Supabase.", {
    status: error.status || 0,
  });
}

function checkResponse({ data, error }) {
  if (error) throwSupabaseError(error);
  return data;
}

export const fileUrl = (path) => {
  if (!path) return "";
  if (/^https?:/i.test(path)) return path;
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
};

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throwSupabaseError(error);
  if (!data.session) return false;

  const { data: admin, error: adminError } = await supabase
    .from("catalog_admins")
    .select("user_id")
    .eq("user_id", data.session.user.id)
    .maybeSingle();
  if (adminError) throwSupabaseError(adminError);
  if (!admin) {
    checkResponse(await supabase.auth.signOut());
    return false;
  }
  return true;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new CatalogError(
      error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message,
      { status: error.status || 401 }
    );
  }

  const { data: admin, error: adminError } = await supabase
    .from("catalog_admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (adminError) {
    checkResponse(await supabase.auth.signOut());
    throwSupabaseError(adminError);
  }
  if (!admin) {
    checkResponse(await supabase.auth.signOut());
    throw new CatalogError("Esta conta não tem acesso à administração de catálogos.", { status: 403 });
  }
}

export async function logout() {
  checkResponse(await supabase.auth.signOut());
}

export const errorText = (error) => {
  if (error?.status === 0) {
    return "Não foi possível conectar ao Supabase. Verifique a configuração e a conexão.";
  }
  return error?.message || "Ocorreu um erro.";
};

export async function listCatalogos() {
  const [categoriesResult, itemsResult] = await Promise.all([
    supabase.from("catalog_categories").select("*").order("created_at"),
    supabase.from("catalog_items").select("*").order("created_at"),
  ]);
  const categories = checkResponse(categoriesResult) || [];
  const items = checkResponse(itemsResult) || [];
  return categories.map((category) => ({
    id: category.id,
    nome: category.nome,
    descricao: category.descricao,
    icone: category.icone,
    catalogos: items
      .filter((item) => item.categoria_id === category.id)
      .map((item) => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        url: item.url,
        arquivo: item.arquivo,
        criadoEm: item.criado_em,
      })),
  }));
}

export async function createCategoria(body) {
  const { error } = await supabase.from("catalog_categories").insert({
    nome: body.nome,
    descricao: body.descricao,
    icone: body.icone,
  });
  if (error) throwSupabaseError(error);
}

export async function updateCategoria(id, body) {
  const { data, error } = await supabase
    .from("catalog_categories")
    .update({ nome: body.nome, descricao: body.descricao, icone: body.icone })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throwSupabaseError(error);
  if (!data) throw new CatalogError("Categoria não encontrada.", { status: 404 });
}

async function removeStorageFiles(paths) {
  const storagePaths = paths.filter((path) => path && !path.startsWith("/uploads/"));
  if (!storagePaths.length) return;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(storagePaths);
  if (error) throwSupabaseError(error);
}

export async function deleteCategoria(id) {
  const { data: items, error: listError } = await supabase
    .from("catalog_items")
    .select("arquivo")
    .eq("categoria_id", id);
  if (listError) throwSupabaseError(listError);

  const { data, error } = await supabase
    .from("catalog_categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throwSupabaseError(error);
  if (!data) throw new CatalogError("Categoria não encontrada.", { status: 404 });
  await removeStorageFiles((items || []).map((item) => item.arquivo));
}

function catalogData(form) {
  const titulo = String(form.get("titulo") || "").trim().slice(0, 120);
  const descricao = String(form.get("descricao") || "").trim().slice(0, 300);
  const url = String(form.get("url") || "").trim().slice(0, 500);
  const errors = {};
  if (titulo.length < 2) errors.titulo = "Informe o título (mínimo 2 caracteres).";
  if (url) {
    try {
      if (!["http:", "https:"].includes(new URL(url).protocol)) throw new Error();
    } catch {
      errors.url = "Informe um link válido (http:// ou https://).";
    }
  }
  return { data: { titulo, descricao, url }, errors };
}

async function uploadPdf(file, categoryId) {
  if (!/\.pdf$/i.test(file.name)) {
    throw new CatalogError("Envie apenas ficheiros PDF.", { status: 400, fieldErrors: { pdf: "Envie apenas ficheiros PDF." } });
  }
  if (file.size > MAX_PDF_BYTES) {
    throw new CatalogError(`O PDF excede ${MAX_PDF_BYTES / 1048576} MB.`, { status: 413 });
  }
  const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...signature) !== "%PDF-") {
    throw new CatalogError("O ficheiro não é um PDF válido.", { status: 400, fieldErrors: { pdf: "O ficheiro não é um PDF válido." } });
  }

  const path = `${categoryId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throwSupabaseError(error);
  return path;
}

export async function createCatalogo(categoryId, form) {
  const { data, errors } = catalogData(form);
  const file = form.get("pdf");
  const hasFile = file && typeof file === "object" && file.size > 0;
  if (!hasFile && !data.url) errors.pdf = "Envie um PDF ou informe um link.";
  if (Object.keys(errors).length) throw new CatalogError("Verifique os campos destacados.", { status: 400, fieldErrors: errors });

  const path = hasFile ? await uploadPdf(file, categoryId) : "";
  const { error } = await supabase.from("catalog_items").insert({
    categoria_id: categoryId,
    titulo: data.titulo,
    descricao: data.descricao,
    url: data.url,
    arquivo: path,
  });
  if (error) {
    if (path) await removeStorageFiles([path]);
    throwSupabaseError(error);
  }
}

export async function updateCatalogo(id, form) {
  const { data: current, error: fetchError } = await supabase
    .from("catalog_items")
    .select("id, categoria_id, arquivo")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throwSupabaseError(fetchError);
  if (!current) throw new CatalogError("Catálogo não encontrado.", { status: 404 });

  const { data, errors } = catalogData(form);
  const file = form.get("pdf");
  const hasFile = file && typeof file === "object" && file.size > 0;
  const removeFile = form.get("removerArquivo") === "1";
  if (!hasFile && !(current.arquivo && !removeFile) && !data.url) {
    errors.pdf = "Envie um PDF ou informe um link.";
  }
  if (Object.keys(errors).length) throw new CatalogError("Verifique os campos destacados.", { status: 400, fieldErrors: errors });

  const uploadedPath = hasFile ? await uploadPdf(file, current.categoria_id) : "";
  const arquivo = uploadedPath || (removeFile ? "" : current.arquivo);
  const { error } = await supabase
    .from("catalog_items")
    .update({ titulo: data.titulo, descricao: data.descricao, url: data.url, arquivo })
    .eq("id", id);
  if (error) {
    if (uploadedPath) await removeStorageFiles([uploadedPath]);
    throwSupabaseError(error);
  }
  if (uploadedPath || removeFile) await removeStorageFiles([current.arquivo]);
}

export async function deleteCatalogo(id) {
  const { data: current, error: fetchError } = await supabase
    .from("catalog_items")
    .select("id, arquivo")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throwSupabaseError(fetchError);
  if (!current) throw new CatalogError("Catálogo não encontrado.", { status: 404 });

  const { error } = await supabase.from("catalog_items").delete().eq("id", id);
  if (error) throwSupabaseError(error);
  await removeStorageFiles([current.arquivo]);
}
