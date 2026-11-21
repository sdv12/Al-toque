import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { libreEjemplo } from "../defaults/libre";
import { EXTRAS, ahorroWebTurnos, cotizar, esBloqueConSistema, nivelDe, niveles, sugerenciasParaPresupuesto, planAgenda, planPerfil, planes, ACTUALIZACION_PRECIOS, preciosVigentesHasta, proximaActualizacion } from "../lib/precios";

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

  it("hasta 3 bloques sin sistema ni dominio propio es Perfil digital; si suma más, pasa a Personalizado", () => {
    const perfil = cotizar({ ...libreEjemplo, secciones: libreEjemplo.secciones.slice(0, 3) });
    expect(perfil.total).toEqual({ unico: planPerfil().unico, mensual: planPerfil().mensual });
    expect(perfil.lineas[0]!.concepto).toMatch(/Perfil digital/);
    const cuatro = cotizar({ ...libreEjemplo, secciones: libreEjemplo.secciones.slice(0, 4) });
    expect(cuatro.total.unico).toBe(planes()[1]!.unico);
    const conDominio = cotizar({ ...libreEjemplo, secciones: libreEjemplo.secciones.slice(0, 3), extras: ["dominio"] });
    expect(conDominio.total.unico).toBe(planes()[1]!.unico + EXTRAS.dominio.unico);
  });

  it("los niveles van del más barato al más caro y el último se presupuesta", () => {
    const n = niveles();
    expect(n.map((x) => x.id)).toEqual(["perfil", "vidriera", "medida", "sistema", "premium"]);
    const precios = n.flatMap((x) => (x.precio ? [x.precio.unico] : []));
    expect([...precios].sort((a, b) => a - b)).toEqual(precios);
    expect(n.at(-1)!.precio).toBeNull();
  });

  it("el paquete Web + Turnos sale menos que la página y la agenda por separado", () => {
    const [vidriera, , sistema] = planes();
    expect(sistema!.unico).toBeLessThan(vidriera!.unico + planAgenda().unico);
    expect(ahorroWebTurnos().unico).toBe(vidriera!.unico + planAgenda().unico - sistema!.unico);
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
    expect(medida!.unico).toBe(cotizar({ ...libreEjemplo, secciones: libreEjemplo.secciones.slice(0, 6) }).total.unico);
    expect(sistema!.unico).toBeGreaterThan(vidriera!.unico);
  });

  it("marca qué bloques necesitan sistema", () => {
    expect(esBloqueConSistema("libre", "turnos")).toBe(true);
    expect(esBloqueConSistema("libre", "texto")).toBe(false);
    expect(esBloqueConSistema("barberia", "servicios")).toBe(false);
  });
});

describe("vigencia de los precios", () => {
  it("la próxima actualización es un primer día de trimestre", () => {
    const [, mes, dia] = ACTUALIZACION_PRECIOS.proxima.split("-").map(Number);
    expect(dia).toBe(1);
    expect([1, 4, 7, 10]).toContain(mes);
  });

  it("los precios valen hasta el día anterior, con fechas en castellano", () => {
    expect(ACTUALIZACION_PRECIOS.proxima).toBe("2027-01-01");
    expect(proximaActualizacion()).toBe("1 de enero de 2027");
    expect(preciosVigentesHasta()).toBe("31 de diciembre de 2026");
  });
});

describe("niveles y presupuesto", () => {
  it("nivelDe dice en qué nivel cae cada configuración", () => {
    expect(nivelDe({ ...libreEjemplo, secciones: libreEjemplo.secciones.slice(0, 3) }).id).toBe("perfil");
    expect(nivelDe(libreEjemplo).id).toBe("medida");
    expect(nivelDe(configsPorDefecto.barberia).id).toBe("vidriera");
    expect(nivelDe({ ...configsPorDefecto.barberia, extras: ["agenda-real"] }).id).toBe("sistema");
  });

  it("si entra en el presupuesto no sugiere nada; si se pasa, dice qué sacar y cuánto queda", () => {
    expect(sugerenciasParaPresupuesto(configsPorDefecto.barberia, "medio")).toEqual([]);
    expect(sugerenciasParaPresupuesto(configsPorDefecto.barberia, "nose")).toEqual([]);
    const caro = { ...configsPorDefecto.barberia, extras: ["agenda-real", "dominio"] as string[] };
    const s = sugerenciasParaPresupuesto(caro, "bajo");
    expect(s.some((x) => x.includes("Dominio propio"))).toBe(true);
    expect(s.some((x) => x.includes("Perfil digital"))).toBe(true);
    expect(s.at(-1)).toMatch(/en partes/);
  });
});
