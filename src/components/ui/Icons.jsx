const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

function Svg({ size = 20, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...base} {...rest}>
      {children}
    </svg>
  );
}

export const DesktopIcon = (p) => <Svg {...p}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M9 20h6M12 16v4" /></Svg>;
export const MonitorIcon = (p) => <Svg {...p}><rect x="2.5" y="4" width="19" height="13" rx="1.5" /><path d="M8 21h8M12 17v4" /></Svg>;
export const WorkstationIcon = (p) => <Svg {...p}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h6M9 11h6M9 15h3" /></Svg>;
export const PrinterIcon = (p) => <Svg {...p}><path d="M7 8V3h10v5" /><rect x="3" y="8" width="18" height="8" rx="1.5" /><rect x="7" y="13" width="10" height="8" /></Svg>;
export const ShieldIcon = (p) => <Svg {...p}><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" /><path d="M9.5 12l2 2 3.5-4" /></Svg>;
export const SupportIcon = (p) => <Svg {...p}><path d="M4 13a8 8 0 0 1 16 0" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M19 19a3 3 0 0 1-3 3h-3" /></Svg>;
export const GamepadIcon = (p) => <Svg {...p}><rect x="2.5" y="7" width="19" height="11" rx="5" /><path d="M7 11v4M5 13h4M16 11.5v.01M18.5 14v.01" /></Svg>;
export const BlueprintIcon = (p) => <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="1.5" /><path d="M3 9h18M9 9v12" /><path d="m13 15 2 2 4-4" /></Svg>;
export const BuildingIcon = (p) => <Svg {...p}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" /></Svg>;
export const GradCapIcon = (p) => <Svg {...p}><path d="m2 9 10-5 10 5-10 5-10-5z" /><path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" /><path d="M22 9v6" /></Svg>;
export const PhoneIcon = (p) => <Svg {...p}><path d="M22 16.9v2a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 4.2 2 2 0 0 1 5.1 2h2a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" /></Svg>;
export const MailIcon = (p) => <Svg {...p}><rect x="2.5" y="4.5" width="19" height="15" rx="2" /><path d="m3 7 9 6 9-6" /></Svg>;
export const PinIcon = (p) => <Svg {...p}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></Svg>;
export const MenuIcon = (p) => <Svg {...p}><path d="M3 7h18M3 12h18M3 17h18" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M18 6 6 18M6 6l12 12" /></Svg>;
export const PaperclipIcon = (p) => <Svg {...p}><path d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 5a3.5 3.5 0 0 1 5 5L10.5 18.5a2 2 0 0 1-3-3L15 8" /></Svg>;
export const CheckIcon = (p) => <Svg {...p}><path d="M20 6 9 17l-5-5" /></Svg>;
export const ClockIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
export const ArrowRightIcon = (p) => <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>;
export const CompassIcon = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-5 2 2-5 5-2z" /></Svg>;
