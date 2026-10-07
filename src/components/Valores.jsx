/* Missão, Visão e Valores */
const VALUES = [
  { num: "V.01", title: "Ética", text: "Valorizamos o respeito, a transparência e a honestidade em todas as nossas relações internas e externas." },
  { num: "V.02", title: "Comprometimento", text: "Somos apaixonados pelo que fazemos. Agimos com lealdade, pertencimento e dedicação total aos objetivos dos nossos clientes." },
  { num: "V.03", title: "Inovação", text: "Acreditamos que a evolução constante dos produtos, processos e modelos de negócio é essencial. Incentivamos a criatividade e a melhoria contínua." },
];

export default function Valores() {
  return (
    <section className="mvv">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow eyebrow--dark"><span className="eyebrow__bar" />Diretrizes corporativas</p>
            <h2 className="section-title">Missão, visão<br />e valores</h2>
          </div>
          <p className="section-lead">
            Os princípios que orientam cada projeto, cada atendimento e cada
            decisão da Fulltech Equipamentos.
          </p>
        </div>

        <div className="mvv-grid">
          <article className="mvv-card">
            <p className="mvv-card__tag">Missão</p>
            <h3>Ser a grande referência</h3>
            <p>
              Ser a grande referência no mercado de tecnologia, oferecendo agilidade
              no atendimento, suporte de excelência e inovações constantes para
              impulsionar o sucesso dos nossos clientes.
            </p>
          </article>
          <article className="mvv-card">
            <p className="mvv-card__tag">Visão</p>
            <h3>Soluções inteligentes</h3>
            <p>
              Entregar soluções inteligentes e personalizadas em produtos e serviços,
              permitindo que empresas alcancem sua máxima performance por meio da
              inovação, tecnologia e ética.
            </p>
          </article>
        </div>

        <div className="mvv-values">
          {VALUES.map((v) => (
            <article key={v.num} className="mvv-value">
              <p className="mvv-value__num">{v.num}</p>
              <h4>{v.title}</h4>
              <p>{v.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
