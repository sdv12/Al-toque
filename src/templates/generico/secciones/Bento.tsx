import type { ReactNode } from "react";
import { formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import type { VarianteDe } from "@/core/registry";
import type { ConfigDe } from "@/core/schema/landing-config";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { boton, tile, tileBase } from "../estilos";
import { Foto } from "../Foto";

type Config = ConfigDe<"generico">;
type Props = { config: Config; variante: VarianteDe<"generico", "bento"> };
type Bloque = "presentacion" | "subtitulo" | "contacto" | "trabajo" | "servicios" | "testimonio" | "datos";

/** Posición de cada bloque en la grilla según la variante (en angosto se apilan en este orden). */
const DISPOSICION: Record<Props["variante"], { bloque: Bloque; clase: string }[]> = {
  clasico: [
    { bloque: "presentacion", clase: "@4xl:col-span-8 @4xl:row-span-2" },
    { bloque: "contacto", clase: "@4xl:col-span-4" },
    { bloque: "datos", clase: "@4xl:col-span-4" },
    { bloque: "trabajo", clase: "@4xl:col-span-7 @4xl:row-span-2" },
    { bloque: "servicios", clase: "@4xl:col-span-5" },
    { bloque: "testimonio", clase: "@4xl:col-span-5" },
  ],
  denso: [
    { bloque: "presentacion", clase: "@4xl:col-span-6" },
    { bloque: "contacto", clase: "@4xl:col-span-3" },
    { bloque: "datos", clase: "@4xl:col-span-3" },
    { bloque: "subtitulo", clase: "@4xl:col-span-4" },
    { bloque: "trabajo", clase: "@4xl:col-span-5 @4xl:row-span-2" },
    { bloque: "servicios", clase: "@4xl:col-span-3 @4xl:row-span-2" },
    { bloque: "testimonio", clase: "@4xl:col-span-4" },
  ],
  asimetrico: [
    { bloque: "presentacion", clase: "@4xl:col-span-5 @4xl:row-span-3" },
    { bloque: "trabajo", clase: "@4xl:col-span-7 @4xl:row-span-2" },
    { bloque: "servicios", clase: "@4xl:col-span-4" },
    { bloque: "contacto", clase: "@4xl:col-span-3" },
    { bloque: "testimonio", clase: "@4xl:col-span-8" },
    { bloque: "datos", clase: "@4xl:col-span-4" },
  ],
};

function Flecha() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="size-5 shrink-0">
      <path d="M5 15 15 5M7 5h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Presentacion({ config, conSubtitulo }: { config: Config; conSubtitulo: boolean }) {
  const { negocio } = config;
  return (
    <div className="flex h-full flex-col justify-end gap-5 py-6 @4xl:py-2">
      <h1 id="inicio-titulo" className="font-display text-display">
        {negocio.nombre}
      </h1>
      <p className="max-w-[26ch] font-display text-subtitulo">{negocio.eslogan}</p>
      {conSubtitulo && negocio.subtitulo && <p className="max-w-medida text-tinta-suave">{negocio.subtitulo}</p>}
    </div>
  );
}

