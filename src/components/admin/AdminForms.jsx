import { useId, useRef, useState } from "react";
import Field from "../ui/Field";
import { ICONS } from "../../data/catalogIcons";
import { MAX_PDF_BYTES, errorText } from "../../services/catalogos";
import { showToast } from "../../utils/toast";

/* Corre o envio; erros por campo vão para os campos, os outros para um aviso */
function useSubmit(onSubmit, setErrors) {
  const [saving, setSaving] = useState(false);
  const run = async (payload) => {
    if (saving) return;
    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      else showToast(errorText(err));
    } finally {
      setSaving(false);
    }
  };
  return [saving, run];
}

export function CategoriaForm({ initial, onSubmit, onCancel, submitLabel = "Guardar categoria" }) {
  const uid = useId();
  const [v, setV] = useState({ nome: initial?.nome || "", descricao: initial?.descricao || "", icone: initial?.icone || "desktop" });
  const [errors, setErrors] = useState({});
  const [saving, run] = useSubmit(onSubmit, setErrors);
  const set = (k) => (val) => { setV((s) => ({ ...s, [k]: val })); setErrors((s) => ({ ...s, [k]: undefined })); };

  const submit = (e) => {
    e.preventDefault();
    if (v.nome.trim().length < 2) return setErrors({ nome: "Informe o nome (mínimo 2 caracteres)." });
    run({ nome: v.nome.trim(), descricao: v.descricao.trim(), icone: v.icone });
  };

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Field id={`${uid}-nome`} name="nome" label="Nome da categoria" required value={v.nome} error={errors.nome}
             onChange={set("nome")} placeholder="Ex.: Servidores" maxLength={60} />
      <div className="field">
        <label htmlFor={`${uid}-icone`}>Ícone</label>
        <select id={`${uid}-icone`} value={v.icone} onChange={(e) => set("icone")(e.target.value)}>
          {Object.entries(ICONS).map(([k, { label }]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>
      <Field id={`${uid}-descricao`} name="descricao" label="Descrição curta" full value={v.descricao}
             onChange={set("descricao")} placeholder="Aparece no card da categoria" maxLength={200} />
      <div className="form-actions">
        <button type="submit" className="btn btn--solid" disabled={saving}>{saving ? "A guardar..." : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn--outline" onClick={onCancel}>Cancelar</button>}
      </div>
    </form>
  );
}

export function CatalogoForm({ initial, onSubmit, onCancel, submitLabel = "Guardar catálogo" }) {
  const uid = useId();
  const fileRef = useRef(null);
  const [v, setV] = useState({ titulo: initial?.titulo || "", descricao: initial?.descricao || "", url: initial?.url || "" });
  const [remover, setRemover] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, run] = useSubmit(onSubmit, setErrors);
  const set = (k) => (val) => { setV((s) => ({ ...s, [k]: val })); setErrors((s) => ({ ...s, [k]: undefined, pdf: undefined })); };

  const submit = (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    const E = {};
    if (v.titulo.trim().length < 2) E.titulo = "Informe o título (mínimo 2 caracteres).";
    if (file && !/\.pdf$/i.test(file.name)) E.pdf = "Envie apenas ficheiros PDF.";
    else if (file && file.size > MAX_PDF_BYTES) E.pdf = `O PDF excede ${MAX_PDF_BYTES / 1048576} MB.`;
    const keeps = Boolean(file) || (Boolean(initial?.arquivo) && !remover);
    if (!E.pdf && !keeps && !v.url.trim()) E.pdf = "Envie um PDF ou informe um link.";
    if (Object.keys(E).length) return setErrors(E);

    const fd = new FormData();
    fd.append("titulo", v.titulo.trim());
    fd.append("descricao", v.descricao.trim());
    fd.append("url", v.url.trim());
    if (file) fd.append("pdf", file, file.name);
    if (remover) fd.append("removerArquivo", "1");
    run(fd);
  };

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <Field id={`${uid}-titulo`} name="titulo" label="Título do catálogo" required full value={v.titulo} error={errors.titulo}
             onChange={set("titulo")} placeholder="Ex.: Linha Gamer 2026" maxLength={120} />
      <Field id={`${uid}-descricao`} name="descricao" label="Descrição" full value={v.descricao}
             onChange={set("descricao")} placeholder="Opcional" maxLength={300} />
      <div className="field">
        <label htmlFor={`${uid}-pdf`}>Ficheiro PDF</label>
        <input id={`${uid}-pdf`} ref={fileRef} type="file" accept="application/pdf,.pdf"
               onChange={() => setErrors((s) => ({ ...s, pdf: undefined }))} />
        {initial?.arquivo && (
          <label className="adm-check">
            <input type="checkbox" checked={remover} onChange={(e) => setRemover(e.target.checked)} /> Remover o PDF atual
          </label>
        )}
        {errors.pdf && <p className="field-error" role="alert">{errors.pdf}</p>}
      </div>
      <Field id={`${uid}-url`} name="url" label="…ou link externo" type="url" value={v.url} error={errors.url}
             onChange={set("url")} placeholder="https://..." maxLength={500} />
      <div className="form-actions">
        <button type="submit" className="btn btn--solid" disabled={saving}>{saving ? "A guardar..." : submitLabel}</button>
        <button type="button" className="btn btn--outline" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
