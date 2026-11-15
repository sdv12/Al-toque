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
};

export default nextConfig;
