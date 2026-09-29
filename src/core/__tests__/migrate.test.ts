import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { aplicarMigraciones, migrateConfig, type Migraciones } from "../schema/migrate";
import { VERSION_ACTUAL } from "../schema/version";

describe("migrateConfig", () => {
  it("devuelve la config validada cuando ya está en la versión actual", () => {
    const r = migrateConfig(JSON.parse(JSON.stringify(configsPorDefecto.barberia)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.config.plantilla).toBe("barberia");
      expect(r.migradaDesde).toBeUndefined();
    }
  });

  it("devuelve errores con ruta legible en vez de lanzar", () => {
    const r = migrateConfig({ ...configsPorDefecto.consultorio, negocio: { ...configsPorDefecto.consultorio.negocio, nombre: "" } });
    expect(r).toEqual({ ok: false, errores: [{ ruta: "negocio.nombre", mensaje: "No puede quedar vacío" }] });
  });

  it.each([
    [null, "La configuración tiene que ser un objeto JSON"],
    [[], "La configuración tiene que ser un objeto JSON"],
    [{ plantilla: "barberia" }, "Falta la versión de la configuración"],
    [{ version: "1" }, "Falta la versión de la configuración"],
    [{ version: VERSION_ACTUAL + 1 }, `La configuración es de la versión ${VERSION_ACTUAL + 1}, más nueva que esta app (${VERSION_ACTUAL})`],
  ])("rechaza %j", (entrada, mensaje) => {
    const r = migrateConfig(entrada);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores[0]?.mensaje).toBe(mensaje);
  });
});

describe("aplicarMigraciones", () => {
  const lista: Migraciones = {
    1: (c) => ({ ...c, whatsappFlotante: c.botonWhatsapp ?? false }),
    2: (c) => {
      const resto = { ...c };
      delete resto.botonWhatsapp;
      return { ...resto, estilo: { esquinas: "suave", ...(c.estilo as object) } };
    },
  };

  it("encadena migraciones y actualiza la versión", () => {
    const r = aplicarMigraciones({ version: 1, botonWhatsapp: true, estilo: { acento: "#000000" } }, lista, 3);
    expect(r).toEqual({
      ok: true,
      desde: 1,
      valor: { version: 3, whatsappFlotante: true, estilo: { esquinas: "suave", acento: "#000000" } },
    });
  });

  it("arranca desde la versión intermedia", () => {
    const r = aplicarMigraciones({ version: 2, estilo: {} }, lista, 3);
    expect(r.ok && r.valor.version).toBe(3);
  });

  it("falla si falta un eslabón", () => {
    const r = aplicarMigraciones({ version: 1 }, { 2: (c) => c }, 3);
    expect(r).toEqual({ ok: false, errores: [{ ruta: "version", mensaje: "No hay migración de la versión 1 a la 2" }] });
  });

  it("no muta el objeto original", () => {
    const original = { version: 1, botonWhatsapp: true, estilo: {} };
    aplicarMigraciones(original, lista, 3);
    expect(original).toEqual({ version: 1, botonWhatsapp: true, estilo: {} });
  });
});
