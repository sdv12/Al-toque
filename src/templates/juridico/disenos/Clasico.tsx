"use client";

/* Clásico: papel crema, azul tinta y bronce. Sello circular, todo centrado, numerales romanos. */
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function Sello({ className = "" }: { className?: string }) {
  const { marca } = useDatos();
  const texto = `${marca.nombre} · Abogados · ${marca.zona.split(",").pop()?.trim() || "Córdoba"} · `.toUpperCase();
  return (
    <svg viewBox="0 0 200 200" className={`ju-sello ${className}`} role="img" aria-label={marca.nombre}>
      <defs>
        <path id="ju-sello-circulo" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fontSize="11.5" letterSpacing="3" fill="currentColor" fontFamily="var(--lk-fuente-cuerpo)">
        <textPath href="#ju-sello-circulo" textLength="480">
          {texto}
        </textPath>
      </text>
      <text x="100" y="114" textAnchor="middle" fontSize="40" fill="var(--lk-texto)" fontFamily="var(--lk-fuente-display)" fontWeight="600">
        {marca.iniciales}
      </text>
    </svg>
  );
}

function Titulo({ eyebrow, children }: { eyebrow: string; children: string }) {
  return (
    <div className="text-center">
      <p className="ju-etiqueta text-[color:var(--ju-detalle)]">{eyebrow}</p>
      <h2 className="mt-3 text-titulo font-semibold">{children}</h2>
      <div className="mx-auto mt-5 flex w-40 items-center gap-3 text-[color:var(--ju-detalle)]" aria-hidden>
        <span className="h-px flex-1 bg-current" />
        <span className="text-[0.7rem]">◆</span>
        <span className="h-px flex-1 bg-current" />
      </div>
    </div>
  );
}

