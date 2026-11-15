/**
 * Novedades de /adm: salen de CHANGELOG.md (la misma entrada que se escribe en cada versión), así
 * no hay que cargarlas dos veces. Formato esperado:
 *
 *   ## 1.9.1 · 2026-11-15
 *   - Un cambio, que puede seguir
 *     en la línea de abajo (con sangría).
 */
export interface Version {
  version: string;
  /** "2026-11-15" */
  fecha: string;
  cambios: string[];
}

const ENCABEZADO = /^##\s+(\d+\.\d+\.\d+)\s*·\s*(\d{4}-\d{2}-\d{2})\s*$/;

export function leerChangelog(texto: string): Version[] {
  const versiones: Version[] = [];
  let actual: Version | null = null;
  for (const linea of texto.split(/\r?\n/)) {
    const enc = ENCABEZADO.exec(linea.trim());
    if (enc) {
      actual = { version: enc[1]!, fecha: enc[2]!, cambios: [] };
      versiones.push(actual);
      continue;
    }
    if (!actual) continue;
    if (/^#/.test(linea)) {
      actual = null;
      continue;
    }
    const item = /^\s*[-*]\s+(.*)$/.exec(linea);
    if (item && !/^\s{2,}/.test(linea)) actual.cambios.push(item[1]!.trim());
    else if (linea.trim() && actual.cambios.length) actual.cambios[actual.cambios.length - 1] += ` ${linea.trim()}`;
  }
  return versiones;
}

/** Compara versiones semver ("1.10.0" > "1.9.1"). */
export function compararVersiones(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}

/** Tipo de cambio según semver: lo muestra la etiqueta de cada versión. */
export function tipoDeVersion(version: string): "grande" | "nueva" | "ajuste" {
  const [, menor, parche] = version.split(".").map(Number);
  if (!menor && !parche) return "grande";
  return parche ? "ajuste" : "nueva";
}

export type Trozo = { tipo: "texto" | "negrita" | "codigo"; texto: string };

/** Lo poco de Markdown que usa el CHANGELOG: **negrita** y `código`. */
export function trozos(linea: string): Trozo[] {
  const salida: Trozo[] = [];
  // La negrita va primero: puede tener código adentro (**en `/adm`**) y se vuelve a partir al dibujar.
  for (const parte of linea.split(/(\*\*.+?\*\*|`[^`]+`)/)) {
    if (!parte) continue;
    if (parte.startsWith("**") && parte.endsWith("**")) salida.push({ tipo: "negrita", texto: parte.slice(2, -2) });
    else if (parte.startsWith("`") && parte.endsWith("`")) salida.push({ tipo: "codigo", texto: parte.slice(1, -1) });
    else salida.push({ tipo: "texto", texto: parte });
  }
  return salida;
}
