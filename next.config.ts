import type { NextConfig } from "next";
import paquete from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Sin el botón "N" de Next en desarrollo: tapaba la barra de abajo de la caja (y el marco de /caja).
  // Los errores de compilación y de ejecución se siguen mostrando igual.
  devIndicators: false,
  // Versión visible en el footer: única fuente de verdad, el "version" de package.json.
  env: { NEXT_PUBLIC_VERSION: paquete.version },
  images: {
    // Solo se optimizan imágenes propias (/public). Las fotos externas de clientes se sirven sin
    // optimizar desde su origen: así el optimizador no queda como proxy abierto para cualquier URL.
    qualities: [75],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Que ningún otro sitio meta nuestras páginas en un iframe (clickjacking). Entre nosotros sí:
          // /caja muestra /c/prueba y el configurador su vista previa.
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // La cámara solo para sacar la foto de un producto en la caja; nada más.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
      // Panel del equipo: fuera de los buscadores también por cabecera (además del meta robots).
      { source: "/adm", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
