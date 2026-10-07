import { useEffect, useState } from "react";
import BrandLogo from "./ui/BrandLogo";
import { CloseIcon, MenuIcon } from "./ui/Icons";
import { NAV, STORE_URL } from "../data/site";
import { handleAnchorClick } from "../utils/scroll";

const storeLinkProps = { href: STORE_URL, target: "_blank", rel: "noopener noreferrer" };

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const onResize = () => { if (window.innerWidth > 920) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (e, href) => handleAnchorClick(e, href, () => setOpen(false));
  const onNavClick = (e, href) => {
    if (href.startsWith("/")) {
      setOpen(false);
      return;
    }
    go(e, href);
  };

  return (
    <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
      <div className="container header-inner">
        <a href="#inicio" className="brand" aria-label="Fulltech Equipamentos — Início" onClick={(e) => go(e, "#inicio")}>
          <BrandLogo />
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          {NAV.map((i) => (
            <a key={i.label} href={i.href} className="main-nav__link" onClick={(e) => onNavClick(e, i.href)}>{i.label}</a>
          ))}
        </nav>
        <a {...storeLinkProps} className="btn btn--accent header-cta">Loja</a>
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Menu móvel">
          <div><BrandLogo /></div>
          {NAV.map((i) => (
            <a key={i.label} href={i.href} className="mobile-nav__link" onClick={(e) => onNavClick(e, i.href)}>{i.label}</a>
          ))}
          <a {...storeLinkProps} className="btn btn--accent" onClick={() => setOpen(false)}>Loja</a>
        </nav>
      )}
    </header>
  );
}
