import type { CajaConfig } from "@/cajas/config";
import { RUBROS, type RubroCaja } from "@/cajas/rubros";

/**
 * La caja que está abierta en esta página. Cada página /c/<slug> muestra una sola caja; la
 * página la fija con usarCaja() antes de dibujarla, y el guardado, los productos de arranque y
 * los mensajes de WhatsApp la leen de acá.
 */
export interface CajaActiva {
  /** Nombre de la base de datos del navegador: cada caja (y cada rubro de la prueba) tiene la suya. */
  base: string;
  nombre: string;
  rubro: RubroCaja;
  fiado: boolean;
  cajones: boolean;
  /** Demo o prueba: arranca con ventas y clientes de ejemplo y se puede empezar de cero. */
  ejemplo: boolean;
}

let activa: CajaActiva = {
  base: "caja-prueba-verduleria",
  nombre: RUBROS.verduleria.ejemplo,
  rubro: "verduleria",
  fiado: true,
  cajones: true,
  ejemplo: true,
};

export function activaDesde(config: CajaConfig, base: string): CajaActiva {
  return {
    base,
    nombre: config.negocio.nombre,
    rubro: config.rubro,
    fiado: config.modulos.fiado,
    cajones: config.modulos.cajones && RUBROS[config.rubro].cajones,
    ejemplo: !!config.demo,
  };
}

export function usarCaja(caja: CajaActiva) {
  activa = caja;
}

export function cajaActiva(): CajaActiva {
  return activa;
}
