import { describe, expect, it } from "vitest";
import { decodificarDemo } from "@/agendas/lib/demo";
import { cajaDesdeQuery } from "@/cajas/config";
import { cotizar, planAgenda, planCajaPro } from "@/core/lib/precios";
import { migrateConfig } from "@/core/schema/migrate";
import { RUBROS, coloresPara, funcionesSugeridas, recomendar, type Respuestas } from "./alto";

const rubro = (id: string) => RUBROS.find((r) => r.id === id)!;

function respuestas(extra: Partial<Respuestas> & Pick<Respuestas, "rubro">): Respuestas {
  return { nombre: "Lo de Ana", dificultades: [], prioridad: "todo", zona: "barrio", color: null, funciones: [], ...extra };
}

describe("Alto: lo que sugiere marcar", () => {
  it("si contesta mensajes para dar turnos y la gente falta → turnos y recordatorios", () => {
    const f = funcionesSugeridas({ ...respuestas({ rubro: rubro("barberia") }), dificultades: ["mensajes", "ausencias"], prioridad: "turnos" });
    expect(f).toEqual(expect.arrayContaining(["turnos", "recordatorios"]));
  });

  it("factura o stock → caja pro, y nunca caja simple y pro juntas", () => {
    const f = funcionesSugeridas({ ...respuestas({ rubro: rubro("almacen") }), dificultades: ["caja", "factura"], prioridad: "ventas" });
    expect(f).toContain("cajaPro");
    expect(f).not.toContain("cajaSimple");
  });

  it("la zona suma lo que ayuda a llegar (barrio → mapa; ciudad → dominio), solo si hay página", () => {
    expect(funcionesSugeridas({ ...respuestas({ rubro: rubro("otro"), zona: "barrio" }) })).toContain("mapa");
    expect(funcionesSugeridas({ ...respuestas({ rubro: rubro("otro"), zona: "ciudad" }) })).toContain("dominio");
    const kiosco = funcionesSugeridas({ ...respuestas({ rubro: rubro("kiosco"), zona: "barrio", prioridad: "ventas" }), dificultades: ["caja"] });
    expect(kiosco).toEqual(["cajaSimple"]);
  });
});

describe("Alto: recomendación", () => {
  it("página con turnos: un solo precio (la agenda va dentro de la página, no se cobra dos veces)", () => {
    const r = recomendar(respuestas({ rubro: rubro("barberia"), funciones: ["web", "turnos"], prioridad: "turnos" }));
    expect(r.productos.map((p) => p.id)).toEqual(["landing", "agenda"]);
    const agenda = r.productos.find((p) => p.id === "agenda")!;
    expect(agenda.precio).toEqual({ unico: 0, mensual: 0 });
    expect(r.total).toEqual(cotizar(r.borrador!).total);
    expect(r.borrador!.extras).toContain("agenda-real");
  });

  it("solo turnos: la agenda con su precio propio y el link de prueba con el nombre y el rubro", () => {
    const r = recomendar(respuestas({ rubro: rubro("salud"), funciones: ["turnos"], prioridad: "turnos" }));
    expect(r.productos.map((p) => p.id)).toEqual(["agenda"]);
    expect(r.total).toEqual(planAgenda());
    const href = r.productos[0]!.accion.href;
    expect(href).toMatch(/^\/turnos\?demo=.+#\/probar$/);
    const demo = decodificarDemo(href.slice("/turnos?demo=".length, href.indexOf("#")));
    expect(demo.negocio).toMatchObject({ nombre: "Lo de Ana", profesion: "consultorio" });
  });

  it("caja simple precargada con rubro, nombre y color", () => {
    const r = recomendar(respuestas({ rubro: rubro("kiosco"), funciones: ["cajaSimple"], prioridad: "ventas", color: coloresPara(rubro("kiosco"))[1]! }));
    const caja = r.productos.find((p) => p.id === "cajaSimple")!;
    expect(cajaDesdeQuery(caja.accion.href.slice("/caja".length))).toMatchObject({ rubro: "kiosco", negocio: { nombre: "Lo de Ana" }, color: "azul" });
  });

  it("caja pro: precio de la pro y primero si lo que urge son las ventas", () => {
    const r = recomendar(respuestas({ rubro: rubro("comercio"), funciones: ["cajaPro", "web"], prioridad: "ventas", dificultades: ["factura"] }));
    expect(r.productos[0]!.id).toBe("cajaPro");
    expect(r.productos[0]!.precio).toEqual({ unico: planCajaPro().unico, mensual: planCajaPro().mensual });
  });

  it("si no marca nada, al menos la página", () => {
    expect(recomendar(respuestas({ rubro: rubro("otro") })).productos.map((p) => p.id)).toEqual(["landing"]);
  });

  it.each(RUBROS.map((x) => x.id))("el borrador del configurador para %s es una configuración válida", (id) => {
    const color = coloresPara(rubro(id))[0]!;
    const r = recomendar(respuestas({ rubro: rubro(id), funciones: ["web", "turnos", "recordatorios", "dominio", "panel"], color }));
    const v = migrateConfig(r.borrador);
    expect(v.ok ? [] : v.errores).toEqual([]);
    expect(r.borrador!.negocio.nombre).toBe("Lo de Ana");
  });
});
