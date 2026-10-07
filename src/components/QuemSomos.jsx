import { ShieldIcon, CheckIcon, SupportIcon } from "./ui/Icons";
import { IMAGES } from "../data/site";
import { hideOnError } from "../utils/helpers";

const PILLARS = [
  { icon: <ShieldIcon size={24} />, title: "Qualidade", description: "Equipamentos de marcas reconhecidas e alto desempenho." },
  { icon: <CheckIcon size={24} />, title: "Confiabilidade", description: "Compromisso com prazos e entregas seguras." },
  { icon: <SupportIcon size={24} />, title: "Atendimento", description: "Equipe especializada para apoiar sempre." },
];

export default function QuemSomos() {
  return (
    <section className="company">
      <div className="container company-inner">
        <div className="company-media">
          <figure className="media-frame">
            <img src={IMAGES.capaCatalogo} alt="Capa do catálogo Fulltech" loading="lazy" onError={hideOnError} />
            <figcaption className="media-frame__label">
              <b>Ambientes corporativos</b>
              <small>Projetos e implantação</small>
            </figcaption>
          </figure>
        </div>
        <div className="company-copy">
          <p className="eyebrow eyebrow--dark"><span className="eyebrow__bar" />Quem somos</p>
          <h2 className="section-title">Qualidade, confiabilidade<br />e atendimento em todas as etapas.</h2>
          <p className="company-text">
            A Fulltech Equipamentos Ltda é uma empresa brasileira especializada na
            comercialização de equipamentos de informática e soluções corporativas,
            atendendo empresas privadas e órgãos públicos em todo o território nacional.
          </p>
        </div>
        <ul className="company-pillars">
          {PILLARS.map((p) => (
            <li key={p.title} className="pillar">
              <span className="pillar__icon">{p.icon}</span>
              <div>
                <h3 className="pillar__title">{p.title}</h3>
                <p className="pillar__description">{p.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