function Contacto({ config }: { config: Config }) {
  return (
    <div className={`${tileBase} flex h-full flex-col justify-between gap-6 border-transparent bg-acento-relleno text-sobre-acento`}>
      <p className="font-display text-subtitulo">¿Tenés algo en mente? Contanos y te pasamos presupuesto.</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={linkWhatsApp(config.negocio.whatsapp, `Hola ${config.negocio.nombre}! Quería hacerles una consulta.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-sobre-acento px-5 py-2.5 font-semibold text-acento-relleno"
        >
          <IconoWhatsApp className="size-5" /> WhatsApp
        </a>
        <a href="#contacto" className="font-semibold underline decoration-2 underline-offset-4">
          Dejar una consulta
        </a>
      </div>
    </div>
  );
}

function Trabajo({ config }: { config: Config }) {
  const caso = config.contenido.casos?.[0];
  if (!caso) return null;
  return (
    <a href="#casos" className={`${tile} group flex h-full flex-col gap-4 transition-colors hover:border-tinta`}>
      <Foto imagen={caso.despues ?? caso.antes ?? { alt: caso.titulo }} aspecto="16 / 10" sizes="(min-width: 1024px) 50vw, 100vw" destacada />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-mini text-tinta-suave">Trabajo destacado{caso.cliente && ` · ${caso.cliente}`}</p>
          <p className="mt-1 font-display text-subtitulo">{caso.titulo}</p>
          {caso.resultado && <p className="mt-2 text-chico text-acento-texto">{caso.resultado}</p>}
        </div>
        <span className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
          <Flecha />
        </span>
      </div>
      <span className="sr-only">Ver todos los trabajos</span>
    </a>
  );
}

function Servicios({ config }: { config: Config }) {
  const servicios = (config.contenido.servicios ?? []).slice(0, 4);
  return (
    <div className={`${tile} flex h-full flex-col`}>
      <p className="text-mini text-tinta-suave">Qué hacemos</p>
      <ul className="mt-3 flex-1 divide-y divide-borde">
        {servicios.map((s) => (
          <li key={s.id} className="flex items-baseline justify-between gap-4 py-2.5">
            <span className="font-semibold">{s.nombre}</span>
            <span className="shrink-0 text-chico tabular-nums text-tinta-suave">{formatearPrecio(s)}</span>
          </li>
        ))}
      </ul>
      <a href="#servicios" className={`${boton.enlace} mt-3 self-start text-chico`}>
        Todos los servicios
      </a>
    </div>
  );
}

function Testimonio({ config }: { config: Config }) {
  const t = config.contenido.testimonios?.[0];
  if (!t) return null;
  return (
    <figure className={`${tile} flex h-full flex-col justify-between gap-4`}>
      <blockquote className="font-display text-subtitulo">
        <span aria-hidden className="text-acento-texto">
          “
        </span>
        {t.texto}”
      </blockquote>
      <figcaption className="text-chico text-tinta-suave">
        <span className="font-semibold text-tinta">{t.autor}</span>
        {t.detalle && ` · ${t.detalle}`}
      </figcaption>
    </figure>
  );
}

function Datos({ config }: { config: Config }) {
  const { negocio } = config;
  return (
    <div className={`${tile} flex h-full flex-col justify-between gap-4 text-chico`}>
      <dl className="space-y-3">
        <div>
          <dt className="text-mini text-tinta-suave">Dónde</dt>
          <dd>{negocio.direccion}</dd>
        </div>
        <div>
          <dt className="text-mini text-tinta-suave">Cuándo</dt>
          <dd>{negocio.horario}</dd>
        </div>
      </dl>
      {negocio.instagram && (
        <a href={`https://instagram.com/${negocio.instagram}`} target="_blank" rel="noopener noreferrer" className={`${boton.enlace} self-start`}>
          @{negocio.instagram}
        </a>
      )}
    </div>
  );
}

function Subtitulo({ config }: { config: Config }) {
  if (!config.negocio.subtitulo) return null;
  return (
    <div className={`${tileBase} flex h-full items-end bg-superficie-2`}>
      <p className="max-w-medida">{config.negocio.subtitulo}</p>
    </div>
  );
}

export function Bento({ config, variante }: Props) {
  const disposicion = DISPOSICION[variante];
  const conSubtituloAparte = disposicion.some((d) => d.bloque === "subtitulo");
  const bloques: Record<Bloque, ReactNode> = {
    presentacion: <Presentacion config={config} conSubtitulo={!conSubtituloAparte} />,
    subtitulo: <Subtitulo config={config} />,
    contacto: <Contacto config={config} />,
    trabajo: <Trabajo config={config} />,
    servicios: <Servicios config={config} />,
    testimonio: <Testimonio config={config} />,
    datos: <Datos config={config} />,
  };

  return (
    <section id="inicio" aria-labelledby="inicio-titulo" className="px-4 pb-16 pt-4 @4xl:px-8">
      <div className="grid gap-3 @4xl:auto-rows-[minmax(10.5rem,auto)] @4xl:grid-cols-12 @4xl:gap-4">
        {disposicion.map(({ bloque, clase }) => (
          <div key={bloque} className={`min-w-0 ${clase}`}>
            {bloques[bloque]}
          </div>
        ))}
      </div>
    </section>
  );
}
