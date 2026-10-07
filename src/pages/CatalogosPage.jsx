import Header from "../components/Header";
import Catalogos from "../components/Catalogos";
import Footer from "../components/Footer";

export default function CatalogosPage() {
  return (
    <div className="catalog-page">
      <Header />
      <main style={{ paddingTop: 76 }}>
        <Catalogos showCatalogPageLink={false} />
      </main>
      <Footer />
    </div>
  );
}
