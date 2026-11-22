import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DISENOS } from "@/agendas/lib/disenos";
import { linkDemoAgenda } from "@/agendas/lib/demo";
import { GRUPOS, type IdProfesion } from "@/agendas/lib/profesiones";
import { formatearPesos } from "@/core/lib/mensajes";
import { EXTRAS, ahorroWebTurnos, planAgenda, planes, proximaActualizacion } from "@/core/lib/precios";
import { Alto } from "../_alto/Alto";
import { AvisoPrecios } from "../_home/AvisoPrecios";
import { fuentesHome } from "../_home/fuentes";
import { Telefono } from "../_home/Marcos";
import { Encabezado, Pie, afiche, boton, margen } from "../_home/Secciones";
import { LinksViejos } from "./LinksViejos";

export const metadata: Metadata = {
  title: "Al Toque Turnos · Turnos online para tu negocio",
  description:
    "Tus clientes reservan solos desde un link, a cualquier hora. Vos manejás la agenda, la caja y los números desde el celular. Nueve diseños para elegir. Probalo gratis.",
  alternates: { canonical: "/turnos" },
  openGraph: { title: "Al Toque Turnos", description: "Turnos online para tu negocio. Probalo con tus datos.", type: "website", locale: "es_AR", url: "/turnos" },
};

const PANEL = [
  ["Hoy", "Los turnos del día, quién viene y a quién cobrar, con un toque."],
  ["Agenda", "Día o semana, cargar un turno de mostrador y bloquear horarios."],
  ["Caja", "Cobros por medio de pago, gastos y cierre del día."],
  ["Números", "Ingresos, ocupación, ausencias y los horarios que más se piden."],
  ["Clientes", "Historial, notas privadas y recordatorio por WhatsApp."],
  ["Lista de espera", "Si no hay lugar, el cliente se anota y le avisás cuando se libera."],
];

const PREGUNTAS = [
  {
    pregunta: "¿Cómo reservan mis clientes?",
    respuesta:
      "Les pasás tu link (por WhatsApp, Instagram o un QR en el local). Eligen el servicio, el día y el horario libre, dejan nombre y WhatsApp, y listo: no tenés que contestar mensajes para dar turnos.",
  },
  {
    pregunta: "¿Dónde quedan los turnos?",
    respuesta:
      "En la agenda de tu negocio, en la nube, para que todos tus clientes vean los mismos horarios libres. Por eso tiene un mensual: incluye la base de datos, el mantenimiento y las actualizaciones. La demo de esta página guarda todo solo en tu navegador.",
  },
  {
    pregunta: "¿Les avisa a mis clientes?",
    respuesta: "Pueden agregar el turno a su calendario y desde el panel les mandás el recordatorio por WhatsApp. Los recordatorios automáticos se suman como extra.",
  },
  {
    pregunta: "¿Puedo cambiar el diseño, los servicios o los horarios?",
    respuesta: "Sí, cuando quieras, desde el panel: servicios con duración y precio, franjas por día, cada cuánto arranca un turno y con cuánta anticipación se puede reservar.",
  },
  {
    pregunta: "¿Y si además quiero una página web?",
    respuesta: "La agenda se puede sumar a cualquiera de nuestras landings, o usarla sola con tu propio link. Si ya tenés Instagram, con el link alcanza para empezar.",
  },
];

/** Demos por rubro: [profesión de la agenda, nombre del negocio de muestra, qué se ve]. */
const DEMOS_RUBRO: [IdProfesion, string, string][] = [
  ["peluqueria", "Barbería del Centro", "Corte, corte y barba, color y peinado"],
  ["unas", "Estudio de uñas", "Semipermanente, kapping, esculpidas y retiro"],
  ["entrenamiento", "Entrenamiento personal", "Clases 1 a 1, en dupla y evaluación física"],
  ["taller", "Taller mecánico", "Service, aceite, diagnóstico y alineación"],
];

