"use client";

import Image from "next/image";
import { useSyncExternalStore, type ReactNode } from "react";
import { afiche, margen } from "../_home/estilos";
import { compararVersiones, tipoDeVersion, trozos, type Version } from "./changelog";
import { MandarDemo } from "./MandarDemo";
import { PanelPedidos } from "./PanelPedidos";

export interface Demo {
  titulo: string;
  etiqueta: string;
  texto: string;
  /** Qué conviene mostrar al abrirla. */
  consejo?: string;
  href: string;
  imagen?: string;
  externo?: boolean;
}

export interface GrupoDemos {
  id: string;
  titulo: string;
  bajada: string;
  items: Demo[];
}

/* ───────────── Estado del navegador: pestaña y última versión vista ───────────── */

const CLAVE_VISTO = "altoque:adm-visto";
const EVENTO = "altoque:adm-visto";

function suscribir(avisar: () => void) {
  window.addEventListener("hashchange", avisar);
  window.addEventListener("storage", avisar);
  window.addEventListener(EVENTO, avisar);
  return () => {
    window.removeEventListener("hashchange", avisar);
    window.removeEventListener("storage", avisar);
    window.removeEventListener(EVENTO, avisar);
  };
}

function leerVisto(): string {
  try {
    return localStorage.getItem(CLAVE_VISTO) ?? "";
  } catch {
    return "";
  }
}

