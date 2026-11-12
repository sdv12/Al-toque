import { cargarCaja, listarCajas } from "@/cajas/cargar";
import { COLORES_CAJA } from "@/cajas/config";

/** Manifest de cada caja: así se instala como app con su nombre y abre directo en ella. */
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarCajas()).map((slug) => ({ slug }));
}

export async function GET(_: Request, { params }: RouteContext<"/c/[slug]/manifest.webmanifest">) {
  const { slug } = await params;
  const config = await cargarCaja(slug);
  if (!config) return new Response("No existe", { status: 404 });
  const nombre = config.negocio.nombre;
  const manifest = {
    name: `Caja · ${nombre}`,
    short_name: nombre.length > 14 ? "Caja" : nombre,
    description: `Caja de ${nombre}.`,
    lang: "es-AR",
    start_url: `/c/${slug}`,
    scope: `/c/${slug}`,
    display: "standalone",
    orientation: "any",
    background_color: "#fffdf7",
    theme_color: COLORES_CAJA[config.color].acento,
    icons: [
      { src: "/c/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/c/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/c/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/manifest+json" } });
}
