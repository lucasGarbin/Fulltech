import { useState } from "react";
import { IMAGES } from "../../data/site";

/* Logo com fallback textual caso /assets/logo-claro.png ainda não exista */
export default function BrandLogo({ footer = false }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span className="brand-name">FULLTECH</span>
        <span className="brand-tag">Equipamentos Ltda</span>
      </span>
    );
  }

  return (
    <img
      src={IMAGES.logo}
      alt="Logo Fulltech Equipamentos"
      className={`brand-logo-img ${footer ? "brand-logo-img--footer" : ""}`}
      onError={() => setFailed(true)}
    />
  );
}
