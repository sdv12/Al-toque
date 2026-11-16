import { describe, expect, it } from "vitest";
import { decodificarDemo } from "@/agendas/lib/demo";
import { cajaDesdeQuery } from "@/cajas/config";
import { cotizar, planAgenda, planCajaPro } from "@/core/lib/precios";
import { migrateConfig } from "@/core/schema/migrate";
import { RUBROS, coloresPara, funcionesSugeridas, recomendar, resumenRespuestas, type Respuestas } from "./alto";
import { preguntasPara, respuestaEnTexto, validarWhatsapp } from "./preguntas";

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

describe("Alto: guion completo", () => {
  const base = { nombre: "Lo de Ana", rubro: rubro("barberia"), dificultades: [], prioridad: "todo" as const, zona: "barrio" as const };

  it("las preguntas de detalle aparecen según lo que eligió", () => {
    const ids = (funciones: Respuestas["funciones"]) => preguntasPara({ ...base, funciones }).map((p) => p.id);
    expect(ids(["turnos"])).toEqual(expect.arrayContaining(["equipo", "servicios"]));
    expect(ids(["turnos"])).not.toContain("productos");
    expect(ids(["turnos"])).not.toContain("logo");
    expect(ids(["cajaPro"])).toEqual(expect.arrayContaining(["productos", "cobros", "sucursales", "equipo"]));
    expect(ids(["web"])).toEqual(expect.arrayContaining(["logo", "fotos", "dominio", "color"]));
    // Siempre: dónde lo encuentran, para cuándo y cómo contactarlo.
    for (const f of [["turnos"], ["cajaSimple"], ["web"]] as Respuestas["funciones"][]) {
      expect(ids(f)).toEqual(expect.arrayContaining(["presencia", "plazo", "contacto", "whatsapp", "comentario"]));
    }
  });

  it("valida el WhatsApp y lo deja en formato 549…", () => {
    expect(validarWhatsapp("351 555-1234")).toEqual({ ok: true, numero: "5493515551234" });
    expect(validarWhatsapp("123").ok).toBe(false);
  });

  it("sucursales extra suman al mensual de la caja pro; si ya tiene dominio, no se cobra", () => {
    const pro = recomendar(respuestas({ rubro: rubro("comercio"), funciones: ["cajaPro"], sucursales: "dos" })).productos[0]!;
    expect(pro.precio.mensual).toBe(planCajaPro().mensual + planCajaPro().sucursalExtra);
    const conDominio = recomendar(respuestas({ rubro: rubro("barberia"), funciones: ["web", "dominio"], dominio: "tiene" }));
    expect(conDominio.borrador!.extras ?? []).not.toContain("dominio");
    const quiereDominio = recomendar(respuestas({ rubro: rubro("barberia"), funciones: ["web"], dominio: "quiere" }));
    expect(quiereDominio.borrador!.extras).toContain("dominio");
  });

  it("el pedido lleva todo lo que contó (contacto, detalles y comentario)", () => {
    const lineas = resumenRespuestas(
      respuestas({ rubro: rubro("barberia"), funciones: ["turnos"], equipo: "chico", servicios: "varios", plazo: "ya", contacto: "Ana", whatsapp: "5493515551234", comentario: "Me gusta tal página" }),
    );
    expect(lineas).toEqual(expect.arrayContaining(["Equipo: 2 o 3", "Servicios: De 6 a 15", "Para cuándo: Lo antes posible", "Contacto: Ana · 5493515551234", "Comentario: Me gusta tal página"]));
  });

  it("el globo de cada respuesta se lee bien", () => {
    const r = { ...base, rubroOtro: "Florería", funciones: ["web", "turnos"] as Respuestas["funciones"], whatsapp: "5493515551234" };
    const p = (id: string) => preguntasPara(r).find((x) => x.id === id)!;
    expect(respuestaEnTexto(p("rubro"), r)).toBe("Otro: Florería");
    expect(respuestaEnTexto(p("funciones"), r)).toBe("Página web · Turnos online");
    expect(respuestaEnTexto(p("whatsapp"), r)).toBe("+5493515551234");
  });
});
