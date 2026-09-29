"use client";

import type { ReactNode } from "react";
import { useReserva } from "./ReservaContext";

type Props = {
  profesionalId?: string;
  servicioId?: string;
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
};

/** Abre el panel de reserva desde cualquier punto de la página. */
export function BotonReservar({ profesionalId, servicioId, className, children, ...resto }: Props) {
  const { abrir } = useReserva();
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      aria-label={resto["aria-label"]}
      onClick={() => abrir({ ...(profesionalId ? { profesionalId } : {}), ...(servicioId ? { servicioId } : {}) })}
    >
      {children}
    </button>
  );
}
