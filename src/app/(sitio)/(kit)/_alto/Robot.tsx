/**
 * Alto, el robot: cabeza amarilla de la marca, visor oscuro con ojos que parpadean y una antena
 * con luz que late. Decorativo (aria-hidden): el nombre "Alto" siempre va escrito al lado.
 */
export function Robot({ className = "size-11", vivo = true }: { className?: string; vivo?: boolean }) {
  const anim = (clase: string) => (vivo ? `${clase} motion-reduce:animate-none` : "");
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={`shrink-0 ${className}`}>
      {/* antena */}
      <line x1="32" y1="13" x2="32" y2="5.5" stroke="var(--lk-texto)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="5.5" r="4" fill="#ff5a36" className={anim("animate-alto-antena")} style={{ transformOrigin: "32px 5.5px" }} />
      {/* orejas */}
      <rect x="3.5" y="27" width="7" height="15" rx="3.5" fill="var(--lk-texto)" />
      <rect x="53.5" y="27" width="7" height="15" rx="3.5" fill="var(--lk-texto)" />
      {/* cabeza */}
      <rect x="9" y="12" width="46" height="44" rx="15" fill="var(--lk-acento-relleno)" stroke="var(--lk-texto)" strokeWidth="3" />
      {/* visor */}
      <rect x="15" y="22" width="34" height="20" rx="10" fill="var(--lk-texto)" />
      {/* ojos */}
      <g className={anim("animate-alto-parpadeo")} style={{ transformOrigin: "32px 32px" }}>
        <rect x="21" y="27" width="7" height="10" rx="3.5" fill="#7ef0ff" />
        <rect x="36" y="27" width="7" height="10" rx="3.5" fill="#7ef0ff" />
        <rect x="22.5" y="28.5" width="2.2" height="3" rx="1.1" fill="#ffffff" />
        <rect x="37.5" y="28.5" width="2.2" height="3" rx="1.1" fill="#ffffff" />
      </g>
      {/* sonrisa */}
      <path d="M26 48 q6 4 12 0" fill="none" stroke="var(--lk-texto)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
