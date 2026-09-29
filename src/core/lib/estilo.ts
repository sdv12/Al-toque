import { paletaDe, modoPorDefecto, registry, type Plantilla } from "../registry";
import type { Estilo, Modo } from "../schema/comun";
import { AA_TEXTO, ajustarContraste, contraste, mejorTinta } from "./color";

export function resolverModo(plantilla: Plantilla, estilo: Pick<Estilo, "modo">): Modo {
  const modos: readonly Modo[] = registry[plantilla].meta.modos;
  return estilo.modo && modos.includes(estilo.modo) ? estilo.modo : modoPorDefecto(plantilla);
}

export type VariablesEstilo = {
  "--lk-acento": string;
  /** Acento apto para texto sobre el fondo y la superficie (AA). */
  "--lk-acento-texto": string;
  /** Acento para rellenos que llevan texto encima (botones, bloques): pasa AA con su tinta. */
  "--lk-acento-relleno": string;
  /** Tinta legible sobre el relleno de acento. */
  "--lk-sobre-acento": string;
};

/**
 * Traduce el acento elegido a variables CSS seguras. El acento original se usa en detalles
 * sin texto; para texto y para rellenos con texto encima se usan versiones ajustadas a AA.
 */
export function variablesDeEstilo(plantilla: Plantilla, estilo: Estilo): VariablesEstilo {
  const paleta = paletaDe(plantilla, resolverModo(plantilla, estilo));
  const acento = estilo.acento.toLowerCase();
  const tinta = mejorTinta(acento, "#ffffff", "#111111");
  return {
    "--lk-acento": acento,
    // Tiene que leerse tanto sobre el fondo como sobre las superficies (bloques, tarjetas).
    "--lk-acento-texto": ajustarContraste(ajustarContraste(acento, paleta.fondo, AA_TEXTO), paleta.superficie, AA_TEXTO),
    "--lk-acento-relleno": ajustarContraste(acento, tinta, AA_TEXTO),
    "--lk-sobre-acento": tinta,
  };
}

/** Para el aviso del configurador: ¿el acento tal cual sirve como texto? */
export function acentoPasaAA(plantilla: Plantilla, estilo: Estilo): boolean {
  const paleta = paletaDe(plantilla, resolverModo(plantilla, estilo));
  return contraste(estilo.acento, paleta.fondo) >= AA_TEXTO;
}
