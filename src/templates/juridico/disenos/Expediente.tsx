"use client";

/* Expediente: carpeta de cartón, hojas rayadas, máquina de escribir y sellos de goma. */
import type { ReactNode } from "react";
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

const foja = (n: number) => `Fs. ${String(n).padStart(3, "0")}`;

/** Una hoja del expediente con su pestaña. */
function Hoja({ id, pestana, numero, children, className = "" }: { id?: string; pestana: string; numero: number; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-[1100px] scroll-mt-6 px-4 py-8 @2xl:px-8 @2xl:py-10 ${className}`}>
      <div className="relative">
        <span className="relative z-10 ml-6 inline-block rounded-t-[6px] border border-b-0 border-borde bg-superficie px-5 py-2 font-display text-mini font-bold uppercase tracking-[0.14em]">
          {pestana}
        </span>
        <div className="ju-papel ju-perforado -mt-px border border-borde px-6 py-8 pl-12 shadow-[0_2px_0_var(--lk-borde),0_18px_30px_-24px_rgb(42_33_24/0.6)] @2xl:px-12 @2xl:pl-16">
          <p className="absolute right-5 top-14 font-display text-mini text-tinta-suave">{foja(numero)}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

function Renglon({ campo, children }: { campo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col py-1.5 font-display text-chico @2xl:flex-row @2xl:items-end @2xl:gap-2">
      <span className="shrink-0 font-bold uppercase">{campo}:</span>
      <span className="ju-guiones hidden h-3 min-w-6 flex-1 @2xl:block" aria-hidden />
      <span className="@2xl:text-right">{children}</span>
    </div>
  );
}

function Portada() {
  const { marca, areas } = useDatos();
  const menu = useMenu();
  return (
    <header id="inicio">
      <nav aria-label="Secciones" className="border-b-2 border-dashed border-borde">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-4 py-3 @2xl:px-8">
          <a href="#inicio" className="font-display text-cuerpo font-bold uppercase tracking-[0.08em] no-underline">
            {marca.nombre}
          </a>
          <ul className="hidden gap-5 font-display text-mini uppercase @5xl:flex">
            {menu.map((m) => (
              <li key={m.id}>
                <a href={`#${m.id}`} className="no-underline hover:text-acento-texto">
                  [{m.texto}]
                </a>
              </li>
            ))}
          </ul>
          <BotonReunion className="ju-btn ju-btn-lleno min-h-10! px-4! py-2! font-display text-mini uppercase">Pedir reunión</BotonReunion>
        </div>
      </nav>
      <div className="mx-auto max-w-[1100px] px-4 pb-6 pt-10 @2xl:px-8 @2xl:pt-14">
        {/* La carpeta: tapa de cartón con la carátula pegada. */}
        <div className="relative rounded-[4px] bg-superficie-2 p-3 shadow-[0_30px_50px_-30px_rgb(42_33_24/0.7)] @2xl:p-5">
          <span className="absolute -top-7 left-8 rounded-t-[8px] bg-superficie-2 px-6 pb-1 pt-2 font-display text-mini font-bold uppercase tracking-[0.14em]">
            Expte. N° 001 · {marca.iniciales}
          </span>
          <div className="ju-papel relative overflow-hidden border border-borde px-6 py-10 @2xl:px-14 @2xl:py-14">
            <div className="grid gap-10 @5xl:grid-cols-[1.4fr_1fr] @5xl:gap-14">
              <div>
                <p className="font-display text-mini font-bold uppercase tracking-[0.2em] text-tinta-suave">Carátula</p>
                <h1 className="mt-4 text-[clamp(2rem,5.4cqi,3.9rem)] font-bold leading-[1.05] tracking-[-0.02em]">{marca.eslogan || marca.nombre}</h1>
                {marca.subtitulo && <p className="mt-6 max-w-[36rem] text-subtitulo leading-relaxed">{marca.subtitulo}</p>}
                <div className="mt-8 flex flex-wrap gap-3">
                  <BotonReunion className="ju-btn ju-btn-lleno font-display uppercase">Pedir reunión</BotonReunion>
                  <a href="#areas" className="ju-btn ju-btn-borde font-display uppercase">
                    Ver áreas
                  </a>
                </div>
              </div>
              <div className="self-end">
                <Renglon campo="Estudio">{marca.nombre}</Renglon>
                <Renglon campo="Domicilio">{marca.direccionLineas[0]}</Renglon>
                <Renglon campo="Ciudad">{marca.direccionLineas[1] || marca.zona}</Renglon>
                {marca.horario && <Renglon campo="Atención">{marca.horario.replace(/ h$/, "")}</Renglon>}
                <Renglon campo="Materias">{areas.length}</Renglon>
              </div>
            </div>
            <span className="ju-sello-goma absolute right-4 top-4 text-mini @2xl:right-10 @2xl:top-8 @2xl:text-chico">Consultas abiertas</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <Hoja id="areas" pestana="Materias" numero={2}>
      <h2 className="text-titulo font-bold">Áreas de práctica</h2>
      <ul className="mt-8 grid gap-5 @3xl:grid-cols-2">
        {areas.map((a, i) => (
          <li key={a.id} className="relative border border-borde bg-superficie p-5 pt-7 shadow-[3px_3px_0_var(--lk-borde)]">
            <span className="absolute -top-3 left-4 bg-acento-relleno px-2 py-0.5 font-display text-mini font-bold text-sobre-acento">Ficha {i + 1}</span>
            <h3 className="text-subtitulo font-bold">{a.nombre}</h3>
            {a.descripcion && <p className="mt-2 text-chico">{a.descripcion}</p>}
            <p className="mt-3 font-display text-mini uppercase text-tinta-suave">{detalleArea(a)}</p>
            <BotonReunion pre={{ servicioId: a.id }} className="mt-3 cursor-pointer font-display text-mini font-bold uppercase text-acento-texto underline underline-offset-4">
              Iniciar consulta →
            </BotonReunion>
          </li>
        ))}
      </ul>
    </Hoja>
  );
}

