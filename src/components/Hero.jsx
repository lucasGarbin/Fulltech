import HeroDiagram from "./HeroDiagram";

const HERO_STATS = [
  { value: "2014", label: "Ano de fundação" },
  { value: "100%", label: "Capital nacional" },
  { value: "SC", label: "Sede — Concórdia" },
];

export default function Hero() {
  return (
    <section className="hero dark-zone" id="inicio">
      <div className="container hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow__bar" />Fabricante · Integralizadora de TI — desde 2014</p>
          <h1 className="hero-title">
            Tecnologia<br />
            montada <span className="outline">à</span><br />
            <span className="outline">medida do</span><br />
            seu negócio
          </h1>
          <p className="hero-subtitle">
            Computadores, estações de trabalho e projetos especiais de informática,
            projetados, montados e testados em Concórdia/SC — para os mercados
            corporativo público, privado e educacional.
          </p>
        </div>

        <div className="hero-media">
          <p className="hero-note">Equipamentos confiáveis<br />para grandes resultados</p>
          <HeroDiagram />
        </div>
      </div>

      <div className="container hero-stats">
        {HERO_STATS.map((s) => (
          <div key={s.label} className="hero-stat">
            <b>{s.value}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
