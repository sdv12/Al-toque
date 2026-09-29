import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { variablesDeEstilo } from "../lib/estilo";
import { PLANTILLAS, paletaDe, registry } from "../registry";
import type { Modo } from "../schema/comun";

/**
 * Los colores base viven en dos lugares: tokens.css (para pintar) y el registry (para calcular
 * contraste en el core sin leer CSS). Este test evita que se desincronicen.
 */
function bloque(css: string, selector: string): Record<string, string> {
  const inicio = css.indexOf(`${selector} {`);
  if (inicio === -1) throw new Error(`No encontré el bloque ${selector}`);
  const cuerpo = css.slice(inicio, css.indexOf("}", inicio));
  return Object.fromEntries([...cuerpo.matchAll(/(--lk-[\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]));
}

describe("tokens.css ↔ registry", () => {
  for (const plantilla of PLANTILLAS) {
    const css = readFileSync(fileURLToPath(new URL(`../../templates/${plantilla}/tokens.css`, import.meta.url)), "utf8");
    const { meta } = registry[plantilla];
    const modos = meta.modos as readonly Modo[];

    modos.forEach((modo, i) => {
      const selector = i === 0 ? `[data-plantilla="${plantilla}"]` : `[data-plantilla="${plantilla}"][data-modo="${modo}"]`;
      const vars = { ...bloque(css, `[data-plantilla="${plantilla}"]`), ...(i === 0 ? {} : bloque(css, selector)) };

      it(`${plantilla}/${modo}: paleta base`, () => {
        const paleta = paletaDe(plantilla, modo);
        expect({
          fondo: vars["--lk-fondo"],
          superficie: vars["--lk-superficie"],
          texto: vars["--lk-texto"],
          textoSuave: vars["--lk-texto-suave"],
        }).toEqual(paleta);
      });

      it(`${plantilla}/${modo}: acento por defecto derivado igual que en runtime`, () => {
        const esperado = variablesDeEstilo(plantilla, { acento: meta.acentos[0].hex, esquinas: "suave", modo });
        expect({
          "--lk-acento": vars["--lk-acento"],
          "--lk-acento-texto": vars["--lk-acento-texto"],
          "--lk-acento-relleno": vars["--lk-acento-relleno"],
          "--lk-sobre-acento": vars["--lk-sobre-acento"],
        }).toEqual(esperado);
      });
    });
  }
});
