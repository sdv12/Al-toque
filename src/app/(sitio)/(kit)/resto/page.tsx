import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatearPesos } from "@/core/lib/mensajes";
import { EXTRAS, planesResto, proximaActualizacion } from "@/core/lib/precios";
import { DISENOS } from "@/restos/lib/disenos";
import { LISTA_TIPOS } from "@/restos/lib/locales";
import { Alto } from "../_alto/Alto";
import { AvisoPrecios } from "../_home/AvisoPrecios";
import { fuentesHome } from "../_home/fuentes";
import { Telefono } from "../_home/Marcos";
import { Encabezado, Pie, afiche, boton, margen } from "../_home/Secciones";
import { ArmarResto } from "./ArmarResto";

export const metadata: Metadata = {
  title: "Al Toque Resto · La web y el panel de tu restaurante",
  description:
    "Carta con pedidos para retirar o con envío, reservas por turno, eventos y QR por mesa. Y el panel del salón: mesas, comandas a cocina, cuenta dividida, caja y números. Para restaurantes, bares, cafés y rotiserías.",
  alternates: { canonical: "/resto" },
  openGraph: { title: "Al Toque Resto", description: "La web y el panel de tu restaurante. Probá la demo con tu tipo de local.", type: "website", locale: "es_AR", url: "/resto" },
};

/** Qué tipo de local queda mejor con cada diseño (para la captura y el link). */
const TIPO_DE_DISENO: Record<string, string> = { imprenta: "bodegon", pizarra: "rotiseria", trattoria: "pizzeria", cafe: "cafe", nocturno: "bar", brasa: "parrilla", moderno: "sushi" };

const WEB = [
  ["Carta que se actualiza", "Secciones, opciones (punto, guarnición, tamaño), sin TACC y veggie con filtro, y «se terminó» en el momento."],
  ["Pedidos para retirar o con envío", "Con zonas, costo y mínimo por barrio, y la hora de retiro según tus horarios."],
  ["Reservas por turno", "Con cupo según tus mesas, días bloqueados para eventos y confirmación por WhatsApp."],
  ["Promos con horario", "Happy hour, menú del mediodía o martes de pizza: el precio tachado aparece solo mientras corre."],
  ["Eventos, galería y reseñas", "Peñas, degustaciones, música en vivo, tus fotos y reseñas reales de tus clientes."],
  ["QR por mesa y carta impresa", "Tarjetas con QR para cada mesa y la carta en A4 lista para imprimir o mandar en PDF."],
];

const PANEL = [
  ["Salón", "Mesas por zona, juntar mesas, mozo de cada mesa, lista de espera y quién llama."],
  ["Cocina y barra", "Las comandas llegan solas, con opciones y aclaraciones, y avisan cuando se demoran."],
  ["La cuenta", "Servicio de mesa, descuentos, propina y cuenta dividida en partes o «cada uno lo suyo»."],
  ["Caja", "Cobros por medio de pago con la comisión de Mercado Pago, gastos y cierre con arqueo."],
  ["Números", "Lo vendido, ticket promedio, por persona, por turno, por mozo y lo que más y menos sale."],
  ["Personal", "Cada uno con su PIN: el mozo no ve la caja, la cocina ve solo las comandas."],
];

const PREGUNTAS = [
  {
    pregunta: "¿Cómo me llegan las reservas y los pedidos?",
    respuesta:
      "Hoy te llegan por WhatsApp con el mensaje armado (quién, cuántos, qué pidió, a qué hora y cómo paga) y los cargás en el panel con un toque. Cuando pases a la nube, entran solos al panel y la web muestra la ocupación en vivo.",
  },
  {
    pregunta: "¿Dónde quedan mis datos?",
    respuesta:
      "El panel guarda todo en el equipo del local (la compu o la tablet de la caja), con copia de seguridad en un archivo. Así arranca sin costo de servidor; cuando sumemos la nube, se comparte entre los celulares de los mozos y la cocina.",
  },
  {
    pregunta: "¿Puedo cambiar la carta y los precios yo?",
    respuesta: "Sí: platos, precios, opciones, secciones, promos y qué se terminó, desde el panel. Lo que cambia en la web pública lo publicamos en el día, y con la nube se publica solo.",
  },
  {
    pregunta: "¿Sirve si no tengo salón?",
    respuesta: "Sí. Una rotisería o una hamburguesería de envíos usa la carta con pedidos, las zonas de envío, la cocina y la caja, sin mesas ni reservas.",
  },
  {
    pregunta: "¿Qué diferencia hay entre los dos planes?",
    respuesta: "«Carta y web» es tu página con carta, pedidos y reservas por WhatsApp, eventos, galería y QR. «Web + panel» suma el panel del salón: mesas, cocina, cuenta dividida, caja, números y personal.",
  },
  {
    pregunta: "¿Cuánto tarda?",
    respuesta: "Con la carta y las fotos, en unos días está andando. Si ya la armaste en la demo, mandanos la copia y arrancamos desde ahí.",
  },
];

