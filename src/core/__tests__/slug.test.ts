import { describe, expect, it } from "vitest";
import { SLUG_VALIDO, slugDe } from "../lib/slug";

describe("slugDe", () => {
  it.each([
    ["Barbería Güemes", "barberia-guemes"],
    ["Consultorio Dra. Paula Ferreyra", "consultorio-dra-paula-ferreyra"],
    ["  Casas del Arroyo!! ", "casas-del-arroyo"],
    ["Ñandú & Cía", "nandu-cia"],
    ["", "mi-negocio"],
    ["¡¡¡", "mi-negocio"],
  ])("%j → %s", (nombre, esperado) => {
    expect(slugDe(nombre)).toBe(esperado);
    expect(slugDe(nombre)).toMatch(SLUG_VALIDO);
  });

  it("corta en 48 caracteres sin dejar guion al final", () => {
    const s = slugDe("Un nombre larguísimo de negocio que no entra en la dirección web");
    expect(s.length).toBeLessThanOrEqual(48);
    expect(s).toMatch(SLUG_VALIDO);
  });
});