function marcarVisto(version: string) {
  try {
    localStorage.setItem(CLAVE_VISTO, version);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

const FECHA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fecha = (iso: string) => FECHA.format(new Date(`${iso}T12:00:00Z`));

const TIPO = {
  grande: { texto: "Versión grande", clase: "bg-tinta text-fondo" },
  nueva: { texto: "Algo nuevo", clase: "bg-acento-relleno text-sobre-acento" },
  ajuste: { texto: "Ajuste", clase: "bg-superficie-2 text-tinta" },
} as const;

/** `encabezado`: lo arma la página (server), así este componente no carga lo de la home. */
export function Adm({ versiones, grupos, encabezado }: { versiones: Version[]; grupos: GrupoDemos[]; encabezado: ReactNode }) {
  const hash = useSyncExternalStore(suscribir, () => window.location.hash.slice(1), () => "");
  // null en el servidor: el contador de novedades aparece al cargar en el navegador.
  const visto = useSyncExternalStore(suscribir, leerVisto, () => null);
  const pestana = hash === "novedades" || hash === "pedidos" || hash === "mandar" ? hash : "demos";
  // La primera vez (nada visto en este navegador) solo cuenta la última versión, no todo el historial.
  const nuevas = visto === null ? [] : visto === "" ? versiones.slice(0, 1) : versiones.filter((v) => compararVersiones(v.version, visto) > 0);

  return (
    <>
      {encabezado}

      <nav aria-label="Secciones del panel" className={`${margen} sticky top-0 z-10 border-b border-borde bg-fondo/95 backdrop-blur`}>
        <ul className="flex gap-1 overflow-x-auto py-2">
          {[
            ["demos", "Demos"],
            ["mandar", "Mandar una demo"],
            ["pedidos", "Pedidos"],
            ["novedades", "Novedades"],
          ].map(([id, texto]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={pestana === id ? "page" : undefined}
                className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-control px-4 text-chico font-semibold hover:bg-superficie-2 aria-[current=page]:bg-tinta aria-[current=page]:text-fondo"
              >
                {texto}
                {id === "novedades" && nuevas.length > 0 && (
                  <span className="grid min-w-6 place-items-center rounded-full bg-[#d6402b] px-1.5 text-mini font-bold text-white tabular-nums">
                    {nuevas.length}
                    <span className="sr-only"> {nuevas.length === 1 ? "versión nueva" : "versiones nuevas"}</span>
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main id="contenido" className={`${margen} pb-24`}>
        {pestana === "demos" ? (
          <Demos grupos={grupos} />
        ) : pestana === "mandar" ? (
          <MandarDemo />
        ) : pestana === "pedidos" ? (
          <PanelPedidos />
        ) : (
          <Novedades versiones={versiones} nuevas={nuevas} />
        )}
      </main>
    </>
  );
}

function Demos({ grupos }: { grupos: GrupoDemos[] }) {
  return (
    <>
      <div className="pt-10 pb-4">
        <h1 className={`${afiche} text-titulo`}>Todo para mostrar</h1>
        <p className="mt-2 max-w-medida text-subtitulo">Cada demo abre en otra pestaña, con datos de ejemplo. Nada de lo que se toque ahí afecta a un cliente real.</p>
        <ul className="mt-5 flex flex-wrap gap-2 text-chico">
          {grupos.map((g) => (
            <li key={g.id}>
              <a href={`#demos-${g.id}`} className="inline-flex min-h-10 items-center rounded-full border-2 border-tinta px-4 font-semibold hover:bg-acento-relleno">
                {g.titulo} <span className="ml-1.5 text-tinta-suave">{g.items.length}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      {grupos.map((g) => (
        <section key={g.id} id={`demos-${g.id}`} aria-labelledby={`t-${g.id}`} className="scroll-mt-20 border-t-2 border-tinta pt-6 pb-10">
          <h2 id={`t-${g.id}`} className={`${afiche} text-[clamp(1.9rem,1.4rem+1.6cqi,2.6rem)] leading-none`}>
            {g.titulo}
          </h2>
          <p className="mt-2 text-chico text-tinta-suave">{g.bajada}</p>
          <ul className="mt-6 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
            {g.items.map((d) => (
              <li key={d.href}>
                <a
                  href={d.href}
                  target="_blank"
                  rel={d.externo ? "noopener noreferrer" : "noopener"}
                  className="group flex h-full flex-col overflow-hidden rounded-base border-2 border-tinta/20 bg-superficie transition-colors hover:border-tinta"
                >
                  {d.imagen && (
                    <span className="relative block aspect-[16/9] overflow-hidden border-b-2 border-tinta/10 bg-superficie-2">
                      <Image src={d.imagen} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 672px) 46vw, 92vw" className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]" />
                    </span>
                  )}
                  <span className="flex flex-1 flex-col p-5">
                    <span className="text-mini font-semibold tracking-wide text-tinta-suave uppercase">{d.etiqueta}</span>
                    <span className="mt-1 text-subtitulo font-semibold">{d.titulo}</span>
                    <span className="mt-1.5 text-chico">{d.texto}</span>
                    {d.consejo && (
                      <span className="mt-3 rounded-[0.6rem] bg-superficie-2 px-3 py-2 text-mini">
                        <strong>Para mostrar:</strong> {d.consejo}
                      </span>
                    )}
                    <span className="mt-auto flex items-center justify-between gap-3 pt-4 text-mini text-tinta-suave">
                      <span className="truncate font-mono">{d.externo ? new URL(d.href).host : d.href}</span>
                      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-tinta text-tinta transition-colors group-hover:bg-acento-relleno">
                        ↗
                      </span>
                    </span>
                  </span>
                  <span className="sr-only"> (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function Novedades({ versiones, nuevas }: { versiones: Version[]; nuevas: Version[] }) {
  const esNueva = new Set(nuevas.map((v) => v.version));
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-10 pb-6">
        <div>
          <h1 className={`${afiche} text-titulo`}>Novedades</h1>
          <p className="mt-2 max-w-medida text-subtitulo">
            Cada versión que sale a producción, contada en simple. Salen del <code className="font-mono text-chico">CHANGELOG.md</code>: para sumar una, se escribe ahí en el
            mismo PR que sube la versión.
          </p>
        </div>
        {nuevas.length > 0 && (
          <button
            type="button"
            onClick={() => marcarVisto(versiones[0]!.version)}
            className="inline-flex min-h-11 items-center rounded-control bg-tinta px-5 text-chico font-semibold text-fondo hover:opacity-90"
          >
            Marcar {nuevas.length === 1 ? "como vista" : `las ${nuevas.length} como vistas`}
          </button>
        )}
      </div>
      <ol className="relative border-l-2 border-tinta pl-6 @3xl:pl-10">
        {versiones.map((v) => {
          const tipo = TIPO[tipoDeVersion(v.version)];
          return (
            <li key={v.version} className="relative pb-10 last:pb-0">
              <span aria-hidden className={`absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2 border-tinta @3xl:-left-[calc(2.5rem+7px)] ${esNueva.has(v.version) ? "bg-[#d6402b]" : "bg-fondo"}`} />
              <article aria-labelledby={`v-${v.version}`}>
                <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h2 id={`v-${v.version}`} className={`${afiche} text-[1.9rem] leading-none normal-case tabular-nums`}>
                    v{v.version}
                  </h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-mini font-semibold ${tipo.clase}`}>{tipo.texto}</span>
                  {esNueva.has(v.version) && <span className="rounded-full bg-[#d6402b] px-2.5 py-0.5 text-mini font-bold text-white">Nuevo</span>}
                  <time dateTime={v.fecha} className="text-chico text-tinta-suave">
                    {fecha(v.fecha)}
                  </time>
                </header>
                <ul className="mt-3 max-w-[72ch] space-y-2 text-chico">
                  {v.cambios.map((c, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden className="mt-[0.55em] h-1.5 w-3 shrink-0 bg-acento-relleno" />
                      <span>
                        <Texto linea={c} />
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Una línea del CHANGELOG con su **negrita** y `código` (también código dentro de una negrita). */
function Texto({ linea }: { linea: string }) {
  return (
    <>
      {trozos(linea).map((t, j) =>
        t.tipo === "negrita" ? (
          <strong key={j}>
            <Texto linea={t.texto} />
          </strong>
        ) : t.tipo === "codigo" ? (
          <code key={j} className="rounded bg-superficie-2 px-1 font-mono text-[0.92em]">
            {t.texto}
          </code>
        ) : (
          <span key={j}>{t.texto}</span>
        ),
      )}
    </>
  );
}
