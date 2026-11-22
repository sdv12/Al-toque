"use client";

import { Children, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Carrusel infinito de «Ya están online»: una tarjeta centrada y un pedazo de la anterior y la
 * siguiente a los costados. En el celular se desliza con el dedo y tiene puntos; en pantallas
 * grandes, flechas a los costados de la tarjeta central.
 *
 * Para que sea infinito, la pista lleva copias de las últimas tarjetas al principio y de las
 * primeras al final. Al terminar la animación sobre una copia, salta sin animación a la tarjeta
 * real equivalente y no se nota. Solo la tarjeta central se puede usar: las demás son `inert`.
 */
const COPIAS = 2;
const DURACION = 450;

export function CarruselProyectos({ children, etiqueta }: { children: ReactNode; etiqueta: string }) {
  const items = Children.toArray(children);
  const n = items.length;
  const extendida = [...items.slice(-COPIAS), ...items, ...items.slice(0, COPIAS)];

  const [pos, setPos] = useState(COPIAS);
  const [animar, setAnimar] = useState(true);
  const [arrastre, setArrastre] = useState(0);
  const inicio = useRef<{ x: number; y: number; id: number } | null>(null);
  const arrastrado = useRef(false);
  const ocupado = useRef(false);

  const actual = (((pos - COPIAS) % n) + n) % n;

  // Si quedó sobre una copia, al terminar la animación salta a la tarjeta real equivalente.
  useEffect(() => {
    if (pos >= COPIAS && pos < COPIAS + n) return;
    const t = setTimeout(() => {
      setAnimar(false);
      setPos(COPIAS + ((((pos - COPIAS) % n) + n) % n));
    }, DURACION);
    return () => clearTimeout(t);
  }, [pos, n]);

  // Después de un salto sin animación, se vuelve a animar en el cuadro siguiente.
  useEffect(() => {
    if (animar || arrastre !== 0) return;
    // Dos cuadros: el primero pinta la posición nueva sin transición; recién después se reactiva.
    let id = requestAnimationFrame(() => (id = requestAnimationFrame(() => setAnimar(true))));
    return () => cancelAnimationFrame(id);
  }, [animar, arrastre]);

  function mover(delta: number) {
    if (ocupado.current) return;
    ocupado.current = true;
    setTimeout(() => (ocupado.current = false), DURACION);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAnimar(!reducido);
    setPos((p) => (reducido ? COPIAS + ((((p - COPIAS + delta) % n) + n) % n) : p + delta));
  }

  function irA(i: number) {
    setAnimar(true);
    setPos(COPIAS + i);
  }

  function bajar(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    inicio.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    arrastrado.current = false;
  }

  function mientras(e: React.PointerEvent) {
    const i = inicio.current;
    if (!i || i.id !== e.pointerId) return;
    const dx = e.clientX - i.x;
    if (!arrastrado.current) {
      // Si el gesto es más vertical que horizontal, es el scroll de la página: no se toca.
      if (Math.abs(e.clientY - i.y) > Math.abs(dx)) {
        inicio.current = null;
        return;
      }
      if (Math.abs(dx) < 8) return;
      arrastrado.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    setAnimar(false);
    setArrastre(dx);
  }

  function soltar(e: React.PointerEvent) {
    const i = inicio.current;
    inicio.current = null;
    if (!i || !arrastrado.current) return;
    const dx = e.clientX - i.x;
    setArrastre(0);
    setAnimar(true);
    if (Math.abs(dx) > 50) {
      ocupado.current = false;
      mover(dx < 0 ? 1 : -1);
    }
  }

  const estiloPista: CSSProperties = {
    transform: `translateX(calc(50% - var(--ancho) / 2 - ${pos} * (var(--ancho) + var(--hueco)) + ${arrastre}px))`,
    transition: animar ? `transform ${DURACION}ms cubic-bezier(0.22, 1, 0.36, 1)` : "none",
  };

  const flecha =
    "pointer-events-auto grid size-14 place-items-center rounded-full border-2 border-tinta bg-superficie shadow-[0_10px_30px_-12px_rgb(23_21_15/0.5)] transition-colors hover:bg-acento-relleno";

  return (
    <div
      role="region"
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      className="relative -mx-4 mt-8 overflow-hidden [--ancho:86%] [--hueco:0.75rem] @3xl:-mx-8 @4xl:mt-12 @4xl:[--ancho:min(64%,52rem,85svh)] @4xl:[--hueco:1.5rem] @4xl:[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)] @6xl:-mx-12"
    >
      <ul
        className="flex touch-pan-y select-none gap-[var(--hueco)] pb-6 pt-2"
        style={estiloPista}
        onPointerDown={bajar}
        onPointerMove={mientras}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onClickCapture={(e) => {
          // Un arrastre no tiene que abrir el sitio.
          if (arrastrado.current) {
            e.preventDefault();
            e.stopPropagation();
            arrastrado.current = false;
          }
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {extendida.map((item, k) => {
          const real = k >= COPIAS && k < COPIAS + n;
          const centro = k === pos;
          return (
            <li
              key={k}
              aria-roledescription={real ? "diapositiva" : undefined}
              aria-label={real ? `${k - COPIAS + 1} de ${n}` : undefined}
              aria-hidden={real ? undefined : true}
              inert={!centro}
              className={`w-[var(--ancho)] shrink-0 transition-opacity duration-300 ${centro ? "opacity-100" : "opacity-45"}`}
            >
              {item}
            </li>
          );
        })}
      </ul>

      {/* Flechas: a los costados de la tarjeta central, a la altura de la captura. */}
      <div className="pointer-events-none absolute inset-x-0 top-2 hidden @4xl:block">
        <div className="relative mx-auto flex w-[var(--ancho)] items-center justify-between" style={{ aspectRatio: "1440 / 940" }}>
          <button type="button" className={`${flecha} -translate-x-1/2`} onClick={() => mover(-1)} aria-label="Sitio anterior">
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 4 6 10l6 6" />
            </svg>
          </button>
          <button type="button" className={`${flecha} translate-x-1/2`} onClick={() => mover(1)} aria-label="Sitio siguiente">
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m8 4 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 @4xl:hidden">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => irA(i)}
            aria-label={`Ir al sitio ${i + 1}`}
            aria-current={i === actual ? "true" : undefined}
            className="grid size-6 place-items-center"
          >
            <span className={`block h-2.5 rounded-full border-2 border-tinta transition-all ${i === actual ? "w-7 bg-tinta" : "w-2.5 bg-transparent"}`} />
          </button>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">
        Sitio {actual + 1} de {n}
      </p>
    </div>
  );
}
