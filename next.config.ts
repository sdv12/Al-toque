import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Las fotos de clientes pueden venir de cualquier host https (Instagram CDN, Drive, etc.).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    qualities: [75],
  },
};

export default nextConfig;
