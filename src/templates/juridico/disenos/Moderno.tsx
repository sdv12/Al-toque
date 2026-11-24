"use client";

/* Contemporáneo: claro y redondeado, con el pedido de reunión ya en la portada y áreas en tarjetas con ícono. */
import type { ReactNode } from "react";
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

/** Ícono según la categoría o el nombre del área (balanza si no reconoce nada). */
function Icono({ texto }: { texto: string }) {
  const t = texto.toLowerCase();
  const trazo = (d: ReactNode) => (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
  if (/famil|divorc|suces|herenc/.test(t))
    return trazo(
      <>
        <circle cx="8" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M2.5 20c.6-3.6 2.8-5.5 5.5-5.5s4.9 1.9 5.5 5.5M13.5 20c.3-2.6 1.6-4.3 3.5-4.3s3.2 1.7 3.5 4.3" />
      </>,
    );
  if (/trabaj|labor|despid/.test(t))
    return trazo(
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8.5 7V5.2A1.7 1.7 0 0 1 10.2 3.5h3.6a1.7 1.7 0 0 1 1.7 1.7V7M3 12.5h18" />
      </>,
    );
  if (/consum|compra|banco/.test(t))
    return trazo(
      <>
        <path d="M3 4h2l2.2 11h11l2-8H6.2" />
        <circle cx="9" cy="19.5" r="1.3" />
        <circle cx="17" cy="19.5" r="1.3" />
      </>,
    );
  if (/contrat|alquil|civil|inmob/.test(t))
    return trazo(
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v4h4M9 12h7M9 16h5" />
      </>,
    );
  if (/empres|pyme|comerc|societ/.test(t))
    return trazo(
      <>
        <path d="M3 21h18M5 21V8l7-4 7 4v13" />
        <path d="M9 21v-5h6v5M9 11h.01M15 11h.01" />
      </>,
    );
  return trazo(
    <>
      <path d="M12 3v18M7 21h10M4 7h16" />
      <path d="M6.5 7 3.5 14a3 3 0 0 0 6 0zM17.5 7l-3 7a3 3 0 0 0 6 0z" />
    </>,
  );
}

function Portada() {
  const { marca } = useDatos();
  const menu = useMenu();
  return (
    <header id="inicio">
      <nav aria-label="Secciones" className="sticky top-0 z-30 border-b border-borde bg-fondo/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-3.5 @2xl:px-8">
          <a href="#inicio" className="flex items-center gap-2.5 font-display text-cuerpo font-extrabold no-underline">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-acento-relleno text-mini text-sobre-acento">{marca.iniciales}</span>
            {marca.nombre}
          </a>
          <ul className="hidden gap-6 text-chico font-medium text-tinta-suave @5xl:flex">
            {menu.map((m) => (
              <li key={m.id}>
                <a href={`#${m.id}`} className="no-underline hover:text-tinta">
                  {m.texto}
                </a>
              </li>
            ))}
          </ul>
          <BotonReunion className="ju-btn ju-btn-lleno min-h-10! px-4! py-2! text-chico">Reunión</BotonReunion>
        </div>
      </nav>
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 py-12 @2xl:px-8 @2xl:py-16 @5xl:grid-cols-[1.1fr_1fr] @5xl:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-[color:var(--ju-detalle)] px-3 py-1 text-mini font-semibold text-acento-texto">
            <span className="size-2 rounded-full bg-acento" /> Reuniones presenciales y por videollamada
          </p>
          <h1 className="mt-6 text-[clamp(2.3rem,5.6cqi,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{marca.eslogan || marca.nombre}</h1>
          {marca.subtitulo && <p className="mt-5 max-w-[34rem] text-subtitulo text-tinta-suave">{marca.subtitulo}</p>}
          <ul className="mt-8 grid gap-3 text-chico @2xl:grid-cols-2">
            {[marca.direccion, marca.horario].filter(Boolean).map((d) => (
              <li key={d} className="rounded-[12px] border border-borde bg-superficie px-4 py-3">
                {d}
              </li>
            ))}
          </ul>
        </div>
        <Hueco />
      </section>
    </header>
  );
}

/** El widget va en la portada si la sección de reunión está prendida; si no, una tarjeta con WhatsApp. */
function Hueco() {
  const { activa, wa, marca } = useDatos();
  if (activa("reunion")) return <WidgetReunion className="shadow-[0_30px_60px_-35px_rgb(15_27_42/0.45)]" />;
  return (
    <div className="rounded-[var(--lk-radio)] border border-borde bg-superficie p-8">
      <p className="text-subtitulo font-bold">Contanos tu caso</p>
      <p className="mt-2 text-tinta-suave">Te respondemos por WhatsApp en el horario de atención{marca.horario ? `: ${marca.horario.toLowerCase()}` : ""}.</p>
      <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno mt-6">
        Escribir por WhatsApp
      </a>
    </div>
  );
}

function Titulo({ eyebrow, titulo, bajada }: { eyebrow: string; titulo: string; bajada?: string }) {
  return (
    <div className="max-w-[40rem]">
      <p className="text-chico font-bold text-acento-texto">{eyebrow}</p>
      <h2 className="mt-2 text-[clamp(1.9rem,3.6cqi,2.8rem)] font-extrabold leading-tight tracking-[-0.03em]">{titulo}</h2>
      {bajada && <p className="mt-3 text-tinta-suave">{bajada}</p>}
    </div>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <section id="areas" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-16 @2xl:px-8 @2xl:py-20">
      <Titulo eyebrow="Áreas de práctica" titulo="¿En qué te podemos ayudar?" bajada="Tocá un área para pedir la reunión con quien la lleva." />
      <ul className="mt-10 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {areas.map((a) => (
          <li key={a.id}>
            <BotonReunion
              pre={{ servicioId: a.id }}
              className="group flex h-full w-full cursor-pointer flex-col rounded-[var(--lk-radio)] border border-borde bg-superficie p-6 text-left transition-[border-color,transform] hover:-translate-y-0.5 hover:border-acento"
            >
              <span className="flex size-11 items-center justify-center rounded-[12px] bg-[color:var(--ju-detalle)] text-acento-texto">
                <Icono texto={`${a.categoria ?? ""} ${a.nombre}`} />
              </span>
              <span className="mt-5 block text-subtitulo font-bold">{a.nombre}</span>
              {a.descripcion && <span className="mt-2 block text-chico text-tinta-suave">{a.descripcion}</span>}
              <span className="mt-auto flex items-center justify-between pt-5 text-mini text-tinta-suave">
                {detalleArea(a)}
                <span aria-hidden className="text-cuerpo text-acento-texto transition-transform group-hover:translate-x-1">
                  →
                </span>
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
    <section id="equipo" className="scroll-mt-20 bg-superficie py-16 @2xl:py-20">
      <div className="mx-auto max-w-[1200px] px-5 @2xl:px-8">
        <Titulo eyebrow="Equipo" titulo="Las personas detrás de cada caso" />
        <ul className="mt-10 grid gap-5 @3xl:grid-cols-2 @5xl:grid-cols-3">
          {equipo.map((p) => (
            <li key={p.id} className="flex flex-col rounded-[var(--lk-radio)] border border-borde bg-fondo p-5">
              <div className="flex items-center gap-4">
                <Retrato persona={p} className="size-20 shrink-0 rounded-[16px]" letras="text-subtitulo!" />
                <div>
                  <h3 className="font-cuerpo text-cuerpo font-bold">{p.nombre}</h3>
                  <p className="text-chico text-tinta-suave">{p.rol}</p>
                  {p.matricula && <p className="text-mini text-tinta-suave">{p.matricula}</p>}
                </div>
              </div>
              <p className="mt-4 inline-block self-start rounded-full bg-[color:var(--ju-detalle)] px-3 py-1 text-mini font-semibold text-acento-texto">{p.especialidad}</p>
              {p.bio && <p className="mt-3 text-chico text-tinta-suave">{p.bio}</p>}
              <div className="mt-auto pt-5">
                <BotonReunion pre={{ profesionalId: p.id }} className="ju-btn ju-btn-borde w-full text-chico">
                  Pedir reunión
                </BotonReunion>
              </div>
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
    <section id="proceso" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 py-16 @2xl:px-8 @2xl:py-20">
      <Titulo eyebrow="Cómo trabajamos" titulo="Claro desde la primera reunión" />
      <ol className="mt-10 grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-4">
        {pasos.map((p, i) => (
          <li key={p} className="relative rounded-[var(--lk-radio)] border border-borde bg-superficie p-6">
            <span className="flex size-9 items-center justify-center rounded-full bg-acento-relleno text-chico font-bold text-sobre-acento">{i + 1}</span>
            <p className="mt-4 text-chico">{p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** El widget ya está en la portada: acá, un recordatorio con la opción de WhatsApp. */
function Reunion() {
  const { wa } = useDatos();
  return (
    <section className="mx-auto max-w-[1200px] px-5 py-6 @2xl:px-8">
      <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--lk-radio)] bg-acento-relleno px-7 py-8 text-sobre-acento @3xl:flex-row @3xl:items-center">
        <div>
          <p className="text-subtitulo font-bold">¿Preferís hablar antes?</p>
          <p className="mt-1 opacity-85">Escribinos y te orientamos sobre qué tipo de reunión necesitás.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <BotonReunion className="ju-btn bg-sobre-acento text-acento-texto">Elegir día y hora</BotonReunion>
          <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde">
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section id="preguntas" className="mx-auto grid max-w-[1200px] scroll-mt-20 gap-10 px-5 py-16 @2xl:px-8 @2xl:py-20 @5xl:grid-cols-[1fr_1.6fr]">
      <Titulo eyebrow="Preguntas frecuentes" titulo="Lo que nos preguntan siempre" />
      <ListaPreguntas pregunta="font-bold" />
    </section>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <section id="contacto" className="mx-auto max-w-[1200px] scroll-mt-20 px-5 pb-16 @2xl:px-8">
      <div className="grid overflow-hidden rounded-[var(--lk-radio)] border border-borde bg-superficie @5xl:grid-cols-2">
        <div className="p-8 @2xl:p-10">
          <p className="text-chico font-bold text-acento-texto">Contacto</p>
          <h2 className="mt-2 text-[clamp(1.7rem,3cqi,2.4rem)] font-extrabold leading-tight tracking-[-0.03em]">{marca.direccionLineas[0]}</h2>
          <p className="text-tinta-suave">{marca.direccionLineas[1]}</p>
          {marca.horario && <p className="mt-5 text-chico">{marca.horario}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno">
              WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde">
              Cómo llegar
            </a>
          </div>
        </div>
        <Mapa className="min-h-64 w-full" />
      </div>
    </section>
  );
}

export const moderno: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
};
