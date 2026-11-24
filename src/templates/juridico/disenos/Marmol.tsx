"use client";

/*
 * Mármol: la fachada de un palacio de justicia. Frontón y columnas estriadas en la portada,
 * áreas como columnas, el equipo en medallones, los pasos como una escalinata y el pedido de
 * reunión bajo un arco. Letras romanas (Cinzel) sobre mármol claro.
 */
import type { CSSProperties } from "react";
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

function Titulo({ titulo, bajada }: { titulo: string; bajada?: string }) {
  return (
    <div className="text-center">
      <h2 className="text-[clamp(1.7rem,3.8cqi,2.8rem)] font-semibold uppercase tracking-[0.14em]">{titulo}</h2>
      <div aria-hidden className="mx-auto mt-4 h-[5px] w-28 border-y border-[color:var(--ju-detalle)]" />
      {bajada && <p className="mx-auto mt-4 max-w-[34rem] italic text-tinta-suave">{bajada}</p>}
    </div>
  );
}

function Columna({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`flex flex-col items-center ${className}`}>
      <div className="h-3 w-[120%] bg-superficie-2 shadow-[inset_0_-2px_0_var(--lk-borde)]" />
      <div className="ju-estrias w-full flex-1 bg-superficie" />
      <div className="h-3 w-[120%] bg-superficie-2 shadow-[inset_0_2px_0_var(--lk-borde)]" />
    </div>
  );
}

