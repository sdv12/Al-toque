import type { Metadata } from "next";
import { fuentesHome } from "./_home/fuentes";
import { Beneficios, Cierre, ComoFunciona, Encabezado, Hero, Pie, Plantillas, Precios, Preguntas, Resenas, Rubros } from "./_home/Secciones";

export const metadata: Metadata = {
  title: "Landing al toque · Tu página para tu negocio",
  description:
    "Plantillas pensadas para barberías, consultorios, casas de campo y cualquier oficio. Elegí, personalizá en vivo y mandámela: la publico.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Landing al toque",
    description: "Tu negocio, con página propia. Al toque.",
    type: "website",
    locale: "es_AR",
    url: "/",
    images: [{ url: "/muestras/barberia-escritorio.jpg", width: 1440, height: 900, alt: "Una de las plantillas de Landing al toque" }],
  },
};

export default function Inicio() {
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
        <Plantillas />
        <ComoFunciona />
        <Precios />
        <Resenas />
        <Beneficios />
        <Preguntas />
        <Cierre whatsapp={process.env.NEXT_PUBLIC_OWNER_WHATSAPP} />
      </main>
      <Pie />
    </div>
  );
}
