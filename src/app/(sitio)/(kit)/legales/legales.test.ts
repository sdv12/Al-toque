import { describe, expect, it } from "vitest";
import { LEYENDA_AAIP, PENDIENTE, TITULAR, faltanDatos } from "./datos";
import { codigoSolicitud } from "./codigo";

describe("Legales", () => {
  it("el código de arrepentimiento y de baja se distingue y no se repite", () => {
    expect(codigoSolicitud("arrepentimiento")).toMatch(/^ARR-[0-9A-Z]+-[0-9A-Z]{3}$/);
    expect(codigoSolicitud("baja")).toMatch(/^BAJ-/);
    const muchos = new Set(Array.from({ length: 200 }, () => codigoSolicitud("baja", 1)));
    expect(muchos.size).toBeGreaterThan(150);
  });

  it("la leyenda de la AAIP está completa (Res. AAIP 14/2018)", () => {
    expect(LEYENDA_AAIP).toMatch(/Agencia de Acceso a la Información Pública/);
    expect(LEYENDA_AAIP).toMatch(/25\.326/);
  });

  it("faltanDatos lista justo los campos del titular sin completar", () => {
    const pendientes = Object.entries(TITULAR).filter(([, v]) => typeof v === "string" && v.startsWith(PENDIENTE));
    expect(faltanDatos()).toHaveLength(pendientes.length);
  });
});
