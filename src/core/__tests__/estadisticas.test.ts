import { describe, expect, it } from "vitest";
import { juntar, lunesDe, normalizarEvento, normalizarPagina, semanaVacia, sumarEvento, ultimasSemanas } from "../lib/estadisticas";

describe("estadísticas de pedidos", () => {
  it("las páginas se normalizan contra una lista cerrada (nada raro se guarda tal cual)", () => {
    expect(normalizarPagina("/web?x=1#precios")).toBe("/web");
    expect(normalizarPagina("/turnos/")).toBe("/turnos");
    expect(normalizarPagina("/l/demo-barberia")).toBe("/l (demos de páginas)");
    expect(normalizarPagina("/c/demo-verduleria")).toBe("/c (demos de caja)");
    expect(normalizarPagina("/<script>alert(1)</script>")).toBe("otra");
    expect(normalizarPagina(42)).toBe("otra");
  });

  it("un evento sin tipo válido no cuenta; un nivel desconocido cuenta como otro", () => {
    expect(normalizarEvento({ tipo: "Hackeo", entrada: "/" })).toBeNull();
    expect(normalizarEvento(null)).toBeNull();
    expect(normalizarEvento({ tipo: "Landing", entrada: "/web", pagina: "/configurador", nivel: "perfil" })).toEqual({
      tipo: "Landing",
      entrada: "/web",
      pagina: "/configurador",
      nivel: "perfil",
    });
    expect(normalizarEvento({ tipo: "Caja", nivel: "gratis" })!.nivel).toBe("otro");
  });

  it("la semana arranca el lunes, en hora de Argentina", () => {
    expect(lunesDe(new Date("2026-11-21T15:00:00Z"))).toBe("2026-11-16"); // sábado
    expect(lunesDe(new Date("2026-11-16T02:00:00Z"))).toBe("2026-11-09"); // lunes 2 UTC = domingo 23 en Argentina
    expect(lunesDe(new Date("2026-11-16T03:00:00Z"))).toBe("2026-11-16");
  });

  it("suma eventos y arma las últimas semanas con ceros donde no hubo nada", () => {
    const e = normalizarEvento({ tipo: "Consulta", entrada: "/", pagina: "/web", nivel: "vidriera" })!;
    const s = sumarEvento(sumarEvento(semanaVacia("2026-11-16"), e), e);
    expect(s).toMatchObject({ total: 2, tipo: { Consulta: 2 }, entrada: { "/": 2 }, nivel: { vidriera: 2 } });
    const ult = ultimasSemanas([s], new Date("2026-11-21T15:00:00Z"), 3);
    expect(ult.map((x) => [x.semana, x.total])).toEqual([
      ["2026-11-16", 2],
      ["2026-11-09", 0],
      ["2026-11-02", 0],
    ]);
    expect(juntar([s, s]).tipo.Consulta).toBe(4);
  });
});
