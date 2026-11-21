"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/** Evento con el que cualquier botón de la página abre a Alto. */
export const EVENTO_ABRIR_ALTO = "altoque:abrir-alto";

/**
 * Botón "Encontrar mi solución": si la página tiene a Alto, lo abre; si no (legales, por ejemplo),
 * lleva a la portada, que lo abre sola con ?alto.
 */
export function AbrirAlto({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Link
      href="/?alto"
      className={className}
      onClick={(e) => {
        if (document.documentElement.dataset.alto !== "1") return;
        e.preventDefault();
        window.dispatchEvent(new Event(EVENTO_ABRIR_ALTO));
      }}
    >
      {children}
    </Link>
  );
}
