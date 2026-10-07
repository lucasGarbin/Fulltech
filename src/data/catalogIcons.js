import {
  GamepadIcon, BlueprintIcon, BuildingIcon, GradCapIcon, DesktopIcon,
  MonitorIcon, WorkstationIcon, PrinterIcon, ShieldIcon, SupportIcon,
} from "../components/ui/Icons";

/* chave (guardada no backend) → rótulo + ícone. Mantém igual a ICONES em backend/catalogoRules.js */
export const ICONS = {
  gamepad: { label: "Comando de jogo", Icon: GamepadIcon },
  blueprint: { label: "Prancheta / projeto", Icon: BlueprintIcon },
  building: { label: "Prédio / corporativo", Icon: BuildingIcon },
  gradcap: { label: "Capelo / educação", Icon: GradCapIcon },
  desktop: { label: "Computador", Icon: DesktopIcon },
  monitor: { label: "Monitor", Icon: MonitorIcon },
  workstation: { label: "Workstation", Icon: WorkstationIcon },
  printer: { label: "Impressora", Icon: PrinterIcon },
  shield: { label: "Segurança", Icon: ShieldIcon },
  support: { label: "Suporte", Icon: SupportIcon },
};
export const getIcon = (key) => ICONS[key] || ICONS.desktop;

/* Mostrado enquanto o backend não responde (ou está offline) */
export const DEFAULT_CATEGORIAS = [
  { id: "gamer", nome: "Gamer", descricao: "Computadores de alta performance para jogos e streaming.", icone: "gamepad", catalogos: [] },
  { id: "projetos", nome: "Projetos Especiais", descricao: "Soluções sob medida para licitações e demandas técnicas.", icone: "blueprint", catalogos: [] },
  { id: "corporativo", nome: "Corporativo", descricao: "Equipamentos para escritórios e ambientes empresariais.", icone: "building", catalogos: [] },
  { id: "educacional", nome: "Educacional", descricao: "Laboratórios e soluções para instituições de ensino.", icone: "gradcap", catalogos: [] },
];
