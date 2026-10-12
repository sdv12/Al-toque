import { NOMBRE_RED, type RedSocial } from "@/core/lib/redes";
import type { RedNegocio } from "@/core/schema/comun";

/** Logos de las redes (marcas de terceros: iguales en todas las plantillas, heredan el color). */
export function IconoRed({ red, className }: { red: RedSocial; className?: string }) {
  switch (red) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.45A21 21 0 0 0 14.27 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.8v3h2.6V21h3.1Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M16.6 3h-3.1v12.2a2.7 2.7 0 1 1-2.7-2.7c.27 0 .53.04.78.12V9.45a5.86 5.86 0 1 0 5.02 5.8V9.1a7.6 7.6 0 0 0 4.4 1.4V7.4a4.4 4.4 0 0 1-4.4-4.4Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path
            fillRule="evenodd"
            d="M6.2 5h11.6A4.2 4.2 0 0 1 22 9.2v5.6a4.2 4.2 0 0 1-4.2 4.2H6.2A4.2 4.2 0 0 1 2 14.8V9.2A4.2 4.2 0 0 1 6.2 5Zm3.8 3.6v6.8l5.8-3.4L10 8.6Z"
          />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.18h1.7L7.4 4.73H5.58l11.1 14.45Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
          <path d="M4.5 9h3.3v11H4.5V9Zm1.65-5.5a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM10 9h3.15v1.5h.05c.44-.83 1.52-1.7 3.12-1.7 3.34 0 3.96 2.2 3.96 5.06V20h-3.3v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.86V20H10V9Z" />
        </svg>
      );
  }
}

type Props = {
  redes: readonly RedNegocio[] | undefined;
  /** Para el nombre accesible de cada link: "Instagram de Barbería Güemes". */
  nombre: string;
  className?: string;
  /** Cada botón. Por defecto, círculo con borde sobre la superficie; las plantillas pueden pasar el suyo. */
  claseBoton?: string;
  claseIcono?: string;
};

const BOTON =
  "grid size-11 place-items-center rounded-full border border-borde bg-superficie text-tinta transition-colors hover:border-acento-relleno hover:bg-acento-relleno hover:text-sobre-acento";

/** Fila de íconos redondos con las redes del negocio, en el orden en que se cargaron. Sin redes, nada. */
export function RedesSociales({ redes, nombre, className = "", claseBoton = BOTON, claseIcono = "size-5" }: Props) {
  if (!redes?.length) return null;
  return (
    <ul aria-label="Redes sociales" className={`flex flex-wrap gap-3 ${className}`}>
      {redes.map((r) => (
        <li key={r.red}>
          <a href={r.url} target="_blank" rel="noopener noreferrer" aria-label={`${NOMBRE_RED[r.red]} de ${nombre}`} title={NOMBRE_RED[r.red]} className={claseBoton}>
            <IconoRed red={r.red} className={claseIcono} />
          </a>
        </li>
      ))}
    </ul>
  );
}
