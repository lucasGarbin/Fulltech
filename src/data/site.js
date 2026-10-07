/* Configurações globais e dados do site */

export const STORE_URL = "https://shop.fulltechequipamentos.com.br";
/* TODO: apontar para a página/PDF dos catálogos */
export const CATALOG_URL = "/catalogos";

export const IMAGES = {
  logo: "/assets/logo.png",
  computadores: "/assets/Gabinete.jpg",
  monitores: "/assets/monitor.avif",
  Workstations: "/assets/produtos/Workstations.png",
  impressoras: "/assets/produtos/impressoras.png",
  suporte: "/assets/Servido_branco_de_fundo.png",
  sede: "/assets/bancada.jpg",
  capaCatalogo: "/assets/produtos/Capa_do_catalogo_Fulltech.png",
};

export const COMPANY = {
  legalName: "Fulltech Equipamentos Ltda",
  cnpj: "19.554.960/0001-21",
  phone: "(49) 3442-3527",
  phoneHref: "tel:+554934423527",
  email: "contato@fulltechequipamentos.com.br",
  address: ["Rua Henrique Franzosi, 101 — Bairro Sunti", "CEP 89708-009 · Concórdia/SC"],
  hoursSales: "Segunda a sexta · 8h às 17h",
  hoursSupport: "Segunda a sexta · 8h às 17h",
};

export const NAV = [
  { label: "Início", href: "#inicio" },
  { label: "Produtos", href: "#produtos" },
  { label: "Catálogos", href: "/catalogos" },
  { label: "Serviços", href: "#servicos" },
  { label: "Suporte", href: "#suporte" },
  { label: "Contato", href: "#contato" },
  { label: "Empresa", href: "#empresa" },
];
