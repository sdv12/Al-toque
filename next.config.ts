import type { NextConfig } from "next";
import paquete from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Versión visible en el footer: única fuente de verdad, el "version" de package.json.
  env: { NEXT_PUBLIC_VERSION: paquete.version },
  images: {
    // Solo se optimizan imágenes propias (/public). Las fotos externas de clientes se sirven sin
    // optimizar desde su origen: así el optimizador no queda como proxy abierto para cualquier URL.
    qualities: [75],
  },
};

export default nextConfig;
