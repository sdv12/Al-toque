/** Hash FNV-1a de 32 bits: misma entrada, mismo número. Base de los datos demo deterministas. */
export function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Número en [0, 1) derivado de la semilla. */
export function azar(semilla: string): number {
  return hash(semilla) / 0x100000000;
}
