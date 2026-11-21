"use client";

import { useEffect } from "react";

/**
 * Antes la app de turnos vivía en /turnos (con #/probar, ?demo=… o ?d=…). Ahora está en
 * /turnos/demo: los links viejos que ya se compartieron siguen andando (también si el #/… cambia
 * sin recargar la página).
 */
export function LinksViejos() {
  useEffect(() => {
    const revisar = () => {
      const q = new URLSearchParams(location.search);
      if (location.hash.startsWith("#/") || q.has("demo") || q.has("d")) location.replace(`/turnos/demo${location.search}${location.hash}`);
    };
    revisar();
    window.addEventListener("hashchange", revisar);
    return () => window.removeEventListener("hashchange", revisar);
  }, []);
  return null;
}
