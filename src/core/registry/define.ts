import type { Modo } from "../schema/comun";
import type { ClaveContenido } from "../schema/contenido";

export type Paleta = {
  fondo: string;
  superficie: string;
  texto: string;
  textoSuave: string;
};

export type DefSeccion = {
  etiqueta: string;
  descripcion: string;
  /** id de variante → nombre visible en el configurador. */
  variantes: Readonly<Record<string, string>>;
  /** Contenido que tiene que existir (y no estar vacío) si la sección está activa. */
  requiere?: readonly ClaveContenido[];
  /** Sección de apertura: obligatoria, activa y siempre primera. */
  inicio?: boolean;
};

export type MetaPlantilla = {
  nombre: string;
  rubro: string;
  descripcion: string;
  /** El primero es el modo por defecto. */
  modos: readonly [Modo, ...Modo[]];
  /** Espejo de los tokens de color en tokens.css (hay un test que los compara). */
  paletas: Partial<Record<Modo, Paleta>>;
  acentos: readonly [{ nombre: string; hex: string }, ...{ nombre: string; hex: string }[]];
};

export type DefPlantilla = {
  meta: MetaPlantilla;
  secciones: Readonly<Record<string, DefSeccion>>;
};

/** Identidad con inferencia `const`: preserva los ids literales de secciones y variantes. */
export function definirPlantilla<const D extends DefPlantilla>(def: D): D {
  return def;
}
