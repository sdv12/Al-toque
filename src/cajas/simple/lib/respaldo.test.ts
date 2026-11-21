import { describe, expect, it } from "vitest";
import { FORMATO, VERSION_RESPALDO, leerRespaldo, necesitaRecordatorio, nombreArchivo } from "./respaldo";

const DIA = 86_400_000;
const copia = (extra: object = {}) =>
  JSON.stringify({
    formato: FORMATO,
    version: VERSION_RESPALDO,
    negocio: "Verdulería Lorenzo",
    creado: Date.UTC(2026, 10, 21, 15),
    datos: { products: [{ id: "p1" }], sales: [], customers: [], fiado: [], closes: [], stock: [] },
    meta: [["opening", { amount: 1000 }]],
    ...extra,
  });

describe("copia de seguridad de la caja", () => {
  it("el archivo lleva el negocio y la fecha de Argentina", () => {
    expect(nombreArchivo("Verdulería Lorenzo", Date.UTC(2026, 10, 21, 15))).toBe("copia-caja-verduleria-lorenzo-2026-11-21.json");
    // 1 a. m. UTC del 22 = 22 h del 21 en Argentina
    expect(nombreArchivo("", Date.UTC(2026, 10, 22, 1))).toBe("copia-caja-mi-caja-2026-11-21.json");
  });

  it("reconoce una copia buena y rechaza lo que no es", () => {
    const ok = leerRespaldo(copia());
    expect(ok.ok && ok.respaldo.datos.products).toEqual([{ id: "p1" }]);
    expect(leerRespaldo("hola").ok).toBe(false);
    expect(leerRespaldo(JSON.stringify({ formato: "otra-cosa" })).ok).toBe(false);
    const nueva = leerRespaldo(copia({ version: VERSION_RESPALDO + 1 }));
    expect(!nueva.ok && nueva.error).toMatch(/más nueva/);
    const incompleta = leerRespaldo(copia({ datos: { products: [] } }));
    expect(!incompleta.ok && incompleta.error).toMatch(/incompleta/);
  });

  it("recuerda guardar una copia a la semana, solo si hay ventas", () => {
    const ahora = Date.UTC(2026, 10, 21);
    expect(necesitaRecordatorio(undefined, undefined, ahora)).toBe(false); // sin ventas
    expect(necesitaRecordatorio(undefined, ahora - 3 * DIA, ahora)).toBe(false); // vende hace 3 días
    expect(necesitaRecordatorio(undefined, ahora - 8 * DIA, ahora)).toBe(true); // nunca guardó
    expect(necesitaRecordatorio(ahora - 2 * DIA, ahora - 30 * DIA, ahora)).toBe(false); // guardó hace 2 días
    expect(necesitaRecordatorio(ahora - 7 * DIA, ahora - 30 * DIA, ahora)).toBe(true);
  });
});
