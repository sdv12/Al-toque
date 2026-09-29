"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAvailability, type Availability } from "@/core/hooks/useAvailability";
import type { ConfigDe } from "@/core/schema/landing-config";

type Valor = Availability & {
  /** Hay sección de disponibilidad activa en la página. */
  hayCalendario: boolean;
  /** Lleva a la sección de fechas, opcionalmente con una casa ya elegida. */
  irAFechas: (propiedadId?: string) => void;
};

const Ctx = createContext<Valor | null>(null);

export const ID_FECHAS = "fechas";

/**
 * Un solo estado de disponibilidad para toda la página: el calendario, la barra inferior
 * y los botones "Ver fechas" de cada casa hablan del mismo rango.
 */
export function DisponibilidadProvider({ config, children }: { config: ConfigDe<"alojamiento">; children: ReactNode }) {
  const a = useAvailability({ config });
  const hayCalendario = config.secciones.some((s) => s.tipo === "disponibilidad" && s.activa);

  const irAFechas = (propiedadId?: string) => {
    if (propiedadId) a.elegirPropiedad(propiedadId);
    const destino = document.getElementById(ID_FECHAS);
    if (!destino) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    destino.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };

  const valor = { ...a, hayCalendario, irAFechas };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDisponibilidad(): Valor {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDisponibilidad necesita <DisponibilidadProvider>");
  return v;
}

/** Resumen corto del rango para barras y botones ("15–18 oct · 3 noches"). */
export function useResumenCorto(): string | null {
  const { rango, noches } = useDisponibilidad();
  return useMemo(() => {
    if (!rango.desde) return null;
    const d = (f: string) => Number(f.slice(8, 10));
    const mes = (f: string) => new Intl.DateTimeFormat("es-AR", { month: "short", timeZone: "UTC" }).format(new Date(`${f}T12:00:00Z`)).replace(".", "");
    if (!rango.hasta) return `Entrada ${d(rango.desde)} ${mes(rango.desde)}`;
    const mismoMes = rango.desde.slice(0, 7) === rango.hasta.slice(0, 7);
    const tramo = mismoMes ? `${d(rango.desde)}–${d(rango.hasta)} ${mes(rango.hasta)}` : `${d(rango.desde)} ${mes(rango.desde)} – ${d(rango.hasta)} ${mes(rango.hasta)}`;
    return `${tramo} · ${noches} ${noches === 1 ? "noche" : "noches"}`;
  }, [rango, noches]);
}
