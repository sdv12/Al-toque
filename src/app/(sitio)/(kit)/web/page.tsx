import type { Metadata } from "next";
import Link from "next/link";
import { Alto } from "../_alto/Alto";
import { AbrirAlto } from "../_alto/AbrirAlto";
import { AvisoPrecios } from "../_home/AvisoPrecios";
import { fuentesHome } from "../_home/fuentes";
import { Beneficios, Encabezado, GuiaWeb, Pie, Plantillas, Precios, Preguntas, afiche, boton, margen } from "../_home/Secciones";

export const metadata: Metadata = {
  title: "Al Toque Web · Tu página para tu negocio",
  description:
    "Plantillas pensadas para peluquerías, alojamientos y oficios. Elegí la tuya, cambiale textos, colores y precios mirando cómo queda, y mandánosla: la publicamos.",
  alternates: { canonical: "/web" },
  openGraph: {
    title: "Al Toque Web",
    description: "Tu negocio, con página propia. Al toque.",
    type: "website",
    locale: "es_AR",
    url: "/web",
    images: [{ url: "/muestras/barberia-escritorio.jpg", width: 1440, height: 900, alt: "Una de las plantillas de Al Toque Web" }],
  },
};

export default function Web() {
  const whatsapp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP;
  return (
    <div data-kit="home" className={fuentesHome}>
      <Encabezado desde="/" actual="/web" />
      <main id="contenido">
        <section aria-labelledby="web-titulo" className={`${margen} pb-8 pt-6`}>
          <p className="text-chico font-semibold text-tinta-suave">Al Toque Web</p>
          {/* Mismo título y tamaño que la portada (sin los teléfonos). */}
          <h1 id="web-titulo" className={`${afiche} mt-3 text-[clamp(2.75rem,0.9rem+7cqi,4.5rem)] leading-[0.9] @5xl:text-[clamp(3rem,3.8cqi,5.75rem)]`}>
            La solución para tu negocio, <br className="hidden @5xl:block" />
            <span className="resaltado whitespace-nowrap">al toque.</span>
          </h1>
          <p className="mt-8 max-w-[44ch] text-subtitulo">
            Elegí una plantilla pensada para tu rubro, cambiale textos, colores y precios, y mirá cómo queda mientras la armás. Nos la mandás y la
            publicamos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/configurador" className={boton.tinta}>
              Armar mi página
            </Link>
            <a href="#plantillas" className={boton.contorno}>
              Ver las plantillas
            </a>
          </div>
          <p className="mt-5 text-chico text-tinta-suave">
            Probar el configurador no cuesta nada y no pide registrarse. ¿Dudás qué te conviene?{" "}
            <AbrirAlto className="font-semibold underline underline-offset-4">Preguntale a Alto</AbrirAlto>.
          </p>
        </section>
        <GuiaWeb />
        <Plantillas />
        <Precios />
        <Beneficios />
        <Preguntas ids={["planes", "perfil", "subdominio", "tiempo", "fotos", "pedidos", "cambios", "mensual", "migrar", "saber"]} />
      </main>
      <Pie />
      <AvisoPrecios />
      <Alto whatsapp={whatsapp} contexto="web" />
    </div>
  );
}
