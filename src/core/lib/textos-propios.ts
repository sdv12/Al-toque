/**
 * Estilo propio de textos sueltos: en el configurador se toca un texto de la vista previa y se le
 * cambia el tamaño, el color o la tipografía. Cada cambio se guarda con una «clave» que es la
 * ubicación del texto en la página (un selector CSS acotado) y la landing lo aplica con una regla
 * CSS, así que se ve igual en la vista previa, al publicarla y sin JavaScript.
 *
 * La clave se arma desde el ancestro con id más cercano (o desde la raíz de la plantilla) bajando
 * por posición: `#servicios > div:nth-child(2) > h3:nth-child(1)`. Si cambia la estructura de esa
 * parte (por ejemplo, se agrega un servicio antes), el estilo puede quedar en otro texto: por eso el
 * panel permite quitarlo.
 */

/** Tipografías que se pueden elegir. Las caras se declaran en ui/fuentes-texto.ts. */
export const FUENTES_TEXTO = [
  { id: "inter", nombre: "Inter", familia: "Inter, system-ui, sans-serif" },
  { id: "montserrat", nombre: "Montserrat", familia: "Montserrat, system-ui, sans-serif" },
  { id: "poppins", nombre: "Poppins", familia: "Poppins, system-ui, sans-serif" },
  { id: "bebas", nombre: "Bebas Neue", familia: "'Bebas Neue', Impact, sans-serif" },
  { id: "playfair", nombre: "Playfair Display", familia: "'Playfair Display', Georgia, serif" },
  { id: "lora", nombre: "Lora", familia: "Lora, Georgia, serif" },
  { id: "merriweather", nombre: "Merriweather", familia: "Merriweather, Georgia, serif" },
  { id: "dmserif", nombre: "DM Serif Display", familia: "'DM Serif Display', Georgia, serif" },
] as const;

export type FuenteTexto = (typeof FUENTES_TEXTO)[number]["id"];
export const IDS_FUENTES_TEXTO = FUENTES_TEXTO.map((f) => f.id) as [FuenteTexto, ...FuenteTexto[]];

/** Variable CSS con la familia de cada fuente (la declara next/font). */
export const variableFuente = (id: FuenteTexto) => `--fuente-texto-${id}`;

export const TAMANO_MIN = 10;
export const TAMANO_MAX = 160;
export const MAX_TEXTOS_PROPIOS = 80;

export type EstiloTexto = { tamano?: number; color?: string; fuente?: FuenteTexto };

/**
 * Formato de la clave: opcionalmente `#id` y después de 1 a 20 pasos ` > etiqueta:nth-child(n)`.
 * Es estricto a propósito: la clave termina dentro de una regla CSS y no puede colar nada más.
 */
export const CLAVE_TEXTO = /^(#[A-Za-z][\w-]{0,63})?( > [a-z][a-z0-9]{0,15}:nth-child\([1-9]\d{0,2}\)){1,20}$/;

const ID_VALIDO = /^[A-Za-z][\w-]{0,63}$/;
const MAX_PASOS = 20;

/** ¿El elemento tiene texto propio (no solo el de sus hijos)? */
export function tieneTextoPropio(el: Element): boolean {
  for (const n of Array.from(el.childNodes)) if (n.nodeType === 3 && n.textContent && n.textContent.trim()) return true;
  return false;
}

/**
 * Desde el elemento tocado, el texto a editar: él mismo o el ancestro más cercano con texto propio,
 * sin salir de la raíz de la plantilla. Null si se tocó algo sin texto (una foto, un fondo).
 */
export function textoTocado(objetivo: Element, raiz: Element): Element | null {
  for (let el: Element | null = objetivo; el && el !== raiz; el = el.parentElement) {
    if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
    if (tieneTextoPropio(el)) return el;
  }
  return null;
}

/** Clave (selector acotado) de un elemento dentro de la raíz de la plantilla. Null si no se puede. */
export function claveDeElemento(el: Element, raiz: Element): string | null {
  const pasos: string[] = [];
  let actual: Element | null = el;
  while (actual && actual !== raiz) {
    // Un id válido corta el camino (las ids de React, con «:» o ««», no sirven de ancla).
    if (actual !== el && actual.id && ID_VALIDO.test(actual.id)) {
      const clave = `#${actual.id}${pasos.join("")}`;
      return CLAVE_TEXTO.test(clave) ? clave : null;
    }
    const padre: Element | null = actual.parentElement;
    if (!padre) return null;
    const indice = Array.prototype.indexOf.call(padre.children, actual) + 1;
    pasos.unshift(` > ${actual.tagName.toLowerCase()}:nth-child(${indice})`);
    if (pasos.length > MAX_PASOS) return null;
    actual = padre;
  }
  if (actual !== raiz) return null;
  const clave = pasos.join("");
  return CLAVE_TEXTO.test(clave) ? clave : null;
}

/** Selector completo, acotado a la raíz de una plantilla. */
export const selectorDeClave = (clave: string) => `[data-plantilla]${clave.startsWith("#") ? " " : ""}${clave}`;

/** Reglas CSS para los textos con estilo propio. Ignora claves o valores que no pasan el formato. */
export function cssDeTextos(textos: Record<string, EstiloTexto> | undefined): string {
  if (!textos) return "";
  const reglas: string[] = [];
  for (const [clave, e] of Object.entries(textos)) {
    if (!CLAVE_TEXTO.test(clave)) continue;
    const decl: string[] = [];
    if (typeof e.tamano === "number" && e.tamano >= TAMANO_MIN && e.tamano <= TAMANO_MAX) decl.push(`font-size:${Math.round(e.tamano)}px!important`);
    if (e.color && /^#[0-9a-fA-F]{6}$/.test(e.color)) decl.push(`color:${e.color}!important`);
    const fuente = e.fuente && FUENTES_TEXTO.find((f) => f.id === e.fuente);
    if (fuente) decl.push(`font-family:var(${variableFuente(fuente.id)}),${fuente.familia}!important`);
    if (decl.length) reglas.push(`${selectorDeClave(clave)}{${decl.join(";")}}`);
  }
  return reglas.join("\n");
}

/** Fuentes que usa la config (para declarar solo esas caras en la página). */
export function fuentesUsadas(textos: Record<string, EstiloTexto> | undefined): FuenteTexto[] {
  if (!textos) return [];
  return [...new Set(Object.values(textos).flatMap((e) => (e.fuente ? [e.fuente] : [])))];
}
