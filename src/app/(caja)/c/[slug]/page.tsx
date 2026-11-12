import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import CajaCliente from "@/cajas/CajaCliente";
import { cargarCaja, listarCajas } from "@/cajas/cargar";
import { COLORES_CAJA } from "@/cajas/config";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarCajas()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const config = await cargarCaja(slug);
  if (!config) return {};
  const nombre = config.negocio.nombre;
  return {
    title: nombre,
    description: `Caja de ${nombre}: vender, precios${config.modulos.fiado ? ", fiado" : ""} y caja del día.`,
    // Las demos se pueden mostrar; las cajas de clientes no tienen por qué aparecer en Google.
    robots: config.demo ? undefined : { index: false, follow: false },
    manifest: config.demo ? undefined : `/c/${slug}/manifest.webmanifest`,
    appleWebApp: { capable: true, title: nombre, statusBarStyle: "default" },
  };
}

export async function generateViewport({ params }: PageProps<"/c/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  const config = await cargarCaja(slug);
  return { themeColor: COLORES_CAJA[config?.color ?? "verde"].acento };
}

export default async function Page({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const config = await cargarCaja(slug);
  if (!config) notFound();
  return <CajaCliente config={config} base={`caja-${slug}`} />;
}
