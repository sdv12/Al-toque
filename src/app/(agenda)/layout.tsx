import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/agendas/estilos/base.css";
import "@/agendas/estilos/admin.css";
import "@/agendas/estilos/disenos.css";

/*
 * Root layout de Agenda al toque (/turnos/demo): la app de turnos portada de Agenda Rápida, con sus
 * hojas de estilo originales (no usa Tailwind). Cada diseño cambia las variables con
 * <html data-d="…">, que pone la app.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Al Toque Turnos", template: "%s · Al Toque Turnos" },
  description: "Turnos online para cualquier rubro: el cliente reserva solo y vos manejás la agenda, la caja y los números desde el panel.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Tipografías de los nueve diseños (las mismas que usaba Agenda Rápida).
const FUENTES =
  "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Nunito:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;700&family=Archivo+Black&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter+Tight:wght@400;500;600;800&family=Manrope:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Sora:wght@300;400;600;700&family=DM+Serif+Display&display=swap";

export default function AgendaLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" data-d="base">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FUENTES} />
      </head>
      <body>{children}</body>
    </html>
  );
}
