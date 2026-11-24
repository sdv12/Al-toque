"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Navegador, Telefono } from "./Marcos";
import { afiche } from "./estilos";

/*
 * Las soluciones como acordeón horizontal: en compu, tarjetas una al lado de la otra; la abierta
 * se estira y las demás quedan como lomos con el nombre vertical. En celular, una debajo de la otra.
 * Mientras se ve y nadie la toca, pasa sola de una a otra (salvo con "menos movimiento").
 */

export type SolucionVista = {
  id: string;
  nombre: string;
  para: string;
  titulo: string;
  texto: string;
  incluye: string[];
  precio?: { unico: string; mensual: string; desde: boolean };
  ver: { href: string; texto: string };
  demo?: { href: string; texto: string };
  imagen?: { src: string; alt: string; marco: "navegador" | "telefono"; url?: string };
  /** Mensaje de WhatsApp para "Avisame cuando esté" (las que todavía no están). */
  avisame?: string;
};

const PASO_MS = 6500;

type Tema = { fondo: string; primario: string; secundario: string; vineta: string; suave: string };

/** Colores de cada tarjeta, por solución (las que no figuran usan el de la web). */
const TEMAS: Record<string, Tema> = {
  web: { fondo: "bg-tinta text-fondo", primario: "bg-acento-relleno text-sobre-acento", secundario: "border-fondo text-fondo hover:bg-fondo hover:text-tinta", vineta: "bg-acento-relleno", suave: "opacity-75" },
  estudio: { fondo: "bg-fondo text-tinta", primario: "bg-tinta text-fondo", secundario: "border-tinta hover:bg-tinta hover:text-fondo", vineta: "bg-tinta", suave: "text-tinta-suave" },
  belleza: { fondo: "bg-superficie-2 text-tinta", primario: "bg-tinta text-fondo", secundario: "border-tinta hover:bg-tinta hover:text-fondo", vineta: "bg-acento", suave: "text-tinta-suave" },
  legal: { fondo: "bg-fondo text-tinta", primario: "bg-tinta text-fondo", secundario: "border-tinta hover:bg-tinta hover:text-fondo", vineta: "bg-tinta", suave: "text-tinta-suave" },
  turnos: { fondo: "bg-acento-relleno text-sobre-acento", primario: "bg-tinta text-fondo", secundario: "border-tinta hover:bg-tinta hover:text-fondo", vineta: "bg-tinta", suave: "opacity-80" },
  caja: { fondo: "bg-superficie text-tinta", primario: "bg-tinta text-fondo", secundario: "border-tinta hover:bg-tinta hover:text-fondo", vineta: "bg-acento", suave: "text-tinta-suave" },
  resto: { fondo: "bg-tinta text-fondo", primario: "bg-acento-relleno text-sobre-acento", secundario: "border-fondo text-fondo hover:bg-fondo hover:text-tinta", vineta: "bg-acento-relleno", suave: "opacity-75" },
  tienda: { fondo: "bg-superficie-2 text-tinta border-dashed", primario: "bg-tinta text-fondo", secundario: "border-tinta hover:bg-tinta hover:text-fondo", vineta: "bg-acento", suave: "text-tinta-suave" },
};

const botonBase = "inline-flex min-h-12 items-center justify-center rounded-control px-6 text-cuerpo font-semibold transition-transform hover:-translate-y-0.5";

