import demo from "../../../configs/demo-arquitectos.json";
import type { ConfigDe } from "../schema/landing-config";

/**
 * Ejemplo "Estudio": la plantilla Portfolio modular con su portada a pantalla completa y las
 * variantes sobrias. Sale de la demo publicada (una sola fuente) sin la marca de demo.
 */
export const estudioEjemplo = { ...demo, demo: undefined } as unknown as ConfigDe<"generico">;

/** Puntos de partida además del ejemplo de cada plantilla (se piden con /configurador?plantilla=<id>). */
export const EJEMPLOS_EXTRA = {
  estudio: { nombre: "Estudio", config: estudioEjemplo },
} as const;

export type EjemploExtra = keyof typeof EJEMPLOS_EXTRA;

export function esEjemploExtra(valor: string | null): valor is EjemploExtra {
  return valor !== null && Object.hasOwn(EJEMPLOS_EXTRA, valor);
}
