import type { NextConfig } from "next";
import paquete from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Versión visible en el footer: única fuente de verdad, el "version" de package.json.
  env: { NEXT_PUBLIC_VERSION: paquete.version },
  images: {
    // Las fotos de clientes pueden venir de cualquier host https (Instagram CDN, Drive, etc.).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    qualities: [75],
  },
};

export default nextConfig;
