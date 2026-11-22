import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/restos/estilos/base.css";
import "@/restos/estilos/publico.css";
import "@/restos/estilos/disenos.css";
import "@/restos/estilos/panel.css";

/*
 * Root layout de Resto al toque (/resto/demo): hojas de estilo propias (sin Tailwind). Cada diseño
 * cambia las variables con <html data-d="…">, que pone la app.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Al Toque Resto", template: "%s · Al Toque Resto" },
  description: "La web de tu restaurante con carta, reservas y pedidos, y el panel con salón, caja y ajustes.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

// Tipografías de los siete diseños.
const FUENTES =
  "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&family=Karla:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;600&family=Cabin+Sketch:wght@400;700&family=Caveat:wght@500;700&family=Playfair+Display:ital,wght@0,500;0,700;0,800;1,500;1,700&family=Libre+Franklin:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Bebas+Neue&family=Space+Grotesk:wght@400;500;700&family=Alfa+Slab+One&family=Bitter:ital,wght@0,400;0,600;0,700;1,400&family=Inter+Tight:wght@400;500;600;700;800;900&display=swap";

export default function RestoLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" data-d="imprenta">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FUENTES} />
      </head>
      <body>{children}</body>
    </html>
  );
}
