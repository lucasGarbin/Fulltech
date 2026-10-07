const BRANDS = ["Intel", "AMD", "Dell", "Samsung", "LG", "K-MEX"];

export default function Marcas() {
  return (
    <section className="brands" aria-label="Marcas parceiras">
      <div className="container brands-inner">
        <span className="brands-label">Marcas que comercializamos</span>
        <div className="brands-carousel">
          <div className="brands-track">
            {[0, 1].map((copy) => (
              <div className="brands-group" key={copy} aria-hidden={copy === 1}>
                {BRANDS.map((brand) => (
                  <span key={brand} className="brand-logo-txt" title={brand}>
                    {brand}<small>Parceiro</small>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
