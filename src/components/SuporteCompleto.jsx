import { CompassIcon, SupportIcon, ArrowRightIcon } from "./ui/Icons";
import { IMAGES } from "../data/site";
import { hideOnError } from "../utils/helpers";
import { handleAnchorClick } from "../utils/scroll";

const PRE_SALE = [
  { title: "Consultoria técnica", text: "Apoio na escolha e dimensionamento de componentes para o seu projeto." },
  { title: "Projetos sob medida", text: "Especificações e propostas técnicas completas para licitações e empresas." },
  { title: "Setor de licitações dedicado", text: "Equipe especializada em editais e processos com órgãos públicos." },
];

const POST_SALE = [
  { title: "Assistência técnica própria", text: "Departamento interno de manutenção com diagnóstico em 48h." },
  { title: "Rede credenciada", text: "Assistências autorizadas em outros estados para atendimento mais rápido." },
  { title: "Chamados com protocolo", text: "Acompanhamento ágil de cada solicitação até a solução." },
];

const MINI_SERVICES = [
  { num: "S.01", title: "Assistência autorizada", text: "Manutenção dentro das normas do fabricante, com peças originais." },
  { num: "S.02", title: "Manutenção preventiva", text: "Planos programados com relatórios técnicos periódicos." },
  { num: "S.03", title: "Consultoria em TI", text: "Especificação e dimensionamento de equipamentos e projetos." },
  { num: "S.04", title: "Infraestrutura", text: "Implantação de laboratórios, redes e estações de trabalho." },
];

function SupportBlock({ code, tag, title, intro, items, Icon }) {
  return (
    <article className="support-block" data-code={code}>
      <span className="support-block__tag">{tag}</span>
      <h3>{title}</h3>
      <p>{intro}</p>
      <ul className="support-block__list">
        {items.map((i) => (
          <li key={i.title}>
            <Icon size={19} />
            <span><b>{i.title}</b>{i.text}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function SuporteCompleto() {
  return (
    <section className="suporte" id="servicos">
      <div className="bg-layer" aria-hidden="true">
        <img src={IMAGES.suporte} alt="" loading="lazy" onError={hideOnError} />
        <div className="bg-overlay-light" />
      </div>

      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--dark"><span className="eyebrow__bar" />Acompanhamento de ponta a ponta</p>
            <h2 className="section-title">Suporte completo,<br />antes e depois da venda</h2>
          </div>
          <p className="suporte-lead">
            Cumprimento rigoroso da SLA (Service Level Agreement). Garanta tempos
            de resposta rápidos para chamados e resolução de problemas.
          </p>
        </div>

        <div className="suporte-grid">
          <SupportBlock
            code="PRE" tag="Antes da venda" title="Pré-venda" Icon={CompassIcon} items={PRE_SALE}
            intro="Consultoria técnica na escolha de componentes e projetos sob medida para licitações e empresas — do levantamento de requisitos à proposta técnica."
          />
          <SupportBlock
            code="POS" tag="Depois da venda" title="Pós-venda" Icon={SupportIcon} items={POST_SALE}
            intro="Assistência técnica própria, rede credenciada de suporte e agilidade no atendimento de chamados — seu equipamento nunca fica sem resposta."
          />
        </div>

        <div className="services-mini">
          {MINI_SERVICES.map((s) => (
            <article key={s.num} className="service-mini">
              <p className="service-mini__num">{s.num}</p>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </article>
          ))}
        </div>

        <div className="suporte-cta">
          <div>
            <h3>Precisa de assistência para o seu equipamento?</h3>
            <p>Abra um chamado técnico e receba um protocolo — nossa equipe responde no horário comercial.</p>
          </div>
          <a href="#suporte" className="btn btn--accent" onClick={(e) => handleAnchorClick(e, "#suporte")}>Abrir chamado técnico<ArrowRightIcon size={15} /></a>
        </div>
      </div>
    </section>
  );
}
