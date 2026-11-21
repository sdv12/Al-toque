"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatearPrecio, linkWhatsApp } from "@/core/lib/mensajes";
import type { Imagen } from "@/core/schema/comun";
import type { Caso, Servicio, Testimonio } from "@/core/schema/contenido";
import { IconoWhatsApp } from "@/ui/primitives/IconoWhatsApp";
import { rotulo } from "./estilos";
import { Foto } from "./Foto";
import { Comparador } from "./interactivos";

/*
 * Piezas interactivas del modo "Estudio" de la plantilla genérica: sobrio, mucho aire, fotos
 * grandes y movimiento lento. Todo funciona con teclado y respeta prefers-reduced-motion.
 */

const CLARO = "text-[#f7f5f1]";

function useMovimientoReducido() {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const actualizar = () => setReducido(mq.matches);
    actualizar();
    mq.addEventListener("change", actualizar);
    return () => mq.removeEventListener("change", actualizar);
  }, []);
  return reducido;
}

function Flecha({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`shrink-0 ${className}`}>
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────── Header ───────────── */

/** Transparente sobre la foto de portada; al scrollear se vuelve sólido. En angosto, menú desplegable. */
export function HeaderEstudio({ nombre, enlaces }: { nombre: string; enlaces: { id: string; etiqueta: string }[] }) {
  const [solido, setSolido] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const medir = () => setSolido(window.scrollY > 24);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierto]);

  const claro = !solido && !abierto;
  const [primero, ...resto] = nombre.split(" ");
  const contacto = enlaces.find((e) => e.id === "contacto");
  const secciones = enlaces.filter((e) => e.id !== "contacto");

  return (
    <header
      className={`sticky top-0 z-30 transition-[background-color,color,border-color] duration-500 ${
        claro ? `border-b border-[#f7f5f1]/20 bg-transparent ${CLARO}` : "border-b border-borde bg-fondo/90 text-tinta backdrop-blur-md"
      }`}
    >
      <div className="flex h-18 items-center justify-between gap-6 px-5 @4xl:px-10">
        <a href="#inicio" className="truncate text-chico uppercase tracking-[0.16em] @3xl:tracking-[0.28em]" onClick={() => setAbierto(false)}>
          <span className="font-semibold">{primero}</span> {resto.join(" ")}
        </a>

        <nav aria-label="Secciones" className="hidden @3xl:block">
          <ul className="flex items-center gap-8">
            {secciones.map((e) => (
              <li key={e.id}>
                <a href={`#${e.id}`} className={`${rotulo} relative py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100`}>
                  {e.etiqueta}
                </a>
              </li>
            ))}
            {contacto && (
              <li>
                <a
                  href="#contacto"
                  className={`${rotulo} inline-flex min-h-10 items-center border px-5 transition-colors duration-300 ${
                    claro ? "border-[#f7f5f1]/60 hover:bg-[#f7f5f1] hover:text-[#141412]" : "border-tinta hover:bg-tinta hover:text-fondo"
                  }`}
                >
                  Hablemos
                </a>
              </li>
            )}
          </ul>
        </nav>

        <button
          type="button"
          className={`${rotulo} inline-flex min-h-11 items-center gap-3 @3xl:hidden`}
          aria-expanded={abierto}
          aria-controls="menu-estudio"
          onClick={() => setAbierto((a) => !a)}
        >
          {abierto ? "Cerrar" : "Menú"}
          <span aria-hidden className="relative block h-2.5 w-6">
            <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-300 ${abierto ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ${abierto ? "-translate-y-[4px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <div
        id="menu-estudio"
        hidden={!abierto}
        className="absolute inset-x-0 top-full h-[calc(100svh-4.5rem)] overflow-y-auto bg-fondo px-5 pb-10 pt-6 text-tinta @3xl:hidden"
      >
        <ul className="divide-y divide-borde border-y border-borde">
          {enlaces.map((e, i) => (
            <li key={e.id}>
              <a href={`#${e.id}`} onClick={() => setAbierto(false)} className="flex items-baseline justify-between gap-4 py-5 font-display text-titulo font-extralight">
                {e.etiqueta}
                <span className="text-mini tabular-nums text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

/* ───────────── Portada ───────────── */

type Diapositiva = { imagen: Imagen & { src: string }; leyenda: string };

/** Fotos a pantalla completa que se funden cada 7 s con un zoom lento. Pausable (WCAG 2.2.2). */
export function PortadaRotativa({
  nombre,
  eslogan,
  diapositivas,
  bajada,
}: {
  nombre: string;
  eslogan: string;
  diapositivas: Diapositiva[];
  bajada?: string;
}) {
  const reducido = useMovimientoReducido();
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = diapositivas.length;
  const corre = total > 1 && !pausado && !reducido;

  useEffect(() => {
    if (!corre) return;
    const t = window.setTimeout(() => setActual((a) => (a + 1) % total), 7000);
    return () => window.clearTimeout(t);
  }, [corre, actual, total]);

  const ir = (i: number) => setActual((i + total) % total);
  const leyenda = diapositivas[actual]?.leyenda;

  return (
    <div className={`relative -mt-18 flex h-[100svh] min-h-[34rem] flex-col justify-end overflow-hidden bg-[#141412] ${CLARO}`}>
      {diapositivas.map((d, i) => (
        <div
          key={d.imagen.src}
          aria-hidden={i !== actual}
          className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${i === actual ? "opacity-100" : "opacity-0"}`}
        >
          {/* La key cambia con cada pasada para reiniciar el zoom lento. */}
          <div key={i === actual ? `z-${actual}` : "quieta"} className={`absolute inset-0 ${i === actual ? "zoom-lento" : ""}`}>
            <Image
              src={d.imagen.src}
              unoptimized={!d.imagen.src.startsWith("/")}
              alt={i === actual ? d.imagen.alt : ""}
              fill
              sizes="100vw"
              className="object-cover"
              {...(i === 0 ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
            />
          </div>
        </div>
      ))}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#0d0d0c]/85 via-[#0d0d0c]/25 to-[#0d0d0c]/45" />

      <div className="relative grid gap-10 px-5 pb-10 @4xl:grid-cols-12 @4xl:px-10 @4xl:pb-14">
        <div className="@4xl:col-span-8">
          <h1 id="inicio-titulo">
            <span className={`${rotulo} hidden text-[#f7f5f1]/80 @3xl:block`}>{nombre}</span>
            <span className="sr-only @3xl:hidden">{nombre}: </span>
            <span className="block max-w-[14ch] font-display text-display font-extralight @3xl:mt-5">{eslogan}</span>
          </h1>
          {bajada && <p className="mt-6 max-w-[46ch] text-cuerpo text-[#f7f5f1]/85">{bajada}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#casos" className={`${rotulo} group inline-flex min-h-12 items-center gap-3 bg-[#f7f5f1] px-6 text-[#141412] transition-colors hover:bg-[#f7f5f1]/85`}>
              Ver proyectos <Flecha className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#contacto" className={`${rotulo} border-b border-[#f7f5f1]/60 pb-1 transition-colors hover:border-[#f7f5f1]`}>
              Hablemos
            </a>
          </div>
        </div>

        {total > 1 && (
          <div className="flex flex-col justify-end gap-4 pr-16 @4xl:col-span-4 @4xl:pr-20">
            <p aria-live={corre ? "off" : "polite"} className="flex items-baseline justify-between gap-4 text-chico text-[#f7f5f1]/85">
              <span className="truncate">{leyenda}</span>
              <span className="shrink-0 tabular-nums">
                {String(actual + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex flex-1 gap-2">
                {diapositivas.map((d, i) => (
                  <button
                    key={d.imagen.src}
                    type="button"
                    onClick={() => ir(i)}
                    aria-label={`Foto ${i + 1}: ${d.leyenda}`}
                    aria-current={i === actual}
                    className="group relative h-8 flex-1"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px bg-[#f7f5f1]/30 group-hover:bg-[#f7f5f1]/60" />
                    <span
                      key={i === actual ? `a-${actual}-${corre}` : "q"}
                      className="absolute inset-x-0 top-1/2 h-px origin-left bg-[#f7f5f1]"
                      style={
                        i === actual
                          ? corre
                            ? { animation: "generico-avance 7s linear both" }
                            : {}
                          : { transform: i < actual ? "scaleX(1)" : "scaleX(0)" }
                      }
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPausado((p) => !p)}
                aria-label={pausado ? "Reanudar fotos" : "Pausar fotos"}
                className="grid size-9 place-items-center rounded-full border border-[#f7f5f1]/40 hover:border-[#f7f5f1]"
              >
                {pausado || reducido ? (
                  <svg viewBox="0 0 12 12" aria-hidden className="size-2.5 fill-current">
                    <path d="M3 1.5v9l7.5-4.5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 12 12" aria-hidden className="size-2.5 fill-current">
                    <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <a href="#estudio" aria-label="Seguir bajando" className="absolute bottom-0 left-1/2 hidden h-10 w-px -translate-x-1/2 overflow-hidden @4xl:block">
        <span className="absolute inset-0 bg-[#f7f5f1]/30" />
        <span className="absolute inset-x-0 top-0 h-1/2 bg-[#f7f5f1] motion-safe:animate-[generico-bajar_2.4s_ease-in-out_infinite]" />
      </a>
    </div>
  );
}

/* ───────────── Proyectos ───────────── */

function categoria(c: Caso) {
  return c.titulo.split("·")[0]!.trim();
}

/** Ritmo de la grilla: alterna piezas grandes y chicas para que no se vea como un catálogo. */
const RITMO = [
  { celda: "@4xl:col-span-7", aspecto: "4 / 3" },
  { celda: "@4xl:col-span-5 @4xl:mt-32", aspecto: "4 / 5" },
  { celda: "@4xl:col-span-10 @4xl:col-start-2", aspecto: "16 / 8" },
  { celda: "@4xl:col-span-5", aspecto: "4 / 5" },
  { celda: "@4xl:col-span-7 @4xl:mt-32", aspecto: "4 / 3" },
];

export function GaleriaProyectos({ casos, whatsapp, negocio }: { casos: Caso[]; whatsapp: string; negocio: string }) {
  const categorias = useMemo(() => [...new Set(casos.map(categoria))], [casos]);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [abierto, setAbierto] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const visibles = casos.map((c, i) => ({ c, i })).filter(({ c }) => !filtro || categoria(c) === filtro);

  const abrir = useCallback((i: number) => {
    setAbierto(i);
    const d = dialogo.current;
    if (d && !d.open) d.showModal();
  }, []);
  const cerrar = () => dialogo.current?.close();
  const caso = abierto !== null ? casos[abierto] : undefined;

  return (
    <>
      {categorias.length > 1 && (
        <div role="group" aria-label="Filtrar proyectos" className="mt-10 flex flex-wrap gap-x-6 gap-y-2">
          {[null, ...categorias].map((cat) => {
            const activo = filtro === cat;
            const cantidad = cat ? casos.filter((c) => categoria(c) === cat).length : casos.length;
            return (
              <button
                key={cat ?? "todos"}
                type="button"
                aria-pressed={activo}
                onClick={() => setFiltro(cat)}
                className={`${rotulo} min-h-10 border-b py-1 transition-colors ${activo ? "border-tinta text-tinta" : "border-transparent text-tinta-suave hover:text-tinta"}`}
              >
                {cat ?? "Todos"} <sup className="tabular-nums">{cantidad}</sup>
              </button>
            );
          })}
        </div>
      )}

      <ul className="mt-12 grid gap-x-8 gap-y-16 @4xl:grid-cols-12 @4xl:gap-y-24">
        {visibles.map(({ c, i }, pos) => {
          const ritmo = RITMO[pos % RITMO.length]!;
          return (
            <li key={c.id} className={`revelar ${ritmo.celda}`}>
              <button type="button" onClick={() => abrir(i)} className="group block w-full text-left" aria-haspopup="dialog">
                <div className="relative overflow-hidden">
                  <div className="transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]">
                    <Foto imagen={c.despues ?? c.antes ?? { alt: c.titulo }} aspecto={ritmo.aspecto} sizes="(min-width: 1024px) 60vw, 100vw" className="rounded-none" />
                  </div>
                  <span className={`${rotulo} absolute bottom-4 left-4 inline-flex items-center gap-2 bg-fondo px-4 py-2.5 text-tinta opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 @4xl:translate-y-2 @4xl:group-hover:translate-y-0`}>
                    Ver proyecto <Flecha />
                  </span>
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-borde pt-4">
                  <div>
                    <p className="font-display text-subtitulo font-light">{c.titulo}</p>
                    {c.cliente && <p className="mt-1 text-chico text-tinta-suave">{c.cliente}</p>}
                  </div>
                  <span className="text-mini tabular-nums text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogo}
        aria-labelledby="proyecto-titulo"
        onClose={() => setAbierto(null)}
        onClick={(e) => e.target === dialogo.current && cerrar()}
        className="m-auto max-h-[92svh] w-[min(72rem,calc(100%-2rem))] overflow-y-auto bg-fondo p-0 text-tinta backdrop:bg-[#0d0d0c]/70 backdrop:backdrop-blur-sm"
      >
        {caso && abierto !== null && (
          <div className="grid gap-8 p-5 @container @4xl:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-borde pb-4">
              <p className={`${rotulo} text-tinta-suave`}>
                Proyecto {String(abierto + 1).padStart(2, "0")} / {String(casos.length).padStart(2, "0")}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => abrir((abierto - 1 + casos.length) % casos.length)} aria-label="Proyecto anterior" className="grid size-10 place-items-center border border-borde hover:border-tinta">
                  <Flecha className="size-4 rotate-180" />
                </button>
                <button type="button" onClick={() => abrir((abierto + 1) % casos.length)} aria-label="Proyecto siguiente" className="grid size-10 place-items-center border border-borde hover:border-tinta">
                  <Flecha />
                </button>
                <button type="button" onClick={cerrar} className={`${rotulo} ml-2 min-h-10 border border-tinta px-4 hover:bg-tinta hover:text-fondo`}>
                  Cerrar
                </button>
              </div>
            </div>

            <div className="grid gap-8 @3xl:grid-cols-12">
              <div className="@3xl:col-span-7">
                <Comparador antes={caso.antes} despues={caso.despues} titulo={caso.titulo} />
                <p className="mt-3 text-mini text-tinta-suave">Deslizá la línea para comparar antes y después.</p>
              </div>
              <div className="flex flex-col gap-6 @3xl:col-span-5">
                <div>
                  {caso.cliente && <p className={`${rotulo} text-tinta-suave`}>{caso.cliente}</p>}
                  <h3 id="proyecto-titulo" className="mt-2 font-display text-titulo font-extralight">
                    {caso.titulo}
                  </h3>
                </div>
                <dl className="divide-y divide-borde border-y border-borde">
                  {(
                    [
                      ["El punto de partida", caso.problema],
                      ["Lo que hicimos", caso.solucion],
                      ["Resultado", caso.resultado],
                    ] as const
                  )
                    .filter(([, t]) => t)
                    .map(([t, texto]) => (
                      <div key={t} className="grid gap-1 py-4">
                        <dt className={`${rotulo} text-tinta-suave`}>{t}</dt>
                        <dd>{texto}</dd>
                      </div>
                    ))}
                </dl>
                <a
                  href={linkWhatsApp(whatsapp, `Hola ${negocio}! Vi el proyecto "${caso.titulo}" y quería consultarles por algo parecido.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${rotulo} inline-flex min-h-12 items-center justify-center gap-3 bg-tinta px-6 text-fondo transition-colors hover:bg-acento-relleno hover:text-sobre-acento`}
                >
                  <IconoWhatsApp className="size-4" /> Quiero algo así
                </a>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

/* ───────────── Servicios ───────────── */

/** Lista desplegable; en ancho, la foto de la izquierda cambia con el servicio activo. */
export function IndiceServicios({ servicios, fotos, whatsapp, negocio }: { servicios: Servicio[]; fotos: (Imagen & { src: string })[]; whatsapp: string; negocio: string }) {
  const [activo, setActivo] = useState(0);
  const conFotos = fotos.length > 0;

  return (
    <div className={`mt-12 grid gap-10 ${conFotos ? "@4xl:grid-cols-12" : ""}`}>
      {conFotos && (
        <div aria-hidden className="relative hidden @4xl:col-span-5 @4xl:block">
          <div className="sticky top-28 overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
            {fotos.map((f, i) => (
              <Image
                key={f.src}
                src={f.src}
                unoptimized={!f.src.startsWith("/")}
                alt=""
                fill
                sizes="40vw"
                className={`object-cover transition-[opacity,transform] duration-700 ease-out ${i === activo % fotos.length ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
              />
            ))}
          </div>
        </div>
      )}

      <ol className={`border-t border-borde ${conFotos ? "@4xl:col-span-7" : ""}`}>
        {servicios.map((s, i) => {
          const abierto = activo === i;
          return (
            <li key={s.id} className="border-b border-borde" onMouseEnter={() => setActivo(i)}>
              <h3>
                <button
                  type="button"
                  aria-expanded={abierto}
                  aria-controls={`servicio-${s.id}`}
                  onClick={() => setActivo(i)}
                  onFocus={() => setActivo(i)}
                  className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-4 py-6 text-left @3xl:grid-cols-[3.5rem_minmax(0,1fr)_auto]"
                >
                  <span className="text-mini tabular-nums text-tinta-suave">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`font-display text-subtitulo font-light transition-transform duration-500 @3xl:text-[clamp(1.5rem,1rem+1.6cqi,2.25rem)] ${abierto ? "translate-x-2" : ""}`}>{s.nombre}</span>
                  <span aria-hidden className={`grid size-8 place-items-center rounded-full border transition-all duration-500 ${abierto ? "rotate-45 border-tinta" : "border-borde"}`}>
                    <svg viewBox="0 0 12 12" className="size-2.5">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </span>
                </button>
              </h3>
              <div
                id={`servicio-${s.id}`}
                className={`grid transition-[grid-template-rows] duration-500 ease-out ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                inert={!abierto}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-5 pb-8 pl-[3.5rem] @3xl:pl-[4.5rem]">
                    {s.descripcion && <p className="max-w-[48ch] text-tinta-suave">{s.descripcion}</p>}
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                      <p className="text-chico">
                        <span className={`${rotulo} mr-3 text-tinta-suave`}>Valor</span>
                        <span className="tabular-nums">{formatearPrecio(s)}</span>
                      </p>
                      <a
                        href={linkWhatsApp(whatsapp, `Hola ${negocio}! Quería consultar por: ${s.nombre}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${rotulo} group inline-flex items-center gap-2 border-b border-tinta pb-1`}
                      >
                        Consultar <Flecha className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ───────────── Testimonios ───────────── */

export function TestimoniosRotativos({ testimonios }: { testimonios: Testimonio[] }) {
  const reducido = useMovimientoReducido();
  const [actual, setActual] = useState(0);
  const [quieto, setQuieto] = useState(false);
  const total = testimonios.length;
  const corre = total > 1 && !quieto && !reducido;

  useEffect(() => {
    if (!corre) return;
    const t = window.setTimeout(() => setActual((a) => (a + 1) % total), 8000);
    return () => window.clearTimeout(t);
  }, [corre, actual, total]);

  const ir = (i: number) => setActual((i + total) % total);

  return (
    <div
      onMouseEnter={() => setQuieto(true)}
      onMouseLeave={() => setQuieto(false)}
      onFocus={() => setQuieto(true)}
      onBlur={() => setQuieto(false)}
      className="mx-auto max-w-5xl text-center"
    >
      <div className="grid" aria-live={corre ? "off" : "polite"}>
        {testimonios.map((t, i) => (
          <figure
            key={t.id}
            aria-hidden={i !== actual}
            className={`col-start-1 row-start-1 transition-[opacity,transform] duration-700 ease-out ${i === actual ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
          >
            <blockquote className="font-display text-titulo font-extralight">“{t.texto}”</blockquote>
            <figcaption className="mt-8">
              <span className={rotulo}>{t.autor}</span>
              {t.detalle && <span className="mt-1 block text-chico text-tinta-suave">{t.detalle}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {total > 1 && (
        <div className="mt-10 flex items-center justify-center gap-5">
          <button type="button" onClick={() => ir(actual - 1)} aria-label="Testimonio anterior" className="grid size-11 place-items-center rounded-full border border-borde hover:border-tinta">
            <Flecha className="size-4 rotate-180" />
          </button>
          <span className="text-mini tabular-nums text-tinta-suave">
            {String(actual + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => ir(actual + 1)} aria-label="Testimonio siguiente" className="grid size-11 place-items-center rounded-full border border-borde hover:border-tinta">
            <Flecha />
          </button>
        </div>
      )}
    </div>
  );
}
