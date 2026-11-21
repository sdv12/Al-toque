import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jsonLdNegocio } from "@/core/lib/jsonld";
import { RenderLanding } from "@/templates";
import { cargarConfig } from "../l/[slug]/cargar";

/**
 * Demo de Al Toque Estudio en una dirección corta. La config es la de configs/demo-arquitectos.json
 * (/l/demo-arquitectos redirige acá, ver next.config.ts).
 */
const SLUG = "demo-arquitectos";

export async function generateMetadata(): Promise<Metadata> {
  const config = await cargarConfig(SLUG);
  if (!config) return {};
  const { negocio } = config;
  const titulo = `${negocio.nombre} · ${negocio.eslogan}`;
  const descripcion = negocio.subtitulo || negocio.eslogan;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: "/estudio" },
    openGraph: { title: titulo, description: descripcion, type: "website", locale: "es_AR", siteName: negocio.nombre, url: "/estudio" },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function Estudio() {
  const config = await cargarConfig(SLUG);
  if (!config) notFound();
  const jsonLd = JSON.stringify(jsonLdNegocio(config)).replace(/</g, "\\u003c");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <RenderLanding config={config} />
    </>
  );
}
