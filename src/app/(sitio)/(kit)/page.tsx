import type { Metadata } from "next";
import { Alto } from "./_alto/Alto";
import { AvisoPrecios } from "./_home/AvisoPrecios";
import { fuentesHome } from "./_home/fuentes";
import { Cierre, ComoFunciona, Confianza, Encabezado, Hero, Necesidades, Pie, Preguntas, Proyectos, Rubros, Soluciones } from "./_home/Secciones";

export const metadata: Metadata = {
  title: "Al Toque · Soluciones digitales para tu negocio",
  description:
    "Páginas web, turnos online y caja para comercios. Soluciones simples para peluquerías, comercios, alojamientos y oficios de Córdoba. Probalas gratis.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Al Toque",
    description: "Tu negocio merece trabajar mejor. Páginas web, turnos y caja, al toque.",
    type: "website",
    locale: "es_AR",
    url: "/",
    images: [{ url: "/muestras/barberia-escritorio.jpg", width: 1440, height: 900, alt: "Una página hecha con Al Toque" }],
  },
};

export default function Inicio() {
  const whatsapp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP;
  return (
    <div data-kit="home" className={fuentesHome}>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-tinta px-4 py-2 text-fondo focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="contenido">
        <Hero />
        <Rubros />
        <Necesidades />
        <Soluciones whatsapp={whatsapp} />
        <Proyectos />
        <ComoFunciona />
        <Confianza />
        <Preguntas />
        <Cierre whatsapp={whatsapp} />
      </main>
      <Pie />
      <AvisoPrecios />
      <Alto whatsapp={whatsapp} />
    </div>
  );
}
