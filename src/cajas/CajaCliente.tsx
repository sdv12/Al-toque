"use client";

import type { CSSProperties } from "react";
import { COLORES_CAJA, type CajaConfig } from "./config";
import { activaDesde, usarCaja } from "./simple/lib/activa";
import App from "./simple/components/App";

/** Variables de color de la caja (las lee estilos.css: bg-acento, text-acento-oscuro…). */
export function estiloDeColor(color: CajaConfig["color"]): CSSProperties {
  const c = COLORES_CAJA[color];
  return { "--cj-acento": c.acento, "--cj-acento-oscuro": c.oscuro, "--cj-acento-claro": c.claro } as CSSProperties;
}

/**
 * Una caja lista para usar. `base` es dónde se guardan sus datos en el navegador: cambiarla es
 * cambiar de caja, por eso también es la key de la app (vuelve a cargar todo).
 */
export default function CajaCliente({ config, base }: { config: CajaConfig; base: string }) {
  // Se fija antes de dibujar: el guardado, los productos de arranque y los mensajes la leen.
  usarCaja(activaDesde(config, base));
  return (
    <div data-caja="simple" style={estiloDeColor(config.color)}>
      <App key={base} />
    </div>
  );
}