export default function TurnosPagina() {
  const plan = planAgenda();
  const paquete = planes()[2]!;
  const ahorro = ahorroWebTurnos();
  const rubros = Object.values(GRUPOS).flat().length;
  return (
    <div data-kit="home" className={fuentesHome}>
      <a href="#contenido" className="sr-only z-50 rounded-control bg-tinta px-4 py-2 text-fondo focus:not-sr-only focus:absolute focus:left-3 focus:top-3">
        Saltar al contenido
      </a>
      <LinksViejos />
      <Encabezado desde="/" actual="/turnos" />
      <main id="contenido">
        <section aria-labelledby="agenda-titulo" className={`${margen} pt-10 pb-16 @3xl:pt-16`}>
          <p className="text-chico font-semibold">Al Toque Turnos · Para {rubros} rubros: belleza, clases, talleres, estudios, servicios y más</p>
          <h1 id="agenda-titulo" className={`${afiche} mt-3 text-[clamp(2.75rem,0.9rem+7cqi,4.5rem)] leading-[0.9] @5xl:text-[clamp(3rem,3.8cqi,5.75rem)]`}>
            Dejá de coordinar <span className="resaltado">a mano.</span>
          </h1>
          <div className="mt-8 grid gap-8 @4xl:grid-cols-12 @4xl:items-end">
            <div className="@4xl:col-span-7">
              <p className="max-w-medida text-subtitulo">
                Tus clientes reservan online desde un link, y vos gestionás la agenda, los cobros y los números desde el celular. Podés probarla gratis
                con tus servicios y horarios, sin registrarte.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/turnos/demo#/probar" className={boton.tinta}>
                  Probalo con tus datos
                </Link>
                <Link href="/turnos/demo#/" className={boton.contorno}>
                  Ver una demo
                </Link>
              </div>
            </div>
            <p className="@4xl:col-span-5 @4xl:text-right" data-precios>
              <span className="block text-chico">desde</span>
              <span className={`${afiche} block text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(plan.unico)}</span>
              <span className="mt-1 block text-chico">pago único + {formatearPesos(plan.mensual)} por mes</span>
              <span className="mt-1 block text-mini text-tinta-suave">Precios actualizados cada tres meses · próxima actualización: {proximaActualizacion()}</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="disenos-titulo" className={`${margen} border-t-2 border-tinta py-16`}>
          <div className="grid gap-4 @5xl:grid-cols-12 @5xl:items-end">
            <h2 id="disenos-titulo" className={`${afiche} text-titulo @5xl:col-span-7`}>
              Nueve <span className="resaltado">diseños</span>
            </h2>
            <p className="max-w-medida text-subtitulo @5xl:col-span-5">No cambian solo los colores: cada uno reserva de otra manera. Tocá uno y probalo.</p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 @3xl:grid-cols-3 @6xl:grid-cols-5">
            {DISENOS.map((d, i) => (
              <li key={d.id}>
                <Link href={`/turnos/demo?d=${d.id}#/`} className="group block">
                  <Telefono
                    src={`/muestras/agenda-${d.id}.jpg`}
                    alt={`Diseño ${d.nombre} de la página de reservas`}
                    sizes="(min-width: 1152px) 18vw, (min-width: 768px) 30vw, 45vw"
                    className="transition-transform duration-200 group-hover:-translate-y-1"
                  />
                  <p className="mt-4 flex items-baseline gap-2">
                    <span className="text-mini text-tinta-suave tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className={`${afiche} text-[1.6rem] leading-none`}>{d.nombre}</span>
                  </p>
                  <p className="mt-1 text-chico text-tinta-suave">{d.bajada}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="panel-titulo" className={`${margen} bg-tinta py-20 text-fondo`}>
          <div className="grid gap-12 @5xl:grid-cols-12 @5xl:items-center">
            <div className="@5xl:col-span-5">
              <h2 id="panel-titulo" className={`${afiche} text-titulo`}>
                Tu panel, <span className="bg-acento-relleno px-[0.12em] text-sobre-acento [box-decoration-break:clone]">en el bolsillo</span>
              </h2>
              <dl className="mt-8 grid gap-5 @xl:grid-cols-2 @5xl:grid-cols-1">
                {PANEL.map(([t, d]) => (
                  <div key={t}>
                    <dt className="font-semibold">{t}</dt>
                    <dd className="mt-0.5 text-chico opacity-80">{d}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/turnos/demo#/admin/hoy" className="mt-8 inline-flex min-h-12 items-center rounded-control bg-acento-relleno px-7 font-semibold text-sobre-acento">
                Ver el panel de la demo
              </Link>
              <p className="mt-2 text-mini opacity-70">PIN de la demo: 1234</p>
            </div>
            <div className="@5xl:col-span-7">
              <div className="overflow-hidden rounded-base border-2 border-fondo/20 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.6)]">
                <Image
                  src="/muestras/agenda-panel.jpg"
                  alt="Panel de la agenda: ingresos, ocupación, ausencias, lo que más se vende y los horarios más pedidos"
                  width={1440}
                  height={900}
                  sizes="(min-width: 1152px) 55vw, 92vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="rubros-titulo" className={`${margen} py-20`}>
          <h2 id="rubros-titulo" className={`${afiche} text-titulo`}>
            Viene armada para <span className="resaltado">tu rubro</span>
          </h2>
          <p className="mt-3 max-w-medida text-subtitulo">Con los servicios típicos, sus duraciones y precios de referencia, y la pregunta justa al reservar.</p>
          <div className="mt-10 grid gap-8 @3xl:grid-cols-2 @6xl:grid-cols-4">
            {Object.entries(GRUPOS).map(([grupo, lista]) => (
              <div key={grupo}>
                <h3 className="border-b-2 border-tinta pb-2 font-semibold">{grupo}</h3>
                <ul className="mt-3 space-y-1.5 text-chico">
                  {lista.map(([id, nombre]) => (
                    <li key={id}>{nombre}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="precios" aria-labelledby="niveles-turnos" className={`${margen} scroll-mt-4 py-20`} data-precios>
          <div className="grid gap-6 @5xl:grid-cols-12 @5xl:items-end">
            <h2 id="niveles-turnos" className={`${afiche} text-titulo @5xl:col-span-7`}>
              Sola o con <span className="resaltado">tu página</span>
            </h2>
            <p className="max-w-medida text-subtitulo @5xl:col-span-5">Un pago único para dejarla andando y un mensual que cubre la base de datos, el soporte y las actualizaciones.</p>
          </div>
          <ul className="mt-12 grid gap-4 @4xl:grid-cols-2">
            <li className="flex flex-col rounded-base border-2 border-tinta bg-superficie p-7">
              <h3 className={`${afiche} text-[clamp(2rem,1.4rem+2cqi,2.75rem)] leading-none`}>Agenda sola</h3>
              <p className="mt-3 text-tinta-suave">Tu link de reservas y el panel. Ideal si ya te encuentran por Instagram o WhatsApp.</p>
              <p className="mt-6">
                <span className={`${afiche} text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(plan.unico)}</span>
                <span className="mt-1 block text-chico">pago único + {formatearPesos(plan.mensual)} por mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-chico">
                {["Página de reservas con tu diseño", "Panel: hoy, agenda, caja, números y clientes", "Servicios, horarios y profesionales cargados", "Base de datos, soporte y actualizaciones"].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.5em] h-1.5 w-3 shrink-0 bg-acento" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/turnos/demo#/probar" className={`${boton.contorno} mt-8`}>
                Probala con tus datos
              </Link>
            </li>
            <li className="flex flex-col rounded-base border-2 border-tinta bg-acento-relleno p-7 text-sobre-acento">
              <p className="text-chico font-semibold">Paquete · te ahorrás {formatearPesos(ahorro.unico)}</p>
              <h3 className={`${afiche} mt-1 text-[clamp(2rem,1.4rem+2cqi,2.75rem)] leading-none`}>Web + Turnos</h3>
              <p className="mt-3">Tu página con los turnos adentro: te conocen y reservan en el mismo lugar.</p>
              <p className="mt-6">
                <span className="block text-chico">desde</span>
                <span className={`${afiche} text-[clamp(2.5rem,1.6rem+3cqi,3.5rem)] leading-none tabular-nums`}>{formatearPesos(paquete.unico)}</span>
                <span className="mt-1 block text-chico">pago único + {formatearPesos(paquete.mensual)} por mes</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-chico">
                {["Página web con una plantilla de tu rubro", "Turnos guardados, sin superposiciones", "Panel para gestionar turnos y consultas", "Hosting, base de datos y mantenimiento"].map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className="mt-[0.5em] h-1.5 w-3 shrink-0 bg-tinta" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link href="/configurador" className={`${boton.tinta} mt-8`}>
                Armar mi página con turnos
              </Link>
            </li>
          </ul>
          <div className="mt-4 rounded-base border-2 border-dashed border-tinta p-6">
            <p className="font-semibold">Adicionales</p>
            <ul className="mt-3 grid gap-3 text-chico @3xl:grid-cols-2">
              <li>
                <strong className="font-semibold">{EXTRAS.recordatorios.nombre}:</strong> {EXTRAS.recordatorios.descripcion} {formatearPesos(EXTRAS.recordatorios.unico)} +{" "}
                {formatearPesos(EXTRAS.recordatorios.mensual)} por mes.
              </li>
              <li>
                <strong className="font-semibold">Seña online:</strong> que paguen una parte al reservar. Se presupuesta según el medio de pago.
              </li>
            </ul>
          </div>
          <p className="mt-4 text-chico text-tinta-suave">Precios de referencia, actualizados cada tres meses · próxima actualización: {proximaActualizacion()}.</p>
        </section>

        <section aria-labelledby="demos-rubro" className={`${margen} border-t-2 border-tinta py-20`}>
          <h2 id="demos-rubro" className={`${afiche} text-titulo`}>
            Mirala con <span className="resaltado">tu rubro</span>
          </h2>
          <p className="mt-3 max-w-medida text-subtitulo">Una demo ya cargada con los servicios típicos. Tocá la tuya y reservá como lo haría tu cliente.</p>
          <ul className="mt-10 grid gap-3 @3xl:grid-cols-2 @6xl:grid-cols-4">
            {DEMOS_RUBRO.map(([profesion, nombre, detalle]) => (
              <li key={profesion}>
                <Link
                  href={linkDemoAgenda(nombre, profesion, "")}
                  className="flex h-full flex-col justify-between gap-3 rounded-base border-2 border-tinta bg-superficie p-5 transition-colors hover:bg-acento-relleno hover:text-sobre-acento"
                >
                  <span className={`${afiche} text-[1.8rem] leading-none`}>{nombre}</span>
                  <span className="text-chico">{detalle} →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="preguntas-agenda" className={`${margen} bg-superficie-2 py-20`}>
          <div className="mx-auto max-w-4xl">
            <h2 id="preguntas-agenda" className={`${afiche} text-center text-[clamp(2.4rem,1.2rem+5cqi,4.25rem)] leading-[0.95]`}>
              Preguntas de la agenda
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
            <p className="mt-10 text-center">
              <Link href="/caja" className="font-semibold underline underline-offset-4">
                ¿Tenés un local con mostrador? Mirá también la caja
              </Link>
            </p>
          </div>
        </section>
      </main>
      <Pie />
      <AvisoPrecios />
      <Alto whatsapp={process.env.NEXT_PUBLIC_OWNER_WHATSAPP} contexto="turnos" />
    </div>
  );
}
