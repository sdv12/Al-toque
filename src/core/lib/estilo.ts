import { paletaDe, modoPorDefecto, registry, type Paleta, type Plantilla } from "../registry";
import type { Estilo, Modo } from "../schema/comun";
import { AA_TEXTO, ajustarContraste, contraste, luminancia, mejorTinta, mezclar } from "./color";

/** Contraste del texto principal sobre un fondo elegido: AAA, para que lea cómodo en párrafos largos. */
const AAA_TEXTO = 7;

export function resolverModo(plantilla: Plantilla, estilo: Pick<Estilo, "modo">): Modo {
  const modos: readonly Modo[] = registry[plantilla].meta.modos;
  return estilo.modo && modos.includes(estilo.modo) ? estilo.modo : modoPorDefecto(plantilla);
}

export type PaletaEfectiva = Paleta & { superficie2: string; borde: string };

/**
 * Paleta con la que se pinta la landing. Sin fondo propio, es la de la plantilla (y null:
 * los colores salen de tokens.css). Con fondo propio, el resto se deriva de él para que el
 * texto siga pasando contraste: si la tinta de la plantilla no se lee, se usa la inversa.
 */
export function paletaPropia(plantilla: Plantilla, estilo: Pick<Estilo, "modo" | "fondo">): PaletaEfectiva | null {
  if (!estilo.fondo) return null;
  const base = paletaDe(plantilla, resolverModo(plantilla, estilo));
  const fondo = estilo.fondo.toLowerCase();
  const oscuro = luminancia(fondo) < 0.18;
  // Las dos tintas de la plantilla: su texto y su fondo original (claro en las claras, oscuro en las oscuras).
  const texto = ajustarContraste(mejorTinta(fondo, base.texto, base.fondo), fondo, AAA_TEXTO);
  return {
    fondo,
    texto,
    textoSuave: ajustarContraste(mezclar(texto, fondo, 0.3), fondo, AA_TEXTO),
    // Las superficies (tarjetas, bloques) se despegan del fondo hacia la luz, como en las plantillas.
    superficie: mezclar(fondo, "#ffffff", oscuro ? 0.06 : 0.6),
    superficie2: mezclar(fondo, texto, 0.07),
    borde: mezclar(fondo, texto, 0.2),
  };
}

/** Fondo, superficie y texto con los que se pinta la landing, con o sin fondo propio. */
export function paletaEfectiva(plantilla: Plantilla, estilo: Pick<Estilo, "modo" | "fondo">): Paleta {
  return paletaPropia(plantilla, estilo) ?? paletaDe(plantilla, resolverModo(plantilla, estilo));
}

export type VariablesEstilo = {
  "--lk-acento": string;
  /** Acento apto para texto sobre el fondo y la superficie (AA). */
  "--lk-acento-texto": string;
  /** Acento para rellenos que llevan texto encima (botones, bloques): pasa AA con su tinta. */
  "--lk-acento-relleno": string;
  /** Tinta legible sobre el relleno de acento. */
  "--lk-sobre-acento": string;
  /** Solo con fondo propio: pisan los colores base de tokens.css. */
  "--lk-fondo"?: string;
  "--lk-superficie"?: string;
  "--lk-superficie-2"?: string;
  "--lk-texto"?: string;
  "--lk-texto-suave"?: string;
  "--lk-borde"?: string;
};

/**
 * Traduce el acento (y el fondo, si se eligió uno) a variables CSS seguras. El acento original
 * se usa en detalles sin texto; para texto y para rellenos con texto encima se usan versiones
 * ajustadas a AA contra el fondo con el que realmente se pinta.
 */
export function variablesDeEstilo(plantilla: Plantilla, estilo: Estilo): VariablesEstilo {
  const propia = paletaPropia(plantilla, estilo);
  const paleta = propia ?? paletaDe(plantilla, resolverModo(plantilla, estilo));
  const acento = estilo.acento.toLowerCase();
  const tinta = mejorTinta(acento, "#ffffff", "#111111");
  const variables: VariablesEstilo = {
    "--lk-acento": acento,
    // Tiene que leerse tanto sobre el fondo como sobre las superficies (bloques, tarjetas).
    "--lk-acento-texto": ajustarContraste(ajustarContraste(acento, paleta.fondo, AA_TEXTO), paleta.superficie, AA_TEXTO),
    "--lk-acento-relleno": ajustarContraste(acento, tinta, AA_TEXTO),
    "--lk-sobre-acento": tinta,
  };
  if (propia) {
    variables["--lk-fondo"] = propia.fondo;
    variables["--lk-superficie"] = propia.superficie;
    variables["--lk-superficie-2"] = propia.superficie2;
    variables["--lk-texto"] = propia.texto;
    variables["--lk-texto-suave"] = propia.textoSuave;
    variables["--lk-borde"] = propia.borde;
  }
  return variables;
}

/** Para el aviso del configurador: ¿el acento tal cual sirve como texto? */
export function acentoPasaAA(plantilla: Plantilla, estilo: Estilo): boolean {
  return contraste(estilo.acento, paletaEfectiva(plantilla, estilo).fondo) >= AA_TEXTO;
}
