"use client";

import { useEffect, useRef, useState } from "react";
import { formatearPesos } from "@/core/lib/mensajes";
import type { VarianteDe } from "@/core/registry";
import { Calendario } from "../disponibilidad/Calendario";
import { Consulta, Huespedes } from "../disponibilidad/Consulta";
import { ID_FECHAS, useDisponibilidad } from "../disponibilidad/DisponibilidadContext";
import { margen, separador, tituloSeccion } from "../estilos";

type Props = { variante: VarianteDe<"alojamiento", "disponibilidad"> };

/**
 * El calendario (decenas de botones con estado) se monta recién cuando la sección se acerca a
 * la pantalla: la carga inicial no paga su hidratación. Mientras tanto, un bloque del mismo alto.
 */
function CalendarioDiferido({ meses }: { meses: 1 | 2 | 3 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setMontado(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={montado ? "" : "min-h-[26rem]"}>
      {montado ? <Calendario meses={meses} /> : <p className="text-chico text-tinta-suave">Cargando calendario…</p>}
    </div>
  );
}

function SelectorCasa({ enFila }: { enFila?: boolean }) {
  const d = useDisponibilidad();
  if (d.propiedades.length < 2) return null;
  return (
    <fieldset>
      <legend className="text-chico font-semibold">Casa</legend>
      <div className={`mt-2 ${enFila ? "flex flex-wrap gap-2" : "space-y-2"}`}>
        {d.propiedades.map((p) => (
          <label key={p.id} className="block cursor-pointer">
            <input
              type="radio"
              name="casa-fechas"
              value={p.id}
              checked={d.propiedad?.id === p.id}
              onChange={() => d.elegirPropiedad(p.id)}
              className="peer sr-only"
            />
            <span
              className={`block rounded-base border-[1.5px] border-borde transition-colors peer-checked:border-acento peer-checked:bg-superficie peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foco hover:border-tinta-suave ${
                enFila ? "px-4 py-2" : "px-4 py-3"
              }`}
            >
              <span className="font-display text-subtitulo">{p.nombre}</span>
              {!enFila && (
                <span className="block text-mini text-tinta-suave">
                  Hasta {p.maxHuespedes ?? p.capacidad} personas
                  {p.precioNoche !== null && ` · ${formatearPesos(p.precioNoche)} la noche`}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Disponibilidad({ variante }: Props) {
  if (variante === "calendario-amplio") {
    return (
      <section id={ID_FECHAS} aria-labelledby="fechas-titulo" className={`${separador} ${margen} scroll-mt-4 py-20`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="fechas-titulo" tabIndex={-1} className={`${tituloSeccion} focus:outline-none`}>
              ¿Cuándo venís?
            </h2>
            <p className="mt-2 text-tinta-suave">Elegí entrada y salida. Las noches rayadas ya están tomadas.</p>
          </div>
          <SelectorCasa enFila />
        </div>
        <div className="mt-10">
          <CalendarioDiferido meses={3} />
        </div>
        <div className="mt-6 grid gap-6 @3xl:grid-cols-[auto_1fr] @3xl:items-start">
          <Huespedes />
          <Consulta horizontal />
        </div>
      </section>
    );
  }

  // calendario-ficha
  return (
    <section id={ID_FECHAS} aria-labelledby="fechas-titulo" className={`${separador} ${margen} scroll-mt-4 py-20`}>
      <div className="grid gap-10 @4xl:grid-cols-12">
        <div className="space-y-8 @4xl:col-span-4">
          <div>
            <h2 id="fechas-titulo" tabIndex={-1} className={`${tituloSeccion} focus:outline-none`}>
              ¿Cuándo venís?
            </h2>
            <p className="mt-2 text-tinta-suave">Elegí la casa, las fechas y cuántos son. Te respondemos por WhatsApp.</p>
          </div>
          <SelectorCasa />
          <Huespedes />
        </div>
        <div className="@4xl:col-span-8">
          <CalendarioDiferido meses={2} />
          <div className="mt-2">
            <Consulta />
          </div>
        </div>
      </div>
    </section>
  );
}
