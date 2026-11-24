"use client";

/* Editorial: un diario. Cabecera con filetes, titular enorme, columnas, capitular e índice numerado. */
import { BotonReunion, ListaPreguntas, Mapa, Retrato, WidgetReunion, detalleArea, useDatos, useMenu } from "../datos";
import type { Diseno } from "./tipos";

const dos = (n: number) => String(n).padStart(2, "0");

function Cabezal({ seccion, titulo, italica }: { seccion: string; titulo: string; italica?: string }) {
  return (
    <div className="border-t-4 border-tinta pt-3">
      <p className="ju-etiqueta flex justify-between text-tinta">
        <span>{seccion}</span>
        <span className="text-acento-texto">●</span>
      </p>
      <h2 className="mt-6 text-titulo font-medium tracking-[-0.02em]">
        {titulo} {italica && <em className="font-normal">{italica}</em>}
      </h2>
    </div>
  );
}

function Portada() {
  const { marca, areas } = useDatos();
  const menu = useMenu();
  return (
    <header id="inicio" className="mx-auto max-w-[1240px] px-5 pt-6 @2xl:px-10">
      <div className="flex items-center justify-between border-b border-tinta pb-3 text-mini">
        <span className="ju-etiqueta">Estudio jurídico</span>
        <span className="hidden @3xl:inline">{marca.direccion}</span>
        <BotonReunion className="cursor-pointer font-semibold text-acento-texto underline underline-offset-4">Pedir reunión</BotonReunion>
      </div>
      <p className="border-b-4 border-double border-tinta py-4 text-center font-display text-[clamp(2.6rem,10cqi,8.5rem)] font-semibold leading-[0.9] tracking-[-0.04em]">
        {marca.nombre}
      </p>
      <nav aria-label="Secciones" className="border-b border-tinta">
        <ul className="flex gap-6 overflow-x-auto py-2.5 text-chico [scrollbar-width:none]">
          {menu.map((m, i) => (
            <li key={m.id} className="shrink-0">
              <a href={`#${m.id}`} className="no-underline hover:text-acento-texto">
                <span className="text-acento-texto">p.{dos(i + 2)}</span> {m.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-10 py-12 @5xl:grid-cols-[1fr_17rem] @5xl:gap-14 @5xl:py-16">
        <div>
          <p className="ju-etiqueta text-acento-texto">Portada · {marca.zona}</p>
          <h1 className="mt-4 text-[clamp(2.4rem,7.2cqi,5.6rem)] font-medium leading-[0.98] tracking-[-0.03em]">{marca.eslogan || marca.nombre}</h1>
          {marca.subtitulo && <p className="ju-capitular mt-8 text-subtitulo leading-relaxed @3xl:columns-2 @3xl:gap-10">{marca.subtitulo}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <BotonReunion />
            <a href="#areas" className="ju-btn ju-btn-borde">
              Leer las áreas
            </a>
          </div>
        </div>
        <aside className="border-t border-tinta pt-4 @5xl:border-l @5xl:border-t-0 @5xl:pl-8 @5xl:pt-0">
          <p className="ju-etiqueta">En este número</p>
          <ol className="mt-4 divide-y divide-[color:var(--lk-borde)]">
            {areas.slice(0, 6).map((a, i) => (
              <li key={a.id} className="flex gap-3 py-3">
                <span className="font-display text-subtitulo italic text-acento-texto">{dos(i + 1)}</span>
                <span className="font-display text-subtitulo leading-tight">{a.nombre}</span>
              </li>
            ))}
          </ol>
          {marca.horario && <p className="mt-4 border-t border-tinta pt-3 text-mini text-tinta-suave">{marca.horario}</p>}
        </aside>
      </div>
    </header>
  );
}

function Areas() {
  const { areas } = useDatos();
  return (
    <section id="areas" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-14 @2xl:px-10">
      <Cabezal seccion="Áreas de práctica" titulo="Lo que hacemos," italica="tema por tema" />
      <ol className="mt-10 grid gap-px border border-tinta bg-tinta @3xl:grid-cols-2 @5xl:grid-cols-3">
        {areas.map((a, i) => (
          <li key={a.id} className="bg-fondo p-6 @2xl:p-7">
            <p className="font-display text-[3.4rem] font-light leading-none text-acento-texto">{dos(i + 1)}</p>
            <h3 className="mt-4 text-subtitulo font-semibold">{a.nombre}</h3>
            {a.descripcion && <p className="mt-2 text-chico text-tinta-suave">{a.descripcion}</p>}
            <p className="mt-3 text-mini text-tinta-suave">{detalleArea(a)}</p>
            <BotonReunion pre={{ servicioId: a.id }} className="mt-3 cursor-pointer text-chico font-semibold underline decoration-acento underline-offset-4">
              Consultar →
            </BotonReunion>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Equipo() {
  const { equipo } = useDatos();
  return (
    <section id="equipo" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-14 @2xl:px-10">
      <Cabezal seccion="Firmas" titulo="Quiénes" italica="escriben cada caso" />
      <ul className="mt-10 divide-y divide-[color:var(--lk-texto)] border-y border-tinta">
        {equipo.map((p) => (
          <li key={p.id} className="grid gap-6 py-8 @3xl:grid-cols-[9rem_1fr_14rem] @3xl:items-start">
            <Retrato persona={p} className="aspect-square w-28 grayscale @3xl:w-36" />
            <div>
              <h3 className="text-titulo font-medium italic leading-none">{p.nombre}</h3>
              <p className="mt-3 text-chico">
                {p.rol} · {p.especialidad}
              </p>
              {p.bio && <p className="mt-3 max-w-[38rem] text-tinta-suave">{p.bio}</p>}
            </div>
            <div className="text-chico @3xl:text-right">
              {p.matricula && <p className="ju-etiqueta text-tinta-suave">{p.matricula}</p>}
              <BotonReunion pre={{ profesionalId: p.id }} className="mt-3 cursor-pointer font-semibold text-acento-texto underline underline-offset-4">
                Pedir reunión
              </BotonReunion>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Proceso() {
  const { pasos } = useDatos();
  return (
    <section id="proceso" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-14 @2xl:px-10">
      <Cabezal seccion="Método" titulo="Cómo trabajamos" />
      <ol className="mt-10 grid gap-px border border-tinta bg-tinta @3xl:grid-cols-2 @5xl:grid-cols-4">
        {pasos.map((p, i) => (
          <li key={p} className="bg-fondo p-6">
            <p className="ju-etiqueta text-acento-texto">Paso {i + 1}</p>
            <p className="mt-3 font-display text-subtitulo leading-snug">{p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Reunion() {
  const { wa } = useDatos();
  return (
    <section className="bg-tinta py-16 text-fondo">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 @2xl:px-10 @5xl:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="ju-etiqueta text-acento">Agenda</p>
          <h2 className="mt-4 text-[clamp(2.2rem,5cqi,4rem)] font-medium leading-none tracking-[-0.02em]">
            Pedí una reunión, <em className="font-normal">en el estudio o por video.</em>
          </h2>
          <p className="mt-6 max-w-[28rem] opacity-80">Tema, día y hora. Te confirmamos por WhatsApp en el horario de atención.</p>
          <a href={wa("Hola! Tengo una consulta urgente.")} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block font-semibold underline underline-offset-4">
            Si es urgente, escribinos →
          </a>
        </div>
        <WidgetReunion />
      </div>
    </section>
  );
}

function Preguntas() {
  return (
    <section id="preguntas" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-14 @2xl:px-10">
      <Cabezal seccion="Correo de lectores" titulo="Preguntas" italica="que nos hacen siempre" />
      <ListaPreguntas className="mt-8 border-tinta" pregunta="font-display text-subtitulo font-medium" />
    </section>
  );
}

function Contacto() {
  const { marca, wa } = useDatos();
  return (
    <section id="contacto" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 py-14 @2xl:px-10">
      <Cabezal seccion="Redacción" titulo="Dónde estamos" />
      <div className="mt-10 grid gap-10 @5xl:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="font-display text-titulo leading-tight">{marca.direccion}</p>
          {marca.horario && <p className="mt-4 text-tinta-suave">{marca.horario}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={wa()} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-lleno">
              WhatsApp
            </a>
            <a href={marca.mapsUrl} target="_blank" rel="noopener noreferrer" className="ju-btn ju-btn-borde">
              Cómo llegar
            </a>
          </div>
        </div>
        <Mapa className="aspect-[16/10] w-full border border-tinta grayscale" />
      </div>
    </section>
  );
}

export const editorial: Diseno = {
  Portada,
  secciones: { areas: Areas, equipo: Equipo, proceso: Proceso, reunion: Reunion, preguntas: Preguntas, contacto: Contacto },
  pie: "border-tinta",
};
