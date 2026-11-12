import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jsonLdNegocio } from "@/core/lib/jsonld";
import { RenderLanding } from "@/templates";
import { cargarConfig, listarSlugs } from "./cargar";

// Solo existen las landings que tienen archivo en /configs (se generan estáticas en el build).
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/l/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const config = await cargarConfig(slug);
  if (!config) return {};
  const { negocio } = config;
  const titulo = `${negocio.nombre} · ${negocio.eslogan}`;
  const descripcion = negocio.subtitulo || negocio.eslogan;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/l/${slug}` },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      locale: "es_AR",
      siteName: negocio.nombre,
      url: `/l/${slug}`,
    },
    // La imagen la aporta opengraph-image.tsx de esta misma ruta.
    twitter: { card: "summary_large_image", title: titulo, description: descripcion },
  };
}

export default async function LandingPage({ params }: PageProps<"/l/[slug]">) {
  const { slug } = await params;
  const config = await cargarConfig(slug);
  if (!config) notFound();

  const jsonLd = JSON.stringify(jsonLdNegocio(config)).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <RenderLanding config={config} />
    </>
  );
}
