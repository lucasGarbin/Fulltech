import { useEffect, useState } from "react";
import { ArrowRightIcon } from "./ui/Icons";
import { getIcon, DEFAULT_CATEGORIAS } from "../data/catalogIcons";
import useCatalogos from "../hooks/useCatalogos";
import { fileUrl } from "../services/catalogos";

function CatalogoLink({ item }) {
  const href = fileUrl(item.arquivo) || item.url;
  if (!href) return null;
  return (
    <a href={href} className="catalog-cat__link" target="_blank" rel="noopener noreferrer"
      aria-label={`${item.arquivo ? "Baixar PDF" : "Abrir catálogo"}: ${item.titulo}`}>
      {item.arquivo ? "Baixar PDF" : "Abrir catálogo"}<ArrowRightIcon size={13} />
    </a>
  );
}

export default function Catalogos({ showCatalogPageLink = true, showCategoryLinks = true }) {
  const { categorias, error } = useCatalogos({ fallback: DEFAULT_CATEGORIAS });
  const list = categorias ?? DEFAULT_CATEGORIAS;

  /* null = fechado | "all" = todos | id = só essa categoria */
  const [view, setView] = useState(null);
  const toggle = (v) => setView((cur) => (cur === v ? null : v));

  useEffect(() => {
    if (view) document.getElementById("catalogo-lista")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [view]);

  const groups = view === "all" ? list : list.filter((c) => c.id === view);

  return (
    <section className="catalog" id="catalogo">
      <div className="container">
        <div className="catalog-copy">
          <p className="eyebrow eyebrow--dark"><span className="eyebrow__bar" />Catálogo</p>
          <h2 className="section-title">Catálogo Fulltech</h2>
          <p>
            Explore nossa linha completa de produtos e soluções organizadas por categoria.
            Cada catálogo reúne especificações técnicas e informações prontas para
            o seu projeto ou processo de licitação.
          </p>
          {error && <p className="catalog-empty" role="alert">Não foi possível carregar os catálogos do Supabase: {error}</p>}
          {showCatalogPageLink && (
            <a href="/catalogos" className="btn btn--accent">
              Ver todos os catálogos<ArrowRightIcon size={15} />
            </a>
          )}
        </div>

        <div className="catalog-grid">
          {list.map((c) => {
            const { Icon } = getIcon(c.icone);
            const isActive = view === c.id;
            return (
              <article key={c.id} className="catalog-cat">
                <span className="catalog-cat__icon"><Icon size={20} /></span>
                <h3>{c.nome}</h3>
                <p>{c.descricao}</p>
                {showCategoryLinks && (
                  <button
                    type="button"
                    className="catalog-cat__link"
                    aria-expanded={isActive}
                    aria-controls="catalogo-lista"
                    onClick={() => toggle(c.id)}
                  >
                    {isActive ? "Fechar" : "Ver catálogos"}<ArrowRightIcon size={13} />
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {view && (
          <div className="catalog-panel" id="catalogo-lista">
            <div className="catalog-panel__head">
              <h3>{view === "all" ? "Todos os catálogos" : groups[0]?.nome}</h3>
              <button type="button" className="btn btn--outline" onClick={() => setView(null)}>Fechar</button>
            </div>
            {groups.map((g) => (
              <div key={g.id} className="catalog-group">
                {view === "all" && <h4>{g.nome}</h4>}
                {g.catalogos.length === 0 && <p className="catalog-empty">Nenhum catálogo disponível nesta categoria ainda.</p>}
                {g.catalogos.map((item) => (
                  <div key={item.id} className="catalog-item">
                    <div><b>{item.titulo}</b>{item.descricao && <span>{item.descricao}</span>}</div>
                    <CatalogoLink item={item} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
