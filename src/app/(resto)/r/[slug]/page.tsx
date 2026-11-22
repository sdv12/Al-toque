import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cargarResto, listarRestos } from "@/restos/cargar";
import { Cliente } from "./Cliente";

/** Solo los restaurantes publicados en configs/restos/. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarRestos()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await cargarResto(slug);
  if (!r) return {};
  const l = r.estado.local;
  return {
    title: { absolute: `${l.nombre} · ${l.bajada}` },
    description: `${l.textos.titulo} ${l.textos.subtitulo} ${l.textos.historia}`.slice(0, 300),
    alternates: { canonical: `/r/${slug}` },
    openGraph: { title: l.nombre, description: l.textos.historia, type: "website", locale: "es_AR", url: `/r/${slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await cargarResto(slug);
  if (!r) notFound();
  return <Cliente slug={slug} publicado={r} />;
}
