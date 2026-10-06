import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { libreEjemplo } from "../defaults/libre";
import { EXTRAS, cotizar, esBloqueConSistema, planes } from "../lib/precios";

describe("precios", () => {
  it("una plantilla de rubro cuesta el precio de plantilla", () => {
    const c = cotizar(configsPorDefecto.barberia);
    expect(c.lineas).toHaveLength(1);
    expect(c.usaSistema).toBe(false);
    expect(c.total).toEqual({ unico: c.lineas[0]!.unico, mensual: c.lineas[0]!.mensual });
  });

  it("a tu medida cobra los bloques básicos que exceden los incluidos", () => {
    const base = cotizar({ ...libreEjemplo, secciones: libreEjemplo.secciones.slice(0, 6) });
    expect(base.lineas).toHaveLength(1);
    const con9 = cotizar(libreEjemplo); // 9 bloques básicos
    expect(con9.lineas[1]!.concepto).toBe("3 bloques extra");
    expect(con9.total.unico).toBeGreaterThan(base.total.unico);
  });

  it("los bloques desactivados no suman", () => {
    const todos = libreEjemplo.secciones.map((s) => ({ ...s, activa: false }));
    expect(cotizar({ ...libreEjemplo, secciones: todos }).lineas).toHaveLength(1);
  });

  it("un componente con sistema suma su costo y la base de datos una sola vez", () => {
    const secciones = [
      ...libreEjemplo.secciones,
      { id: "t", tipo: "turnos" as const, variante: "agenda" as const, activa: true },
      { id: "p", tipo: "pagos" as const, variante: "sena" as const, activa: true },
    ];
    const c = cotizar({ ...libreEjemplo, secciones });
    expect(c.usaSistema).toBe(true);
    expect(c.lineas.filter((l) => l.concepto === "Base de datos y servidor")).toHaveLength(1);
    expect(c.lineas.filter((l) => l.sistema && l.concepto.includes("(con sistema)"))).toHaveLength(2);
    expect(c.total.mensual).toBeGreaterThan(cotizar(libreEjemplo).total.mensual);
  });

  it("los extras suman y solo los de sistema activan la base de datos", () => {
    const conDominio = cotizar({ ...configsPorDefecto.barberia, extras: ["dominio"] });
    expect(conDominio.usaSistema).toBe(false);
    expect(conDominio.total.unico).toBe(cotizar(configsPorDefecto.barberia).total.unico + EXTRAS.dominio.unico);
    expect(cotizar({ ...configsPorDefecto.barberia, extras: ["recordatorios"] }).usaSistema).toBe(true);
  });

  it("los planes de la home salen de los mismos valores", () => {
    const [vidriera, medida, sistema] = planes();
    expect(vidriera!.unico).toBe(cotizar(configsPorDefecto.barberia).total.unico);
    expect(medida!.unico).toBe(cotizar({ ...libreEjemplo, secciones: [] }).total.unico);
    expect(sistema!.unico).toBeGreaterThan(vidriera!.unico);
  });

  it("marca qué bloques necesitan sistema", () => {
    expect(esBloqueConSistema("libre", "turnos")).toBe(true);
    expect(esBloqueConSistema("libre", "texto")).toBe(false);
    expect(esBloqueConSistema("barberia", "servicios")).toBe(false);
  });
});
