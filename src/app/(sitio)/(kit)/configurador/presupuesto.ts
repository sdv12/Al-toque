import { useSyncExternalStore } from "react";
import type { IdPresupuesto } from "@/core/lib/precios";

/*
 * Lo que la persona piensa invertir, elegido en la pestaña Precio. No es parte de la página (no va
 * en el borrador ni en el código LK1): se guarda aparte en el navegador y viaja en el pedido.
 */
const CLAVE = "landing-kit:presupuesto";
const EVENTO = "landing-kit:presupuesto";

function suscribir(avisar: () => void) {
  window.addEventListener(EVENTO, avisar);
  window.addEventListener("storage", avisar);
  return () => {
    window.removeEventListener(EVENTO, avisar);
    window.removeEventListener("storage", avisar);
  };
}

function leer(): IdPresupuesto | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "bajo" || v === "medio" || v === "alto" || v === "nose" ? v : null;
  } catch {
    return null;
  }
}

export function elegirPresupuesto(v: IdPresupuesto | null) {
  try {
    if (v) localStorage.setItem(CLAVE, v);
    else localStorage.removeItem(CLAVE);
  } catch {}
  window.dispatchEvent(new Event(EVENTO));
}

export function usePresupuesto(): IdPresupuesto | null {
  return useSyncExternalStore(suscribir, leer, () => null);
}