export default function RestoPagina() {
  const planes = planesResto();
  return (
    <div data-kit="home" className={fuentesHome}>
      <a href="#contenido" className="sr-only z-50 rounded-control bg-tinta px-4 py-2 text-fondo focus:not-sr-only focus:absolute focus:left-3 focus:top-3">
        Saltar al contenido
      </a>
      <Encabezado desde="/" actual="/resto" />
      <main id="contenido">
        <section aria-labelledby="resto-titulo" className={`${margen} pt-10 pb-16 @3xl:pt-16`}>
          <p className="text-chico font-semibold">Al Toque Resto · Restaurantes, bodegones, parrillas, pizzerías, cafés, bares, sushi, hamburgueserías y rotiserías</p>
          <h1 id="resto-titulo" className={`${afiche} mt-3 text-[clamp(3.25rem,1.6rem+8cqi,8rem)] leading-[0.86]`}>
            Tu restaurante, <span className="resaltado">al toque.</span>
          </h1>
          <div className="mt-8 grid gap-8 @4xl:grid-cols-12 @4xl:items-end">
            <div className="@4xl:col-span-7">
              <p className="max-w-medida text-subtitulo">
                La web con tu carta, pedidos y reservas, y el panel para el salón, la cocina y la caja. Viene armado para tu tipo de local y se cambia todo: carta, horarios, diseño, fotos y funciones.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#armalo" className={boton.tinta}>
                  Armalo con tus datos
                </a>
                <Link href="/resto/demo" className={boton.contorno}>
                  Ver una demo
                </Link>
              </div>
            </div>
            <p className="@4xl:col-span-5 @4xl:text-right" data-precios>
              <span className="block text-chico">desde</span>
              <span className={`${afiche} block text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(planes.carta.unico)}</span>
              <span className="mt-1 block text-chico">pago único + {formatearPesos(planes.carta.mensual)} por mes</span>
              <span className="mt-1 block text-mini text-tinta-suave">Precios actualizados cada tres meses · próxima actualización: {proximaActualizacion()}</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="tipos-titulo" className={`${margen} border-t-2 border-tinta py-16`}>
          <h2 id="tipos-titulo" className={`${afiche} text-titulo`}>
            Viene armado para <span className="resaltado">tu local</span>
          </h2>
          <p className="mt-3 max-w-medida text-subtitulo">Cada demo es un restaurante inventado, con su carta, sus horarios y sus mesas. Entrá al tuyo y probá pedir, reservar y atender.</p>
          <ul className="mt-10 grid gap-3 @3xl:grid-cols-2 @6xl:grid-cols-4">
            {LISTA_TIPOS.map((t) => (
              <li key={t.id}>
                <Link href={`/resto/demo?tipo=${t.id}`} className="flex h-full flex-col justify-between gap-3 rounded-base border-2 border-tinta bg-superficie p-5 transition-colors hover:bg-acento-relleno hover:text-sobre-acento">
                  <span>
                    <span className="block text-chico font-semibold">{t.nombre}</span>
                    <span className={`${afiche} mt-1 block text-[1.8rem] leading-none`}>{t.ejemplo}</span>
                  </span>
                  <span className="text-chico">{t.resumen} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="disenos-resto" className={`${margen} border-t-2 border-tinta py-16`}>
          <div className="grid gap-4 @5xl:grid-cols-12 @5xl:items-end">
            <h2 id="disenos-resto" className={`${afiche} text-titulo @5xl:col-span-7`}>
              Siete <span className="resaltado">diseños</span>
            </h2>
            <p className="max-w-medida text-subtitulo @5xl:col-span-5">No cambian solo los colores: cada uno arma la portada y la carta a su manera. Además elegís color, tipografía y tus fotos.</p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 @3xl:grid-cols-4 @6xl:grid-cols-7">
            {DISENOS.map((d, i) => (
              <li key={d.id}>
                <Link href={`/resto/demo?tipo=${TIPO_DE_DISENO[d.id]}&d=${d.id}`} className="group block">
                  <Telefono src={`/muestras/resto-${d.id}.jpg`} alt={`Diseño ${d.nombre} de la web del restaurante`} sizes="(min-width: 1152px) 13vw, (min-width: 768px) 22vw, 45vw" className="transition-transform duration-200 group-hover:-translate-y-1" />
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="text-mini text-tinta-suave tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`${afiche} text-[1.5rem] leading-none`}>{d.nombre}</span>
                  </p>
                  <p className="mt-1 text-chico text-tinta-suave">{d.bajada}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="web-resto" className={`${margen} py-16`}>
          <h2 id="web-resto" className={`${afiche} text-titulo`}>
            Una web que <span className="resaltado">atiende sola</span>
          </h2>
          <dl className="mt-10 grid gap-6 @3xl:grid-cols-2 @6xl:grid-cols-3">
            {WEB.map(([t, d]) => (
              <div key={t} className="border-t-2 border-tinta pt-4">
                <dt className="font-semibold">{t}</dt>
                <dd className="mt-1 text-chico text-tinta-suave">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="panel-resto" className={`${margen} bg-tinta py-20 text-fondo`}>
          <div className="grid gap-12 @5xl:grid-cols-12 @5xl:items-center">
            <div className="@5xl:col-span-5">
              <h2 id="panel-resto" className={`${afiche} text-titulo`}>
                El salón, <span className="bg-acento-relleno px-[0.12em] text-sobre-acento [box-decoration-break:clone]">ordenado</span>
              </h2>
              <dl className="mt-8 grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-1">
                {PANEL.map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-semibold">{t}</dt>
                    <dd className="mt-0.5 text-chico opacity-80">{d}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/resto/demo?tipo=parrilla#/panel" className="mt-8 inline-flex min-h-12 items-center rounded-control bg-acento-relleno px-7 font-semibold text-sobre-acento">
                Ver el panel de la demo
              </Link>
              <p className="mt-2 text-mini opacity-70">PIN de la demo: 1234 (encargada), 1111 (mozo), 3333 (cocina)</p>
            </div>
            <div className="@5xl:col-span-7">
              <div className="overflow-hidden rounded-base border-2 border-fondo/20 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)]">
                <Image src="/muestras/resto-panel.jpg" alt="Panel del salón: mesas por zona con su mozo, cuentas abiertas, lista de espera y lo que más sale" width={1440} height={900} sizes="(min-width: 1152px) 55vw, 92vw" className="h-auto w-full" />
              </div>
            </div>
          </div>
        </section>

        <section id="precios" aria-labelledby="planes-resto" className={`${margen} scroll-mt-4 py-20`} data-precios>
          <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
            <h2 id="planes-resto" className={`${afiche} text-titulo @5xl:col-span-7`}>
              Dos <span className="resaltado">planes</span>
            </h2>
            <p className="max-w-medida text-subtitulo @5xl:col-span-5">Un pago único para dejarlo andando con tu carta y tus horarios, y un mensual que cubre hosting, soporte y actualizaciones.</p>
          </div>
          <ul className="mt-12 grid gap-4 @4xl:grid-cols-2">
            <li className="flex flex-col rounded-base border-2 border-tinta bg-superficie p-7">
              <h3 className={`${afiche} text-[clamp(2rem,1.4rem+2cqi,2.75rem)] leading-none`}>{planes.carta.nombre}</h3>
              <p className="mt-3 text-tinta-suave">Tu web con la carta, para que te encuentren, pidan y reserven.</p>
              <p className="mt-6">
                <span className={`${afiche} text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(planes.carta.unico)}</span>
                <span className="mt-1 block text-chico">pago único + {formatearPesos(planes.carta.mensual)} por mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-chico">
                {["Web con tu diseño, fotos y textos", "Carta con opciones, promos y filtros", "Pedidos y reservas por WhatsApp", "Eventos, galería y reseñas", "QR por mesa y carta para imprimir", "Editor para cambiar carta y web"].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.5em] h-1.5 w-3 shrink-0 bg-acento" />
                    {i}
                  </li>
                ))}
              </ul>
              <a href="#armalo" className={`${boton.contorno} mt-8`}>
                Elegir Carta y web
              </a>
            </li>
            <li className="flex flex-col rounded-base border-2 border-tinta bg-acento-relleno p-7 text-sobre-acento">
              <p className="text-chico font-semibold">El completo</p>
              <h3 className={`${afiche} mt-1 text-[clamp(2rem,1.4rem+2cqi,2.75rem)] leading-none`}>{planes.completo.nombre}</h3>
              <p className="mt-3">La web y el panel del salón: todo el servicio en un lugar.</p>
              <p className="mt-6">
                <span className={`${afiche} text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(planes.completo.unico)}</span>
                <span className="mt-1 block text-chico">pago único + {formatearPesos(planes.completo.mensual)} por mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-chico">
                {["Todo lo de Carta y web", "Salón por zonas, mozos y lista de espera", "Comandas a cocina y barra", "Cuenta dividida, descuentos y propina", "Caja con comisiones y cierre", "Números y personal con permisos"].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.5em] h-1.5 w-3 shrink-0 bg-tinta" />
                    {i}
                  </li>
                ))}
              </ul>
              <a href="#armalo" className={`${boton.tinta} mt-8`}>
                Elegir Web + panel
              </a>
            </li>
          </ul>
          <div className="mt-4 rounded-base border-2 border-dashed border-tinta p-6">
            <p className="font-semibold">Adicionales</p>
            <ul className="mt-3 grid gap-3 text-chico @3xl:grid-cols-2">
              <li>
                <strong className="font-semibold">{EXTRAS.dominio.nombre}:</strong> {EXTRAS.dominio.descripcion} {formatearPesos(EXTRAS.dominio.unico)}
                {EXTRAS.dominio.mensual ? ` + ${formatearPesos(EXTRAS.dominio.mensual)} por mes` : ""}.
              </li>
              <li>
                <strong className="font-semibold">Nube para varios equipos:</strong> reservas y pedidos que entran solos al panel y mozos con el celular. Se suma cuando esté disponible.
              </li>
            </ul>
          </div>
          <p className="mt-4 text-chico text-tinta-suave">Precios de referencia, actualizados cada tres meses · próxima actualización: {proximaActualizacion()}.</p>
        </section>

        <section id="armalo" aria-labelledby="armalo-titulo" className={`${margen} scroll-mt-4 border-t-2 border-tinta py-20`}>
          <h2 id="armalo-titulo" className={`${afiche} text-titulo`}>
            Armalo con <span className="resaltado">tus datos</span>
          </h2>
          <p className="mt-3 mb-10 max-w-medida text-subtitulo">Elegí tu tipo de local, el nombre, el diseño y el plan. Mirá cómo queda y, si te gusta, pedilo.</p>
          <ArmarResto whatsapp={process.env.NEXT_PUBLIC_OWNER_WHATSAPP} />
        </section>

        <section aria-labelledby="preguntas-resto" className={`${margen} bg-superficie-2 py-20`}>
          <div className="mx-auto max-w-4xl">
            <h2 id="preguntas-resto" className={`${afiche} text-center text-[clamp(2.4rem,1.2rem+5cqi,4.25rem)] leading-[0.95]`}>
              Preguntas de restaurantes
            </h2>
            <div className="mt-10 border-b-2 border-tinta">
              {PREGUNTAS.map((f) => (
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
      <AvisoPrecios />
      <Alto whatsapp={process.env.NEXT_PUBLIC_OWNER_WHATSAPP} contexto="resto" />
    </div>
  );
}
