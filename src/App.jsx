import { useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Marcas from "./components/Marcas";
import Equipamentos from "./components/Equipamentos";
import SuporteCompleto from "./components/SuporteCompleto";
import ChamadoTecnico from "./components/ChamadoTecnico";
import Contato from "./components/Contato";
import Empresa from "./components/Empresa";
import Footer from "./components/Footer";
import AdminCatalogos from "./components/admin/AdminCatalogos";
import CatalogosPage from "./pages/CatalogosPage";
import useRoute from "./hooks/useRoute";
import { scrollToHash } from "./utils/scroll";
import Catalogos from "./Catalogos";

export default function App() {
  const { isCatalogos, isAdmin, isHome, hash } = useRoute();

  useEffect(() => {
    if (isAdmin || isCatalogos) {
      window.scrollTo(0, 0);
    } else if (isHome && hash && hash.startsWith("#")) {
      setTimeout(() => scrollToHash(hash), 50);
    }
  }, [isAdmin, isCatalogos, isHome, hash]);

  if (isAdmin) return <AdminCatalogos />;
  if (isCatalogos) return <CatalogosPage />;

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marcas />
        <Equipamentos />
        <Catalogos showCategoryLinks={false} />
        <SuporteCompleto />
        <ChamadoTecnico />
        <Contato />
        <Empresa />
      </main>
      <Footer />
    </>
  );
}