function Equipo() {
  const { equipo } = useDatos();
  return (
    <Hoja id="equipo" pestana="Letrados" numero={3}>
      <h2 className="text-titulo font-bold">El estudio</h2>
      <ul className="mt-8 grid gap-6 @3xl:grid-cols-2 @5xl:grid-cols-3">
        {equipo.map((p) => (
          <li key={p.id} className="border-2 border-tinta bg-superficie">
            <p className="border-b-2 border-tinta bg-[color:var(--ju-detalle)] px-4 py-1.5 font-display text-mini font-bold uppercase tracking-[0.14em] text-superficie">Credencial</p>
            <div className="flex gap-4 p-4">
              <Retrato persona={p} className="aspect-[3/4] w-20 shrink-0 border border-borde sepia-[.35]" letras="text-subtitulo!" />
              <div className="min-w-0">
                <h3 className="text-cuerpo font-bold leading-tight">{p.nombre}</h3>
                <p className="mt-1 text-mini">{p.rol}</p>
                {p.matricula && <p className="mt-1 font-display text-mini font-bold">{p.matricula}</p>}
              </div>
            </div>
            <div className="border-t border-dashed border-borde px-4 py-3">
              <p className="font-display text-mini uppercase text-tinta-suave">{p.especialidad}</p>
              {p.bio && <p className="mt-2 text-chico">{p.bio}</p>}
              <BotonReunion pre={{ profesionalId: p.id }} className="mt-3 cursor-pointer font-display text-mini font-bold uppercase text-acento-texto underline underline-offset-4">
                Pedir reunión
              </BotonReunion>
            </div>
          </li>
        ))}
      </ul>
    </Hoja>
  );
}

function Proceso() {
  const { pasos } = useDatos();
  return (
    <Hoja id="proceso" pestana="Trámite" numero={4}>
      <h2 className="text-titulo font-bold">Cómo trabajamos</h2>
      <ol className="mt-6">
        {pasos.map((p, i) => (
          <li key={p} className="flex gap-4 border-b border-dashed border-borde py-4">
            <span className="font-display font-bold text-acento-texto">{String(i + 1).padStart(2, "0")}.</span>
            <p className="text-subtitulo leading-snug">{p}</p>
          </li>
        ))}
      </ol>
    </Hoja>
  );
}

function Reunion() {
  const { wa } = useDatos();
  return (
    <Hoja pestana="Agenda" numero={5}>
      <div className="grid gap-8 @5xl:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="text-titulo font-bold">Pedí una reunión</h2>
          <p className="mt-4">En el estudio o por videollamada. Completá la ficha y te confirmamos por WhatsApp.</p>
          <span className="ju-sello-goma mt-8 text-chico">Sin compromiso</span>
          <p className="mt-8">
            <a href={wa("Hola! Tengo una consulta urgente.")} target="_blank" rel="noopener noreferrer" className="font-display font-bold uppercase text-acento-texto underline underline-offset-4">
              Urgente: WhatsApp →
            </a>
          </p>
        </div>
        <WidgetReunion className="shadow-[4px_4px_0_var(--lk-borde)]" />
      </div>
    </Hoja>
  );
}

function Preguntas() {
  return (
    <Hoja id="preguntas" pestana="Consultas" numero={6}>
      <h2 className="text-titulo font-bold">Preguntas frecuentes</h2>
      <ListaPreguntas className="mt-6 border-dashed" pregunta="font-display font-bold" />
    </Hoja>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <Hoja id="contacto" pestana="Domicilio" numero={7}>
      <div className="grid gap-8 @5xl:grid-cols-2">
        <div>
          <h2 className="text-titulo font-bold">Domicilio del estudio</h2>
          <div className="mt-5">
            <Renglon campo="Calle">{marca.direccionLineas[0]}</Renglon>
            <Renglon campo="Ciudad">{marca.direccionLineas[1] || marca.zona}</Renglon>
            {marca.horario && <Renglon campo="Horario">{marca.horario.replace(/ h$/, "")}</Renglon>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno font-display uppercase">
              WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde font-display uppercase">
              Cómo llegar
            </a>
          </div>
        </div>
        <Mapa className="aspect-[4/3] w-full border border-borde sepia-[.3]" />
      </div>
    </Hoja>
  );
}

export const expediente: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
  pie: "mt-8 border-dashed bg-superficie-2",
};
