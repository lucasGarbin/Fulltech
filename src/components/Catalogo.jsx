import { GamepadIcon, BlueprintIcon, BuildingIcon, GradCapIcon, ArrowRightIcon } from "./ui/Icons";
import { CATALOG_URL } from "../data/site";
import { preventPlaceholder } from "../utils/scroll";

const CATEGORIES = [
  { icon: <GamepadIcon size={20} />, title: "Gamer", text: "Computadores de alta performance para jogos e streaming." },
  { icon: <BlueprintIcon size={20} />, title: "Projetos Especiais", text: "Soluções sob medida para licitações e demandas técnicas." },
  { icon: <BuildingIcon size={20} />, title: "Corporativo", text: "Equipamentos para escritórios e ambientes empresariais." },
  { icon: <GradCapIcon size={20} />, title: "Educacional", text: "Laboratórios e soluções para instituições de ensino." },
];

export default function Catalogo() {
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
        </div>

        <div className="catalog-grid">
          {CATEGORIES.map((c) => (
            /* TODO: href de cada categoria quando os catálogos existirem */
            <a key={c.title} href="#" className="catalog-cat" onClick={preventPlaceholder}>
              <span className="catalog-cat__icon">{c.icon}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
