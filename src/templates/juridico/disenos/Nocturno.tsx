"use client";

/* Boutique nocturna: verde casi negro y bronce. Bodoni enorme, listas grandes y mucho aire. */
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

function Titulo({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div className="flex items-end gap-6">
      <span className="font-display text-subtitulo italic text-acento-texto">{numero}</span>
      <h2 className="text-[clamp(2.2rem,6cqi,4.6rem)] font-normal italic leading-none">{titulo}</h2>
      <span className="ju-bronce mb-3 hidden flex-1 @3xl:block" />
    </div>
  );
}

function Portada() {
  const { marca } = useDatos();
  const menu = useMenu();
  return (
    <header id="inicio" className="relative">
      <nav aria-label="Secciones" className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-5 py-6 @2xl:px-10">
        <a href="#inicio" className="font-display text-subtitulo italic no-underline">
          {marca.nombre}
        </a>
        <ul className="hidden gap-8 text-mini uppercase tracking-[0.2em] text-tinta-suave @5xl:flex">
          {menu.map((m) => (
            <li key={m.id}>
              <a href={`#${m.id}`} className="no-underline hover:text-acento-texto">
                {m.texto}
              </a>
            </li>
          ))}
        </ul>
        <BotonReunion className="cursor-pointer border-b border-acento pb-1 text-mini uppercase tracking-[0.2em] text-acento-texto">Reunión</BotonReunion>
      </nav>
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pb-20 pt-10 @2xl:px-10 @2xl:pb-28 @2xl:pt-16 @5xl:grid-cols-[auto_1fr]">
        <p className="hidden text-mini uppercase tracking-[0.4em] text-tinta-suave [writing-mode:vertical-rl] @5xl:block">Abogados · {marca.zona}</p>
        <div>
          <h1 className="text-[clamp(3rem,11cqi,9.5rem)] font-normal leading-[0.88] tracking-[-0.03em]">
            {marca.nombre.split(/\s+(?=&)|(?<=&)\s+/).map((parte, i) => (
              <span key={i} className={`block ${i % 2 ? "italic text-acento-texto" : ""}`}>
                {parte}
              </span>
            ))}
          </h1>
          <div className="ju-bronce mt-10" />
          <div className="mt-10 grid gap-8 @3xl:grid-cols-2">
            <p className="font-display text-[clamp(1.5rem,2.6cqi,2.1rem)] italic leading-snug">{marca.eslogan}</p>
            <div>
              {marca.subtitulo && <p className="text-tinta-suave">{marca.subtitulo}</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                <BotonReunion className="ju-btn ju-btn-lleno uppercase tracking-[0.14em]">Pedir una reunión</BotonReunion>
                <a href="#areas" className="ju-btn ju-btn-borde uppercase tracking-[0.14em]">
                  Áreas
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <section id="areas" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo numero="I" titulo="Áreas de práctica" />
      <ul className="mt-12 border-t border-borde">
        {areas.map((a) => (
          <li key={a.id} className="border-b border-borde">
            <BotonReunion
              pre={{ servicioId: a.id }}
              className="group grid w-full cursor-pointer gap-3 py-8 text-left @3xl:grid-cols-[1.1fr_1fr_auto] @3xl:items-center @3xl:gap-10"
            >
              <span className="font-display text-[clamp(1.7rem,3.6cqi,2.8rem)] leading-tight transition-colors group-hover:text-acento-texto">{a.nombre}</span>
              <span className="text-chico text-tinta-suave">
                {a.descripcion}
                <span className="mt-2 block text-mini uppercase tracking-[0.16em]">{detalleArea(a)}</span>
              </span>
              <span aria-hidden className="text-titulo text-acento-texto transition-transform group-hover:translate-x-2">
                →
              </span>
            </BotonReunion>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Equipo() {
  const { equipo } = useDatos();
  return (
    <section id="equipo" className="scroll-mt-6 bg-superficie py-20">
      <div className="mx-auto max-w-[1240px] px-5 @2xl:px-10">
        <Titulo numero="II" titulo="El estudio" />
        <ul className="mt-12 grid gap-10 @3xl:grid-cols-3">
          {equipo.map((p) => (
            <li key={p.id}>
              <Retrato persona={p} className="aspect-[3/4] w-full grayscale" />
              <div className="ju-bronce mt-5" />
              <h3 className="mt-5 text-subtitulo italic">{p.nombre}</h3>
              <p className="mt-1 text-mini uppercase tracking-[0.18em] text-acento-texto">{p.especialidad}</p>
              <p className="mt-1 text-mini text-tinta-suave">
                {p.rol}
                {p.matricula && ` · ${p.matricula}`}
              </p>
              {p.bio && <p className="mt-4 text-chico text-tinta-suave">{p.bio}</p>}
              <BotonReunion pre={{ profesionalId: p.id }} className="mt-4 cursor-pointer border-b border-acento pb-1 text-mini uppercase tracking-[0.18em] text-acento-texto">
                Reunión
              </BotonReunion>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Proceso() {
  const { pasos } = useDatos();
  return (
    <section id="proceso" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo numero="III" titulo="Cómo trabajamos" />
      <ol className="mt-12 grid gap-10 @3xl:grid-cols-2 @5xl:grid-cols-4">
        {pasos.map((p, i) => (
          <li key={p}>
            <span className="font-display text-[3.5rem] italic leading-none text-acento-texto">{i + 1}</span>
            <div className="ju-bronce my-4" />
            <p className="text-chico">{p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Reunion() {
  const { wa } = useDatos();
  return (
    <section className="border-y border-borde bg-superficie-2 py-20">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 @2xl:px-10 @5xl:grid-cols-[1fr_1.15fr]">
        <div>
          <Titulo numero="IV" titulo="Reuniones" />
          <p className="mt-8 max-w-[28rem] text-tinta-suave">En el estudio o por videollamada. Elegí el tema, el día y la hora: te confirmamos por WhatsApp.</p>
          <a href={wa("Hola! Tengo una consulta urgente.")} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block border-b border-acento pb-1 text-mini uppercase tracking-[0.2em] text-acento-texto">
            Urgencias por WhatsApp
          </a>
        </div>
        <WidgetReunion />
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section id="preguntas" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo numero="V" titulo="Preguntas" />
      <ListaPreguntas className="mt-12" pregunta="font-display text-subtitulo italic" />
    </section>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <section id="contacto" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo numero="VI" titulo="Dónde estamos" />
      <div className="mt-12 grid gap-10 @5xl:grid-cols-2">
        <div>
          <p className="font-display text-[clamp(1.8rem,3.4cqi,2.8rem)] leading-tight">{marca.direccionLineas[0]}</p>
          <p className="mt-1 text-tinta-suave">{marca.direccionLineas[1]}</p>
          {marca.horario && <p className="mt-6 text-chico uppercase tracking-[0.14em] text-acento-texto">{marca.horario}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno uppercase tracking-[0.14em]">
              WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde uppercase tracking-[0.14em]">
              Cómo llegar
            </a>
          </div>
        </div>
        <Mapa className="aspect-[4/3] w-full border border-borde" />
      </div>
    </section>
  );
}

export const nocturno: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
};
