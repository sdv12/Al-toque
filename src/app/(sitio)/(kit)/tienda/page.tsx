import type { Metadata } from "next";
import Link from "next/link";
import { Alto } from "../_alto/Alto";
import { fuentesHome } from "../_home/fuentes";
import { Encabezado, Pie, afiche, margen } from "../_home/Secciones";
import { ListaEspera } from "./ListaEspera";

export const metadata: Metadata = {
  title: "Al Toque Tienda · Próximamente",
  description: "Una tienda online simple para vender por internet: catálogo, carrito y pedidos. La estamos preparando: sumate a la lista de espera.",
  alternates: { canonical: "/tienda" },
  openGraph: { title: "Al Toque Tienda", description: "Vender por internet, al toque. Sumate a la lista de espera.", type: "website", locale: "es_AR", url: "/tienda" },
};

/** Lo que queremos que tenga: planes, no promesas (la página dice que está en preparación). */
const IDEAS = [
  ["Catálogo con fotos y precios", "Tus productos ordenados por categoría, con stock y variantes."],
  ["Carrito y pedido", "Tu cliente arma el pedido solo y te llega completo."],
  ["Pago y envío", "Cobro online y coordinación de envío o retiro en el local."],
  ["Conectada con tu caja", "Los mismos productos y precios que en el mostrador, sin cargar dos veces."],
];

export default function Tienda() {
  return (
    <div data-kit="home" className={fuentesHome}>
      <Encabezado desde="/" />
      <main id="contenido">
        <section aria-labelledby="tienda-titulo" className={`${margen} pb-16 pt-6`}>
          <p className="inline-flex rounded-full border-2 border-dashed border-tinta px-3 py-1 text-chico font-semibold">Al Toque Tienda · Próximamente</p>
          <h1 id="tienda-titulo" className={`${afiche} mt-5 max-w-[14ch] text-[clamp(3rem,1rem+7cqi,7rem)] leading-[0.86]`}>
            Vender por internet, <span className="resaltado whitespace-nowrap">al toque.</span>
          </h1>
          <p className="mt-8 max-w-[46ch] text-subtitulo">
            Estamos preparando una tienda online simple para negocios como el tuyo. Sumate a la lista: te avisamos primero y nos ayudás a armarla con lo
            que de verdad necesitás.
          </p>
        </section>

        <section aria-labelledby="ideas-titulo" className={`${margen} border-t-2 border-tinta py-16`}>
          <h2 id="ideas-titulo" className={`${afiche} text-titulo`}>
            Lo que <span className="resaltado">estamos armando</span>
          </h2>
          <ul className="mt-10 grid gap-x-10 @4xl:grid-cols-2">
            {IDEAS.map(([t, d]) => (
              <li key={t} className="border-t-2 border-tinta py-6">
                <h3 className={`${afiche} text-[clamp(1.6rem,1.1rem+1.6cqi,2.2rem)] leading-none`}>{t}</h3>
                <p className="mt-2 text-tinta-suave">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-chico text-tinta-suave">Es lo que planeamos: puede cambiar según lo que nos cuenten los que se anotan. Todavía no está a la venta.</p>
        </section>

        <section id="lista" aria-labelledby="lista-titulo" className={`${margen} scroll-mt-4 bg-superficie-2 py-20`}>
          <div className="mx-auto max-w-4xl">
            <h2 id="lista-titulo" className={`${afiche} text-titulo`}>
              Sumate a la <span className="resaltado">lista</span>
            </h2>
            <p className="mt-3 mb-8 max-w-medida text-subtitulo">Sin compromiso y sin costo. Solo te escribimos para avisarte.</p>
            <ListaEspera />
            <p className="mt-8 text-chico">
              ¿Necesitás vender ya? Tu página puede mostrar tu catálogo y recibir pedidos por WhatsApp:{" "}
              <Link href="/web" className="font-semibold underline underline-offset-4">
                mirá Al Toque Web
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Pie />
      <Alto whatsapp={process.env.NEXT_PUBLIC_OWNER_WHATSAPP} contexto="tienda" />
    </div>
  );
}
