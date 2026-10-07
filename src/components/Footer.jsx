import { Fragment } from "react";
import BrandLogo from "./ui/BrandLogo";
import { PhoneIcon, MailIcon, PinIcon } from "./ui/Icons";
import { COMPANY, NAV } from "../data/site";
import { handleAnchorClick } from "../utils/scroll";

export default function Footer() {
  return (
    <footer className="site-footer dark-zone">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="#inicio" aria-label="Fulltech Equipamentos — Início" onClick={(e) => handleAnchorClick(e, "#inicio")}>
            <BrandLogo footer />
          </a>
          <div className="footer-hours">
            <b>Horário de atendimento</b>
            Vendas: {COMPANY.hoursSales}<br />
            Suporte: {COMPANY.hoursSupport}
          </div>
        </div>
        <div>
          <h3 className="footer-heading">Contato</h3>
          <ul className="footer-contact">
            <li><PhoneIcon size={16} /><span>{COMPANY.phone}</span></li>
            <li><MailIcon size={16} /><span>{COMPANY.email}</span></li>
            <li>
              <PinIcon size={16} />
              <span>{COMPANY.address.map((l, i) => <Fragment key={i}>{l}<br /></Fragment>)}</span>
            </li>
          </ul>
        </div>
        <nav className="footer-links" aria-label="Navegação do rodapé">
          <h3 className="footer-heading">Navegação</h3>
          {NAV.map((i) => (
            <a key={i.label} href={i.href} style={{ display: "block" }} onClick={(e) => handleAnchorClick(e, i.href)}>{i.label}</a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom__inner">
          <span>{COMPANY.legalName} · CNPJ {COMPANY.cnpj}</span>
          <span>© {new Date().getFullYear()} · Todos os direitos reservados</span>
        </div>
      </div>
    </footer>
  );
}
