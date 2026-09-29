"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useBooking, type Booking } from "@/core/hooks/useBooking";
import type { PasoReserva, Preseleccion } from "@/core/lib/reserva";
import type { ConfigDe } from "@/core/schema/landing-config";

/** Booking-first: primero qué necesitás, después con quién. */
const ORDEN: readonly PasoReserva[] = ["servicio", "profesional", "dia", "horario", "datos"];

export const ID_TURNOS = "turnos";

type Valor = Booking & {
  /** Carga prestación/profesional en el widget de la portada y lleva hasta él. */
  pedirTurno: (pre?: Preseleccion) => void;
};

const Ctx = createContext<Valor | null>(null);

export function TurnosProvider({ config, children }: { config: ConfigDe<"consultorio">; children: ReactNode }) {
  const b = useBooking({ config, orden: ORDEN });

  const pedirTurno = (pre: Preseleccion = {}) => {
    if (pre.servicioId || pre.profesionalId) b.preseleccionar(pre);
    const widget = document.getElementById(ID_TURNOS);
    if (!widget) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    widget.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
    widget.querySelector<HTMLElement>("[data-titulo-paso]")?.focus({ preventScroll: true });
  };

  return <Ctx.Provider value={{ ...b, pedirTurno }}>{children}</Ctx.Provider>;
}

export function useTurnos(): Valor {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTurnos necesita <TurnosProvider>");
  return v;
}
