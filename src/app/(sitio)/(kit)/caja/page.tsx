import type { Metadata } from "next";
import Link from "next/link";
import { formatearPesos } from "@/core/lib/mensajes";
import { planCaja, planCajaPro } from "@/core/lib/precios";
import { RUBROS, RUBROS_CAJA } from "@/cajas/rubros";
import { fuentesHome } from "../_home/fuentes";
import { Encabezado, Pie, afiche, boton, margen } from "../_home/Secciones";
import { ConfiguradorCaja } from "./ConfiguradorCaja";

export const metadata: Metadata = {
  title: "Caja al toque · Caja para tu negocio de barrio",
  description:
    "Caja para verdulerías, almacenes, kioscos y dietéticas: vender, precios, fiado y cierre del día con botones grandes. Funciona sin internet. Probala gratis.",
  alternates: { canonical: "/caja" },
  openGraph: {
    title: "Caja al toque",
    description: "La caja de tu negocio, en el celular. Probala gratis.",
    type: "website",
    locale: "es_AR",
    url: "/caja",
  },
};

const PREGUNTAS_CAJA = [
  {
    pregunta: "¿Dónde quedan las ventas y los precios?",
    respuesta:
      "En el celular, la tablet o la compu donde uses la caja. No pasan por ningún servidor: por eso es barata y anda sin internet. Si se rompe o se pierde el equipo, se pierde lo cargado (el respaldo en la nube viene con la versión pro).",
  },
  {
    pregunta: "¿Necesito internet para vender?",
    respuesta: "No. Una vez instalada abre y funciona sin conexión. Internet solo hace falta para mandar mensajes por WhatsApp.",
  },
  {
    pregunta: "¿Quién la va a usar? ¿Es complicada?",
    respuesta:
      "Está pensada para personas mayores: letras grandes, botones grandes, cuatro secciones y siempre un «Deshacer». Al entregarla te la explicamos en el local.",
  },
  {
    pregunta: "¿Puedo cambiar productos y precios?",
    respuesta: "Sí, todos los que quieras y cuando quieras, desde la misma caja. Arranca con los productos típicos de tu rubro para que no empieces de cero.",
  },
  {
    pregunta: "¿Hace factura electrónica?",
    respuesta:
      "La simple no. Si necesitás factura, varias cajas, empleados con permisos, lector de código de barras o QR de Mercado Pago, eso es la caja pro: escribinos y la vemos.",
  },
];

export default function CajaPagina() {
  const plan = planCaja();
  const pro = planCajaPro();
  return (
    <div data-kit="home" className={fuentesHome}>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-control bg-tinta px-4 py-2 text-fondo focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>
      <Encabezado desde="/" />
      <main id="contenido">
        <section aria-labelledby="caja-titulo" className={`${margen} pb-14 pt-10 @3xl:pt-16`}>
          <p className="text-chico font-semibold">Para {RUBROS_CAJA.map((r) => RUBROS[r].nombre.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " y $1")}</p>
          <h1 id="caja-titulo" className={`${afiche} mt-3 text-[clamp(3.25rem,1.6rem+8cqi,8rem)] leading-[0.86]`}>
            La caja de tu negocio. <span className="resaltado">Al toque.</span>
          </h1>
          <div className="mt-8 grid gap-6 @4xl:grid-cols-12 @4xl:items-end">
            <p className="max-w-medida text-subtitulo @4xl:col-span-7">
              Vender, precios, fiado y el cierre del día, con botones grandes y en el celular que ya tenés. Armala acá abajo y probala con tus cosas: es
              gratis y no pide registrarse.
            </p>
            <p className="@4xl:col-span-5 @4xl:text-right">
              <span className="block text-chico">desde</span>
              <span className={`${afiche} block text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(plan.unico)}</span>
              <span className="mt-1 block text-chico">pago único + {formatearPesos(plan.mensual)} por mes</span>
            </p>
          </div>
        </section>

        <ConfiguradorCaja whatsapp={process.env.NEXT_PUBLIC_OWNER_WHATSAPP} />

        <section id="pro" aria-labelledby="pro-titulo" className={`${margen} scroll-mt-4 py-24`}>
          <div className="grid gap-8 rounded-base border-2 border-tinta bg-superficie p-7 @4xl:grid-cols-12 @4xl:p-12">
            <div className="@4xl:col-span-7">
              <p className="text-chico font-semibold">Para negocios más grandes</p>
              <h2 id="pro-titulo" className={`${afiche} mt-2 text-titulo`}>
                Caja <span className="resaltado">pro</span>
              </h2>
              <p className="mt-4 max-w-medida text-subtitulo">
                Como la que usa un comercio con empleados y sucursales: todo guardado en la nube y a la vista desde cualquier lado.
              </p>
              <p className="mt-6">
                <span className="block text-chico">desde</span>
                <span className={`${afiche} text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(pro.unico)}</span>
                <span className="ml-2 text-chico">
                  + {formatearPesos(pro.mensual)} por mes · {formatearPesos(pro.sucursalExtra)} por mes cada sucursal extra
                </span>
              </p>
            </div>
            <ul className="space-y-2.5 text-chico @4xl:col-span-5 @4xl:self-center">
              {[
                "Varias cajas y sucursales, con apertura, arqueo y cierre",
                "Empleados con usuario y permisos, y registro de quién hizo qué",
                "Stock con lector de código de barras y categorías",
                "Factura electrónica (ARCA) y QR de Mercado Pago",
                "Cuenta corriente de clientes, reportes y auditoría",
              ].map((i) => (
                <li key={i} className="flex gap-2.5">
                  <span aria-hidden className="mt-[0.5em] h-1.5 w-3 shrink-0 bg-acento" />
                  {i}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 @4xl:col-span-12">
              <Link href="/c/pro" className={boton.tinta}>
                Probar la demo pro
              </Link>
              {process.env.NEXT_PUBLIC_OWNER_WHATSAPP ? (
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_OWNER_WHATSAPP}?text=${encodeURIComponent("Hola! Quiero saber más de la caja pro.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={boton.contorno}
                >
                  Consultar por la caja pro
                </a>
              ) : (
                <Link href="/#preguntas" className={boton.contorno}>
                  Ver preguntas
                </Link>
              )}
              <p className="w-full text-chico text-tinta-suave">
                La demo es una ferretería inventada con dos sucursales: entrá como la dueña o como una vendedora y mirá qué ve cada una. La factura y el QR son
                simulados.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="preguntas-caja-titulo" className={`${margen} bg-superficie-2 py-24`}>
          <div className="mx-auto max-w-4xl">
            <h2 id="preguntas-caja-titulo" className={`${afiche} text-center text-[clamp(2.4rem,1.2rem+5cqi,4.25rem)] leading-[0.95]`}>
              Preguntas de la caja
            </h2>
            <div className="mt-10 border-b-2 border-tinta">
              {PREGUNTAS_CAJA.map((f) => (
                <details key={f.pregunta} className="group border-t-2 border-tinta">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-subtitulo font-semibold [&::-webkit-details-marker]:hidden">
                    {f.pregunta}
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-tinta text-cuerpo transition-colors group-open:bg-acento-relleno">
                      <span className="transition-transform group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="max-w-medida pb-6 text-tinta-suave">{f.respuesta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Pie />
    </div>
  );
}