function Portada() {
  const { marca } = useDatos();
  const menu = useMenu();
  return (
    <header>
      <div className="bg-acento-relleno text-sobre-acento">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2 text-mini @2xl:px-10">
          <span>{marca.direccion}</span>
          {marca.horario && <span className="opacity-80">{marca.horario}</span>}
        </div>
      </div>
      <nav aria-label="Secciones" className="border-b border-borde">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-6 px-5 py-4 @2xl:px-10">
          <a href="#inicio" className="font-display text-subtitulo font-semibold no-underline">
            {marca.nombre}
          </a>
          <ul className="hidden gap-7 text-chico @5xl:flex">
            {menu.map((m) => (
              <li key={m.id}>
                <a href={`#${m.id}`} className="no-underline hover:text-acento-texto">
                  {m.texto}
                </a>
              </li>
            ))}
          </ul>
          <BotonReunion className="ju-btn ju-btn-borde min-h-10! px-4! py-2! text-chico">Reunión</BotonReunion>
        </div>
      </nav>
      <section id="inicio" className="mx-auto max-w-[1000px] px-5 pb-20 pt-14 text-center @2xl:px-10 @2xl:pb-28 @2xl:pt-20">
        <Sello className="mx-auto w-36 @2xl:w-44" />
        <p className="ju-etiqueta mt-8 text-tinta-suave">Estudio jurídico · {marca.zona}</p>
        <h1 className="mt-4 text-display font-semibold">{marca.eslogan || marca.nombre}</h1>
        {marca.subtitulo && <p className="mx-auto mt-6 max-w-[40rem] text-subtitulo italic text-tinta-suave [font-family:var(--lk-fuente-display)]">{marca.subtitulo}</p>}
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <BotonReunion />
          <a href="#areas" className="ju-btn ju-btn-borde">
            Áreas de práctica
          </a>
        </div>
      </section>
      <div className="ju-filete-doble mx-auto max-w-[1180px]" />
    </header>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <section id="areas" className="mx-auto max-w-[1180px] scroll-mt-6 px-5 py-20 @2xl:px-10 @2xl:py-24">
      <Titulo eyebrow="En qué te podemos ayudar">Áreas de práctica</Titulo>
      <ol className="mt-14 grid gap-x-16 @3xl:grid-cols-2">
        {areas.map((a, i) => (
          <li key={a.id} className="grid grid-cols-[3.2rem_1fr] gap-4 border-t border-borde py-7">
            <span className="font-display text-titulo leading-none text-[color:var(--ju-detalle)]">{ROMANOS[i] ?? i + 1}</span>
            <div>
              <h3 className="text-subtitulo font-semibold">{a.nombre}</h3>
              {a.descripcion && <p className="mt-2 text-tinta-suave">{a.descripcion}</p>}
              <p className="mt-3 text-mini uppercase tracking-[0.12em] text-tinta-suave">{detalleArea(a)}</p>
              <BotonReunion pre={{ servicioId: a.id }} className="mt-3 cursor-pointer text-chico font-semibold text-acento-texto underline underline-offset-4">
                Pedir reunión por este tema
              </BotonReunion>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Equipo() {
  const { equipo } = useDatos();
  return (
    <section id="equipo" className="scroll-mt-6 bg-superficie-2/60 py-20 @2xl:py-24">
      <div className="mx-auto max-w-[1180px] px-5 @2xl:px-10">
        <Titulo eyebrow="Quiénes te atienden">El estudio</Titulo>
        <ul className="mt-14 grid gap-12 @3xl:grid-cols-3">
          {equipo.map((p) => (
            <li key={p.id} className="text-center">
              <Retrato persona={p} className="mx-auto aspect-[4/5] w-44 rounded-[50%] border-4 border-double border-[color:var(--ju-detalle)]" />
              <h3 className="mt-6 text-subtitulo font-semibold">{p.nombre}</h3>
              <p className="text-chico">
                {p.rol}
                {p.especialidad && ` · ${p.especialidad}`}
              </p>
              {p.matricula && <p className="mt-1 text-mini uppercase tracking-[0.14em] text-tinta-suave">{p.matricula}</p>}
              {p.bio && <p className="mx-auto mt-4 max-w-[22rem] text-chico text-tinta-suave">{p.bio}</p>}
              <BotonReunion pre={{ profesionalId: p.id }} className="mt-4 cursor-pointer text-chico font-semibold text-acento-texto underline underline-offset-4">
                Reunión con {p.nombre.split(" ")[1] ?? p.nombre}
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
    <section id="proceso" className="mx-auto max-w-[1180px] scroll-mt-6 px-5 py-20 @2xl:px-10 @2xl:py-24">
      <Titulo eyebrow="Sin sorpresas">Cómo trabajamos</Titulo>
      <ol className="mx-auto mt-14 max-w-[46rem] space-y-0">
        {pasos.map((p, i) => (
          <li key={p} className="grid grid-cols-[3rem_1fr] items-baseline gap-4 border-b border-borde py-5">
            <span className="font-display text-subtitulo italic text-[color:var(--ju-detalle)]">{ROMANOS[i]}.</span>
            <p className="text-subtitulo [font-family:var(--lk-fuente-display)]">{p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Reunion() {
  const { marca, wa } = useDatos();
  return (
    <section className="bg-acento-relleno py-20 text-sobre-acento @2xl:py-24">
      <div className="mx-auto grid max-w-[1180px] items-start gap-12 px-5 @2xl:px-10 @5xl:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="ju-etiqueta opacity-80">Reuniones</p>
          <h2 className="mt-3 text-titulo font-semibold">Elegí el día y la hora</h2>
          <p className="mt-5 max-w-[30rem] opacity-85">
            En el estudio o por videollamada. Te pedimos el tema y tu nombre, nada más: los detalles los hablamos en la reunión.
          </p>
          {marca.horario && <p className="mt-6 text-chico opacity-80">{marca.horario}</p>}
          <a href={wa("Hola! Tengo una consulta urgente.")} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde mt-8">
            ¿Es urgente? WhatsApp
          </a>
        </div>
        <WidgetReunion className="shadow-[0_24px_60px_-30px_rgb(0_0_0/0.5)]" />
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section id="preguntas" className="mx-auto max-w-[900px] scroll-mt-6 px-5 py-20 @2xl:px-10 @2xl:py-24">
      <Titulo eyebrow="Antes de venir">Preguntas frecuentes</Titulo>
      <ListaPreguntas className="mt-12" pregunta="font-display text-subtitulo font-semibold" />
    </section>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <section id="contacto" className="scroll-mt-6 border-t border-borde">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-20 @2xl:px-10 @5xl:grid-cols-2">
        <div className="text-center @5xl:text-left">
          <p className="ju-etiqueta text-[color:var(--ju-detalle)]">Dónde estamos</p>
          <h2 className="mt-3 text-titulo font-semibold">{marca.direccionLineas[0]}</h2>
          <p className="mt-1 text-subtitulo text-tinta-suave">{marca.direccionLineas[1]}</p>
          {marca.horario && <p className="mt-6">{marca.horario}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3 @5xl:justify-start">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno">
              Escribinos por WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde">
              Cómo llegar
            </a>
          </div>
        </div>
        <Mapa className="aspect-[4/3] w-full border border-borde" />
      </div>
    </section>
  );
}

export const clasico: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
  pie: "bg-superficie",
};
