import { DesktopIcon, MonitorIcon, WorkstationIcon, PrinterIcon } from "./ui/Icons";
import { IMAGES } from "../data/site";
import { hideOnError } from "../utils/helpers";

/* blend: aplica mix-blend-mode: multiply (imagens com fundo branco) */
const PRODUCTS = [
  { icon: <DesktopIcon size={20} />, title: "Computadores", description: "Desempenho e confiabilidade para o dia a dia da sua operação.", img: IMAGES.computadores, alt: "Computador Fulltech — gabinete", blend: true },
  { icon: <MonitorIcon size={20} />, title: "Monitores", description: "Mais produtividade com imagens de alta definição.", img: IMAGES.monitores, alt: "Monitor", blend: true },
  { icon: <WorkstationIcon size={20} />, title: "Workstations", description: "Alto desempenho para projetos que exigem mais.", img: IMAGES.Workstations, alt: "Workstations", blend: true },
  { icon: <PrinterIcon size={20} />, title: "Impressoras", description: "Impressão robusta e econômica para grandes volumes.", img: IMAGES.impressoras, alt: "Impressora", blend: true },
];

function ProductCard({ icon, title, description, img, alt, blend }) {
  return (
    <article className="product-card">
      <div className={`product-card__media ${blend ? "product-card__media--blend" : ""}`}>
        <img src={img} alt={alt} loading="lazy" onError={hideOnError} />
        <span className="product-card__code">{title.toUpperCase()}</span>
      </div>
      <div className="product-card__body">
        <div className="product-card__heading">
          <span className="product-card__icon">{icon}</span>
          <h3 className="product-card__title">{title}</h3>
        </div>
        <p className="product-card__description">{description}</p>
      </div>
    </article>
  );
}

export default function Equipamentos() {
  return (
    <section className="products" id="produtos">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--dark"><span className="eyebrow__bar" />Produtos e soluções</p>
            <h2 className="section-title">Equipamentos e soluções<br />para cada necessidade</h2>
          </div>
          <p className="section-lead">
            Trabalhamos com as melhores marcas e tecnologias, fornecendo equipamentos de alto
            desempenho, com foco em qualidade, suporte e custo-benefício.
          </p>
        </div>
        <div className="products-grid">
          {PRODUCTS.map((p) => <ProductCard key={p.title} {...p} />)}
        </div>
      </div>
    </section>
  );
}