function Portada() {
  const { marca } = useDatos();
  const menu = useMenu();
  return (
    <header id="inicio" className="ju-marmol">
      <nav aria-label="Secciones" className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-5 py-5 @2xl:px-10">
        <a href="#inicio" className="font-display text-chico font-semibold uppercase tracking-[0.2em] no-underline">
          {marca.nombre}
        </a>
        <ul className="hidden gap-7 font-display text-mini uppercase tracking-[0.16em] @5xl:flex">
          {menu.map((m) => (
            <li key={m.id}>
              <a href={`#${m.id}`} className="no-underline hover:text-acento-texto">
                {m.texto}
              </a>
            </li>
          ))}
        </ul>
        <BotonReunion className="ju-btn ju-btn-borde min-h-10! px-4! py-2! font-display text-mini uppercase tracking-[0.14em]">Reunión</BotonReunion>
      </nav>
      <div className="mx-auto max-w-[1100px] px-5 pb-16 pt-6 @2xl:px-10 @2xl:pb-24">
        {/* Frontón */}
        <div className="relative mx-auto max-w-[52rem]">
          <div className="ju-fronton mx-auto h-[clamp(4.5rem,12cqi,8rem)] bg-superficie-2" />
          <div className="ju-fronton absolute inset-x-[6%] bottom-0 mx-auto h-[calc(100%-14px)] bg-superficie" />
          <p className="absolute inset-x-0 bottom-3 text-center font-display text-[clamp(0.9rem,2.2cqi,1.4rem)] font-semibold tracking-[0.3em] text-[color:var(--ju-detalle)]">
            {marca.iniciales}
          </p>
        </div>
        <div className="mx-auto h-4 max-w-[54rem] bg-superficie-2 shadow-[inset_0_-2px_0_var(--lk-borde)]" />
        <div className="mx-auto grid max-w-[52rem] grid-cols-[1fr] gap-6 @3xl:grid-cols-[3.5rem_1fr_3.5rem] @3xl:gap-10">
          <Columna className="hidden @3xl:flex" />
          <div className="py-10 text-center @2xl:py-14">
            <h1 className="text-[clamp(2.2rem,6.4cqi,4.6rem)] font-semibold uppercase leading-[1.02] tracking-[0.08em]">{marca.nombre}</h1>
            <p className="mt-3 font-display text-mini uppercase tracking-[0.4em] text-tinta-suave">Abogados · {marca.zona}</p>
            <p className="mx-auto mt-8 max-w-[32rem] text-[clamp(1.3rem,2.4cqi,1.7rem)] italic leading-snug">{marca.eslogan}</p>
            {marca.subtitulo && <p className="mx-auto mt-4 max-w-[34rem] text-tinta-suave">{marca.subtitulo}</p>}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <BotonReunion className="ju-btn ju-btn-lleno font-display uppercase tracking-[0.12em]">Pedir una reunión</BotonReunion>
              <a href="#areas" className="ju-btn ju-btn-borde font-display uppercase tracking-[0.12em]">
                Áreas
              </a>
            </div>
          </div>
          <Columna className="hidden @3xl:flex" />
        </div>
        {/* Escalones de la base */}
        <div aria-hidden className="mx-auto max-w-[56rem]">
          <div className="mx-auto h-3 w-[96%] bg-superficie-2" />
          <div className="h-3 w-full bg-borde" />
        </div>
      </div>
    </header>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <section id="areas" className="mx-auto max-w-[1180px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo titulo="Áreas de práctica" bajada="Cada columna sostiene una parte del estudio." />
      <ul className="mt-12 grid gap-6 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {areas.map((a) => (
          <li key={a.id} className="flex flex-col border border-borde bg-superficie">
            <div aria-hidden className="h-3 bg-superficie-2 shadow-[inset_0_-2px_0_var(--lk-borde)]" />
            <div aria-hidden className="ju-estrias h-8" />
            <div className="flex flex-1 flex-col px-6 pb-6 pt-4 text-center">
              <h3 className="font-display text-cuerpo font-semibold uppercase tracking-[0.1em]">{a.nombre}</h3>
              {a.descripcion && <p className="mt-3 flex-1 text-tinta-suave">{a.descripcion}</p>}
              <p className="mt-3 text-mini uppercase tracking-[0.12em] text-tinta-suave">{detalleArea(a)}</p>
              <BotonReunion pre={{ servicioId: a.id }} className="mt-4 cursor-pointer font-display text-mini font-semibold uppercase tracking-[0.14em] text-acento-texto underline underline-offset-4">
                Consultar
              </BotonReunion>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Equipo() {
  const { equipo } = useDatos();
  return (
    <section id="equipo" className="ju-marmol scroll-mt-6 border-y border-borde py-20">
      <div className="mx-auto max-w-[1180px] px-5 @2xl:px-10">
        <Titulo titulo="El estudio" />
        <ul className="mt-12 grid gap-12 @3xl:grid-cols-3">
          {equipo.map((p) => (
            <li key={p.id} className="text-center">
              <div className="mx-auto w-44 rounded-full border border-[color:var(--ju-detalle)] p-2">
                <Retrato persona={p} className="aspect-square w-full rounded-full grayscale" />
              </div>
              <h3 className="mt-5 font-display text-cuerpo font-semibold uppercase tracking-[0.1em]">{p.nombre}</h3>
              <p className="mt-1 italic">
                {p.rol} · {p.especialidad}
              </p>
              {p.matricula && <p className="mt-1 font-display text-mini tracking-[0.14em] text-tinta-suave">{p.matricula}</p>}
              {p.bio && <p className="mx-auto mt-3 max-w-[20rem] text-tinta-suave">{p.bio}</p>}
              <BotonReunion pre={{ profesionalId: p.id }} className="mt-3 cursor-pointer font-display text-mini font-semibold uppercase tracking-[0.14em] text-acento-texto underline underline-offset-4">
                Pedir reunión
              </BotonReunion>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** Los pasos como una escalinata: cada uno un escalón más arriba. */
function Proceso() {
  const { pasos } = useDatos();
  return (
    <section id="proceso" className="mx-auto max-w-[1180px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo titulo="Cómo trabajamos" />
      <ol className="mt-12 grid items-end gap-3 @3xl:grid-cols-4">
        {pasos.map((p, i) => (
          <li key={p} className="border border-borde bg-superficie p-5 @3xl:[min-height:var(--alto)]" style={{ "--alto": `${9 + i * 2.5}rem` } as CSSProperties}>
            <p className="font-display text-subtitulo font-semibold text-[color:var(--ju-detalle)]">{ROMANOS[i] ?? i + 1}</p>
            <p className="mt-2">{p}</p>
          </li>
        ))}
      </ol>
      <div aria-hidden className="mt-0 h-3 bg-borde" />
    </section>
  );
}

function Reunion() {
  const { wa } = useDatos();
  return (
    <section className="ju-marmol py-20">
      <div className="mx-auto max-w-[760px] px-5 @2xl:px-10">
        <div className="rounded-t-[999px] border border-b-0 border-borde bg-superficie px-6 pb-6 pt-16 text-center @2xl:pt-20">
          <Titulo titulo="Reuniones" bajada="En el estudio o por videollamada. Elegí el tema, el día y la hora: te confirmamos por WhatsApp." />
          <a href={wa("Hola! Tengo una consulta urgente.")} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-display text-mini uppercase tracking-[0.14em] text-acento-texto underline underline-offset-4">
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
    <section id="preguntas" className="mx-auto max-w-[860px] scroll-mt-6 px-5 py-20 @2xl:px-10">
      <Titulo titulo="Preguntas" />
      <ListaPreguntas className="mt-10" pregunta="font-display text-chico font-semibold uppercase tracking-[0.08em]" />
    </section>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <section id="contacto" className="scroll-mt-6 border-t border-borde">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-20 @2xl:px-10 @5xl:grid-cols-2">
        <div className="text-center @5xl:text-left">
          <h2 className="text-[clamp(1.6rem,3.4cqi,2.4rem)] font-semibold uppercase tracking-[0.12em]">{marca.direccionLineas[0]}</h2>
          <p className="mt-2 italic text-tinta-suave">{marca.direccionLineas[1]}</p>
          {marca.horario && <p className="mt-5">{marca.horario}</p>}
          <div className="mt-7 flex flex-wrap justify-center gap-3 @5xl:justify-start">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno font-display uppercase tracking-[0.12em]">
              WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde font-display uppercase tracking-[0.12em]">
              Cómo llegar
            </a>
          </div>
        </div>
        <Mapa className="aspect-[4/3] w-full border border-borde" />
      </div>
    </section>
  );
}

export const marmol: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
  pie: "ju-marmol",
};
