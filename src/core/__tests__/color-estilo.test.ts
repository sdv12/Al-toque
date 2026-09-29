import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { AA_TEXTO, ajustarContraste, contraste, mezclar } from "../lib/color";
import { acentoPasaAA, resolverModo, variablesDeEstilo } from "../lib/estilo";
import { PLANTILLAS, paletaDe, registry } from "../registry";
import type { Modo } from "../schema/comun";

describe("color", () => {
  it("calcula contraste WCAG", () => {
    expect(contraste("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contraste("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
    expect(contraste("#123456", "#123456")).toBe(1);
  });

  it("mezcla en los extremos", () => {
    expect(mezclar("#ff0000", "#0000ff", 0)).toBe("#ff0000");
    expect(mezclar("#ff0000", "#0000ff", 1)).toBe("#0000ff");
  });

  it("ajusta un acento hasta pasar AA sin tocarlo si ya pasa", () => {
    expect(ajustarContraste("#1f5f78", "#f4f7f9")).toBe("#1f5f78");
    const ajustado = ajustarContraste("#c8f031", "#f1f0ec");
    expect(contraste(ajustado, "#f1f0ec")).toBeGreaterThanOrEqual(AA_TEXTO);
    const sobreOscuro = ajustarContraste("#2f4bff", "#121211");
    expect(contraste(sobreOscuro, "#121211")).toBeGreaterThanOrEqual(AA_TEXTO);
  });
});

describe("paletas del registry", () => {
  for (const plantilla of PLANTILLAS) {
    const { meta } = registry[plantilla];
    for (const modo of meta.modos as readonly Modo[]) {
      const paleta = paletaDe(plantilla, modo);

      it(`${plantilla}/${modo}: texto y texto suave pasan AA sobre fondo y superficie`, () => {
        for (const fondo of [paleta.fondo, paleta.superficie]) {
          expect(contraste(paleta.texto, fondo)).toBeGreaterThanOrEqual(AA_TEXTO);
          expect(contraste(paleta.textoSuave, fondo)).toBeGreaterThanOrEqual(AA_TEXTO);
        }
      });

      it(`${plantilla}/${modo}: todo acento sugerido termina siendo legible como texto`, () => {
        for (const { hex } of meta.acentos) {
          const vars = variablesDeEstilo(plantilla, { acento: hex, esquinas: "suave", modo });
          expect(contraste(vars["--lk-acento-texto"], paleta.fondo)).toBeGreaterThanOrEqual(AA_TEXTO);
          expect(contraste(vars["--lk-acento-texto"], paleta.superficie)).toBeGreaterThanOrEqual(AA_TEXTO);
          expect(contraste(vars["--lk-sobre-acento"], vars["--lk-acento-relleno"])).toBeGreaterThanOrEqual(AA_TEXTO);
        }
      });
    }
  }

  it("los acentos sugeridos de las plantillas sobrias pasan AA sin ajuste", () => {
    for (const plantilla of ["barberia", "consultorio", "alojamiento"] as const) {
      for (const { hex } of registry[plantilla].meta.acentos) {
        expect(acentoPasaAA(plantilla, { acento: hex, esquinas: "suave" }), `${plantilla} ${hex}`).toBe(true);
      }
    }
  });
});

describe("estilo", () => {
  it("usa el modo por defecto si el pedido no está soportado", () => {
    expect(resolverModo("barberia", { modo: "claro" })).toBe("oscuro");
    expect(resolverModo("generico", { modo: "oscuro" })).toBe("oscuro");
    expect(resolverModo("generico", {})).toBe("claro");
  });

  it("genera variables para cada config de ejemplo", () => {
    for (const plantilla of PLANTILLAS) {
      const vars = variablesDeEstilo(plantilla, configsPorDefecto[plantilla].estilo);
      expect(vars["--lk-acento"]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
