import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/cajas/estilos.css";

/*
 * Root layout propio de las cajas (/c/…): tiene su hoja de Tailwind y no carga nada del kit.
 * Ir de la home a una caja es una carga de página completa (son dos root layouts distintos).
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Caja al toque", template: "%s · Caja" },
  description: "Caja para negocios de barrio: vender, precios, fiado y caja del día.",
  icons: { icon: "/c/icon-192.png", apple: "/c/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#146c2e",
};

export default function CajaLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