export function SolucionesAcordeon({ items, whatsapp }: { items: SolucionVista[]; whatsapp: string | undefined }) {
  // Una sola abierta a la vez; null = todas cerradas (la «×» de la abierta la cierra).
  const [abierta, setAbierta] = useState<number | null>(0);
  const [solo, setSolo] = useState(true);
  const raiz = useRef<HTMLDivElement>(null);
  const base = useId();

  // Pasa sola mientras está en pantalla, hasta que la persona la toca.
  useEffect(() => {
    if (!solo || !raiz.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setSolo(false), 0);
      return () => clearTimeout(t);
    }
    let reloj: ReturnType<typeof setInterval> | undefined;
    const vista = new IntersectionObserver(
      ([e]) => {
        clearInterval(reloj);
        if (e?.isIntersecting) reloj = setInterval(() => setAbierta((a) => ((a ?? -1) + 1) % items.length), PASO_MS);
      },
      { threshold: 0.4 },
    );
    vista.observe(raiz.current);
    return () => {
      vista.disconnect();
      clearInterval(reloj);
    };
  }, [solo, items.length]);

  const tocar = () => setSolo(false);

  return (
    <div
      ref={raiz}
      onPointerEnter={tocar}
      onFocusCapture={tocar}
      onTouchStart={tocar}
      className="mt-8 flex flex-col gap-3 @4xl:mt-14 @4xl:min-h-[38rem] @4xl:flex-row"
    >
      {items.map((x, i) => {
        const activa = i === abierta;
        const tema = TEMAS[x.id] ?? TEMAS.web!;
        const panel = `${base}-panel-${x.id}`;
        return (
          <article
            key={x.id}
            id={x.id === "tienda" ? "tienda" : undefined}
            aria-labelledby={`${base}-boton-${x.id}`}
            className={`relative flex min-w-0 scroll-mt-4 flex-col overflow-hidden rounded-base border-2 border-tinta transition-[flex-grow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none ${tema.fondo} ${
              activa ? "@4xl:flex-[5.5]" : "@4xl:flex-[1] @4xl:hover:flex-[1.35]"
            }`}
          >
            {activa && solo && (
              <span
                key={`progreso-${abierta}`}
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 origin-left bg-current opacity-40"
                style={{ animation: `acordeon-progreso ${PASO_MS}ms linear both` }}
              />
            )}
            <h3 className="contents">
              <button
                id={`${base}-boton-${x.id}`}
                type="button"
                aria-expanded={activa}
                aria-controls={panel}
                onClick={() => {
                  tocar();
                  setAbierta(activa ? null : i);
                }}
                className={`flex w-full items-center gap-4 p-5 text-left outline-offset-[-4px] @4xl:p-6 ${
                  activa ? "@4xl:pb-0" : "@4xl:h-full @4xl:flex-col @4xl:items-start @4xl:justify-between"
                }`}
              >
                <span className={`${afiche} text-[2rem] leading-none tabular-nums ${activa ? "" : "@4xl:text-[2.5rem]"}`}>0{i + 1}</span>
                <span
                  className={`min-w-0 flex-1 font-semibold ${
                    activa ? "" : `@4xl:flex-none @4xl:[writing-mode:vertical-rl] @4xl:rotate-180 ${afiche} @4xl:text-[clamp(1.8rem,2.4cqi,2.4rem)] @4xl:leading-none`
                  }`}
                >
                  {x.nombre}
                  {!activa && <span className="block text-chico font-normal opacity-75 @4xl:hidden">{x.titulo}</span>}
                </span>
                <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-full border-2 border-current text-cuerpo transition-transform ${activa ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
            </h3>

            <div
              id={panel}
              role="region"
              aria-labelledby={`${base}-boton-${x.id}`}
              hidden={!activa}
              className="flex min-h-0 flex-1 animate-alto-aparece flex-col gap-6 p-5 pt-2 motion-reduce:animate-none @4xl:p-6 @6xl:grid @6xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] @6xl:items-center @6xl:gap-8"
            >
              <div className="flex min-w-0 flex-col">
                <p className={`text-chico font-semibold ${tema.suave}`}>{x.para}</p>
                <p className={`${afiche} mt-2 text-[clamp(2rem,1rem+2.4cqi,3.2rem)] leading-[0.9]`}>{x.titulo}</p>
                <p className="mt-4 max-w-[46ch]">{x.texto}</p>
                {x.incluye.length > 0 && (
                  <ul className="mt-5 space-y-2 text-chico">
                    {x.incluye.map((t) => (
                      <li key={t} className="flex gap-2.5">
                        <span aria-hidden className={`mt-[0.5em] h-1.5 w-3 shrink-0 ${tema.vineta}`} />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {x.precio && (
                  <p data-precios className="mt-6">
                    {x.precio.desde && <span className="text-chico">desde </span>}
                    <span className={`${afiche} text-[clamp(2rem,1.4rem+1.8cqi,2.6rem)] leading-none tabular-nums`}>{x.precio.unico}</span>
                    <span className={`ml-1.5 inline-block whitespace-nowrap text-chico ${tema.suave}`}>+ {x.precio.mensual} por mes</span>
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  {x.avisame && whatsapp ? (
                    <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(x.avisame)}`} target="_blank" rel="noopener noreferrer" className={`${botonBase} ${tema.primario}`}>
                      Avisame cuando esté
                    </a>
                  ) : null}
                  <Link href={x.ver.href} className={x.avisame ? `${botonBase} border-2 ${tema.secundario}` : `${botonBase} ${tema.primario}`}>
                    {x.ver.texto}
                  </Link>
                  {x.demo && (
                    <Link href={x.demo.href} className={`${botonBase} border-2 ${tema.secundario}`}>
                      {x.demo.texto}
                      <span className="sr-only"> de {x.nombre}</span>
                    </Link>
                  )}
                </div>
              </div>
              <div className="hidden min-w-0 @6xl:block">
                {x.imagen ? (
                  x.imagen.marco === "navegador" ? (
                    <Navegador src={x.imagen.src} alt={x.imagen.alt} url={x.imagen.url ?? ""} sizes="(min-width: 1280px) 34vw, 45vw" />
                  ) : (
                    <Telefono src={x.imagen.src} alt={x.imagen.alt} sizes="(min-width: 1280px) 220px, 30vw" className="mx-auto w-[58%] max-w-[15rem] rotate-[3deg]" />
                  )
                ) : (
                  <p aria-hidden className={`${afiche} text-center text-[clamp(4rem,10cqi,8rem)] leading-none opacity-25`}>
                    Pronto
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
