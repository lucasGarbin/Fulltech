import { useEffect, useMemo, useState } from "react";
import { navigate } from "../../hooks/useRoute";
import Field from "../ui/Field";
import { CategoriaForm, CatalogoForm } from "./AdminForms";
import { getIcon } from "../../data/catalogIcons";
import useCatalogos from "../../hooks/useCatalogos";
import { filterCategorias } from "../../utils/search";
import { showToast } from "../../utils/toast";
import {
  getAdminSession, login, logout, errorText, fileUrl,
  createCategoria, updateCategoria, deleteCategoria,
  createCatalogo, updateCatalogo, deleteCatalogo,
} from "../../services/catalogos";

const goSite = (e) => {
  e.preventDefault();
  navigate("/#inicio");
};

/* ---------------- Login ---------------- */
function AdminLogin({ onLogin, initialError = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) return setError("Informe o e-mail e a senha.");
    setBusy(true);
    try {
      await login(email.trim(), password);
      onLogin();
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <div className="adm">
      <div className="adm-card adm-card--pad adm-login">
        <h1 className="adm-h">Administração de catálogos</h1>
        <form onSubmit={submit} noValidate>
          <Field id="adm-email" name="email" type="email" label="E-mail" required autoComplete="username"
                 value={email} onChange={(v) => { setEmail(v); setError(""); }} />
          <Field id="adm-password" name="password" type="password" label="Senha de acesso" required autoComplete="current-password"
                 value={password} onChange={(v) => { setPassword(v); setError(""); }} />
          {error && <p className="adm-error" role="alert">{error}</p>}
          <div className="form-actions" style={{ marginTop: 18 }}>
            <button type="submit" className="btn btn--solid" disabled={busy}>{busy ? "A entrar..." : "Entrar"}</button>
            <a href="/#inicio" className="btn btn--outline" onClick={goSite}>Voltar ao site</a>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Uma categoria (pai) com os seus catálogos (filhos) ---------------- */
function CategoriaItem({ categoria: c, searching, run }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const expanded = open || searching;
  const { Icon } = getIcon(c.icone);

  const remove = (fn, msg, ok) => { if (window.confirm(msg)) run(fn, ok).catch((e) => showToast(errorText(e))); };

  return (
    <section className="adm-card">
      <div className="adm-cat__head">
        <button type="button" className="adm-cat__toggle" aria-expanded={expanded} onClick={() => setOpen((v) => !v)}>
          <span className="adm-ico"><Icon size={20} /></span>
          <span>
            <b>{c.nome}</b>
            <small>{c.descricao || "Sem descrição"}</small>
          </span>
          <span className="adm-badge">
            {searching && c.total !== c.catalogos.length ? `${c.catalogos.length} de ${c.total}` : c.catalogos.length}{" "}
            {c.total === 1 ? "catálogo" : "catálogos"}
          </span>
        </button>
        <div className="adm-btns">
          <button type="button" className="btn btn--accent adm-sm" onClick={() => { setOpen(true); setAdding(true); setEditing(false); }}>+ Catálogo</button>
          <button type="button" className="btn btn--outline adm-sm" onClick={() => setEditing((v) => !v)}>Editar</button>
          <button type="button" className="btn btn--outline adm-sm adm-danger"
                  onClick={() => remove(() => deleteCategoria(c.id),
                    `Excluir a categoria "${c.nome}"${c.total ? ` e os seus ${c.total} catálogo(s)` : ""}?`, "Categoria excluída.")}>Excluir</button>
        </div>
      </div>

      {editing && (
        <div className="adm-sub">
          <CategoriaForm initial={c} submitLabel="Guardar alterações" onCancel={() => setEditing(false)}
            onSubmit={async (body) => { await run(() => updateCategoria(c.id, body), "Categoria atualizada."); setEditing(false); }} />
        </div>
      )}

      {expanded && (
        <div className="adm-sub">
          {adding && (
            <div className="adm-card adm-card--pad">
              <h3 className="adm-h">Novo catálogo em “{c.nome}”</h3>
              <CatalogoForm submitLabel="Adicionar catálogo" onCancel={() => setAdding(false)}
                onSubmit={async (fd) => { await run(() => createCatalogo(c.id, fd), "Catálogo adicionado."); setAdding(false); }} />
            </div>
          )}
          {c.catalogos.length === 0 && !adding && <p className="adm-empty">{searching ? "Nenhum catálogo corresponde à busca." : "Ainda não há catálogos nesta categoria."}</p>}
          {c.catalogos.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="adm-card adm-card--pad">
                <CatalogoForm initial={item} submitLabel="Guardar alterações" onCancel={() => setEditingId(null)}
                  onSubmit={async (fd) => { await run(() => updateCatalogo(item.id, fd), "Catálogo atualizado."); setEditingId(null); }} />
              </div>
            ) : (
              <div key={item.id} className="adm-row">
                <div>
                  <b>{item.titulo}</b>
                  {item.descricao && <small>{item.descricao}</small>}
                  <span className="adm-tags">
                    {item.arquivo && <a href={fileUrl(item.arquivo)} target="_blank" rel="noopener noreferrer" className="adm-badge">PDF</a>}
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="adm-badge">Link</a>}
                  </span>
                </div>
                <div className="adm-btns">
                  <button type="button" className="btn btn--outline adm-sm" onClick={() => setEditingId(item.id)}>Editar</button>
                  <button type="button" className="btn btn--outline adm-sm adm-danger"
                          onClick={() => remove(() => deleteCatalogo(item.id), `Excluir o catálogo "${item.titulo}"?`, "Catálogo excluído.")}>Excluir</button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* ---------------- Painel ---------------- */
function AdminPanel({ onLogout }) {
  const { categorias, error, reload, loading } = useCatalogos();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  /* Executa uma alteração, recarrega a lista e avisa. Sessão expirada → volta ao login. */
  const run = async (fn, okMsg) => {
    try {
      await fn();
    } catch (err) {
      if (err.status === 401) {
        showToast("Sessão expirada. Entre novamente.");
        try { await onLogout(); } catch (logoutError) { showToast(errorText(logoutError)); }
        return;
      }
      throw err; /* os formulários mostram o erro */
    }
    await reload();
    if (okMsg) showToast(okMsg);
  };

  const searching = query.trim().length > 0;
  const visible = useMemo(() => filterCategorias(categorias || [], query), [categorias, query]);
  const totalItems = visible.reduce((n, c) => n + c.catalogos.length, 0);

  return (
    <div className="adm">
      <header className="adm-bar">
        <div className="container">
          <h1>Catálogos · Administração</h1>
          <div className="adm-actions">
            <a href="/#inicio" className="btn btn--ghost" onClick={goSite}>Ver site</a>
            <button type="button" className="btn btn--ghost" onClick={() => onLogout().catch((err) => showToast(errorText(err)))}>Sair</button>
          </div>
        </div>
      </header>

      <main className="container adm-main">
        <div className="adm-toolbar">
          <div className="field adm-search">
            <label htmlFor="adm-q">Buscar categorias e catálogos</label>
            <input id="adm-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder="Digite para filtrar em tempo real..." autoComplete="off" />
          </div>
          <button type="button" className="btn btn--accent" onClick={() => setCreating((v) => !v)}>
            {creating ? "Cancelar" : "+ Nova categoria"}
          </button>
        </div>

        {creating && (
          <div className="adm-card adm-card--pad">
            <h2 className="adm-h">Nova categoria</h2>
            <CategoriaForm submitLabel="Criar categoria" onCancel={() => setCreating(false)}
              onSubmit={async (body) => { await run(() => createCategoria(body), "Categoria criada."); setCreating(false); }} />
          </div>
        )}

        {error && (
          <p className="adm-error" role="alert">{error} <button type="button" className="adm-linkbtn" onClick={reload}>Tentar novamente</button></p>
        )}

        <p className="adm-count" aria-live="polite">
          {loading ? "A carregar..." : searching
            ? `${visible.length} categoria(s) e ${totalItems} catálogo(s) encontrados`
            : `${visible.length} categoria(s)`}
          {searching && <button type="button" className="adm-linkbtn" onClick={() => setQuery("")}>Limpar busca</button>}
        </p>

        {visible.map((c) => <CategoriaItem key={c.id} categoria={c} searching={searching} run={run} />)}
        {!loading && !visible.length && !error && <p className="adm-empty">{searching ? "Nada encontrado para essa busca." : "Ainda não há categorias. Crie a primeira."}</p>}
      </main>
    </div>
  );
}

export default function AdminCatalogos() {
  const [auth, setAuth] = useState({ loading: true, authed: false, error: "" });

  useEffect(() => {
    let active = true;
    getAdminSession()
      .then((authed) => { if (active) setAuth({ loading: false, authed, error: "" }); })
      .catch((err) => { if (active) setAuth({ loading: false, authed: false, error: errorText(err) }); });
    return () => { active = false; };
  }, []);

  if (auth.loading) {
    return <div className="adm"><div className="adm-card adm-card--pad adm-login"><h1 className="adm-h">A verificar acesso...</h1></div></div>;
  }
  if (!auth.authed) {
    return <AdminLogin
      initialError={auth.error}
      onLogin={() => setAuth({ loading: false, authed: true, error: "" })}
    />;
  }
  return (
    <AdminPanel
      onLogout={async () => {
        await logout();
        setAuth({ loading: false, authed: false, error: "" });
      }}
    />
  );
}
