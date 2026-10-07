/* Blueprint técnico — chassi FT-4000 (SVG animado via CSS) */
export default function HeroDiagram() {
  return (
    <svg className="hero-svg" viewBox="0 0 560 600" fill="none" role="img" aria-label="Diagrama técnico do chassi Fulltech FT-4000">
      <defs>
        <pattern id="hgrid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0v28" stroke="rgba(244,245,247,.05)" fill="none" />
        </pattern>
      </defs>
      <rect width="560" height="600" fill="url(#hgrid)" />

      <rect x="120" y="150" width="320" height="360" rx="4" stroke="rgba(244,245,247,.85)" strokeWidth="1.5" />
      <line x1="120" y1="196" x2="440" y2="196" stroke="rgba(244,245,247,.4)" />
      <text x="140" y="179" className="svg-mono" fill="rgba(244,245,247,.7)">FULLTECH · FT-4000</text>
      <circle className="led" cx="420" cy="174" r="4" fill="#E8490F" />

      <path className="trace" d="M136 226 H444" stroke="#E8490F" strokeWidth="1.4" />
      <path className="trace" d="M136 226 V496" stroke="#E8490F" strokeWidth="1.4" />

      <circle cx="200" cy="320" r="80" stroke="rgba(244,245,247,.7)" />
      <g className="fan-blades" stroke="rgba(244,245,247,.5)" fill="rgba(244,245,247,.06)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} transform={`rotate(${a} 200 320)`} d="M200 320 C 238 306, 252 268, 238 240 C 220 262, 206 288, 200 320 Z" />
        ))}
      </g>
      <circle cx="200" cy="320" r="16" stroke="rgba(244,245,247,.85)" />
      <circle cx="200" cy="320" r="4" fill="rgba(244,245,247,.85)" />

      <rect x="308" y="256" width="112" height="26" stroke="rgba(244,245,247,.45)" />
      <circle cx="408" cy="269" r="3" fill="rgba(244,245,247,.5)" />
      <rect x="308" y="292" width="112" height="26" stroke="rgba(244,245,247,.45)" />
      <circle className="led" cx="408" cy="305" r="3" fill="#E8490F" />

      <rect x="140" y="412" width="180" height="9" stroke="rgba(244,245,247,.4)" />
      <rect x="140" y="432" width="180" height="9" stroke="rgba(244,245,247,.4)" />
      <rect x="140" y="452" width="180" height="9" stroke="rgba(244,245,247,.4)" />

      {[344, 362, 380, 398, 416, 434].map((x) => (
        <line key={x} x1={x} y1="412" x2={x} y2="461" stroke="rgba(244,245,247,.3)" />
      ))}

      <line x1="120" y1="546" x2="236" y2="546" stroke="rgba(244,245,247,.4)" />
      <line x1="324" y1="546" x2="440" y2="546" stroke="rgba(244,245,247,.4)" />
      <circle cx="120" cy="546" r="2.5" fill="rgba(244,245,247,.6)" />
      <circle cx="440" cy="546" r="2.5" fill="rgba(244,245,247,.6)" />
      <text x="280" y="550" textAnchor="middle" className="svg-mono" fill="rgba(244,245,247,.6)">440 MM</text>
      <line x1="86" y1="150" x2="86" y2="510" stroke="rgba(244,245,247,.4)" />
      <circle cx="86" cy="150" r="2.5" fill="rgba(244,245,247,.6)" />
      <circle cx="86" cy="510" r="2.5" fill="rgba(244,245,247,.6)" />
      <text transform="rotate(-90 72 330)" x="72" y="330" textAnchor="middle" className="svg-mono" fill="rgba(244,245,247,.6)">4U · 178 MM</text>

      <circle cx="360" cy="150" r="3.5" fill="#E8490F" />
      <path d="M360 150 L430 96 H552" stroke="rgba(244,245,247,.45)" />
      <text x="552" y="90" textAnchor="end" className="svg-mono" fill="#E8490F">FT-01 · CHASSI INTEGRADO</text>

      <circle cx="262" cy="282" r="3.5" fill="#E8490F" />
      <path d="M262 282 L448 212 H552" stroke="rgba(244,245,247,.45)" />
      <text x="552" y="206" textAnchor="end" className="svg-mono" fill="#E8490F">FT-02 · ARREFECIMENTO</text>

      <circle cx="410" cy="456" r="3.5" fill="#E8490F" />
      <path d="M410 456 L462 522 H552" stroke="rgba(244,245,247,.45)" />
      <text x="552" y="540" textAnchor="end" className="svg-mono" fill="#E8490F">FT-03 · FONTE ATX</text>
    </svg>
  );
}
