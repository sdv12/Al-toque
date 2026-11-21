import { describe, expect, it } from "vitest";
import { decodificarDemo } from "@/agendas/lib/demo";
import { cajaDesdeQuery } from "@/cajas/config";
import { cotizar, planAgenda, planCajaPro } from "@/core/lib/precios";
import { migrateConfig } from "@/core/schema/migrate";
import { formatearPesos } from "@/core/lib/mensajes";
import { COMENTARIO_RUBRO, CONSEJO, DIFICULTADES, RUBROS, coloresPara, funcionesSugeridas, recomendar, resumenRespuestas, type Respuestas } from "./alto";
import { DUDAS, buscarDuda } from "./dudas";
import { PREGUNTAS, preguntasPara, respuestaEnTexto, validarWhatsapp } from "./preguntas";

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
    const r = recomendar(respuestas({ rubro: rubro("estetica"), funciones: ["turnos"], prioridad: "turnos" }));
    expect(r.productos.map((p) => p.id)).toEqual(["agenda"]);
    expect(r.total).toEqual(planAgenda());
    const href = r.productos[0]!.accion.href;
    expect(href).toMatch(/^\/turnos\?demo=.+#\/probar$/);
    const demo = decodificarDemo(href.slice("/turnos?demo=".length, href.indexOf("#")));
    expect(demo.negocio).toMatchObject({ nombre: "Lo de Ana", profesion: "unas" });
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

describe("Alto: preguntas nuevas", () => {
  const ids = (r: Parameters<typeof preguntasPara>[0]) => preguntasPara(r).map((p) => p.id);

  it("Instagram y página actual solo si dijo que lo encuentran ahí", () => {
    expect(ids({ presencia: ["boca"] })).not.toContain("instagram");
    expect(ids({ presencia: ["boca"] })).not.toContain("webActual");
    expect(ids({ presencia: ["instagram", "web"] })).toEqual(expect.arrayContaining(["instagram", "webActual"]));
  });

  it("el usuario de Instagram se guarda con @, venga como venga", () => {
    const p = PREGUNTAS.find((x) => x.id === "instagram")!;
    if (p.tipo !== "texto") throw new Error();
    expect(p.guardar("https://www.instagram.com/lo.de.ana/", {})).toEqual({ instagram: "@lo.de.ana" });
    expect(p.guardar("@lo.de.ana", {})).toEqual({ instagram: "@lo.de.ana" });
    expect(p.guardar(null, {})).toEqual({ instagram: undefined });
  });

  it("reacciona al rubro y da un consejo por la dificultad", () => {
    const modalidad = PREGUNTAS.find((x) => x.id === "modalidad")!;
    expect(modalidad.texto({ rubro: rubro("gastronomia") }).join(" ")).toMatch(/menú/i);
    const prioridad = PREGUNTAS.find((x) => x.id === "prioridad")!;
    for (const d of Object.keys(DIFICULTADES) as (keyof typeof DIFICULTADES)[]) expect(prioridad.texto({ dificultades: [d] })[0]).toContain(CONSEJO[d]);
  });

  it("todos los rubros tienen comentario y todas las opciones nuevas tienen etiqueta", () => {
    for (const x of RUBROS.filter((x) => x.id !== "otro")) expect(COMENTARIO_RUBRO[x.id], x.id).toBeTruthy();
  });

  it("dificultades nuevas sugieren lo que corresponde", () => {
    expect(funcionesSugeridas({ ...respuestas({ rubro: rubro("otro") }), dificultades: ["redes"] })).toContain("instagram");
    expect(funcionesSugeridas({ ...respuestas({ rubro: rubro("construccion") }), dificultades: ["presupuestos"] })).toContain("contacto");
  });

  it("si el total pasa el presupuesto, propone arrancar por partes; tienda e idiomas van aparte", () => {
    const rec = recomendar(respuestas({ rubro: rubro("almacen"), presupuesto: "bajo", funciones: ["web", "turnos", "cajaPro", "tienda", "idiomas"] }));
    expect(rec.aparte.join(" ")).toMatch(/arrancar por|en partes/);
    expect(rec.aparte.join(" ")).toMatch(/tienda/i);
    expect(rec.aparte.join(" ")).toMatch(/idioma/i);
  });

  it("el resumen lleva los datos nuevos y los globos salteados se leen bien", () => {
    const r = respuestas({ rubro: rubro("otro"), modalidad: "domicilio", horario: "finde", instagram: "@ana", webActual: "ana.com.ar", presupuesto: "medio", conocio: "google" });
    const txt = resumenRespuestas(r).join("\n");
    for (const x of ["A domicilio", "fines de semana", "@ana", "ana.com.ar", "$250.000", "Google"]) expect(txt).toContain(x);
    const presupuesto = PREGUNTAS.find((x) => x.id === "presupuesto")!;
    expect(respuestaEnTexto(presupuesto, {})).toBe("Prefiero no decirlo");
  });
});

describe("Alto: dudas", () => {
  it.each([
    ["cuanto me sale todo esto?", "precio"],
    ["me puedo dar de baja cuando quiera?", "baja"],
    ["qué es un dominio", "dominio"],
    ["hacen factura electrónica de AFIP?", "factura"],
    ["Se ve en el CELULAR?", "celular"],
    ["tengo 10 días para arrepentirme?", "arrepentimiento"],
  ])("«%s» → %s", (texto, id) => {
    expect(buscarDuda(texto)?.id).toBe(id);
  });

  it("si no entiende, no inventa", () => {
    expect(buscarDuda("hola qué tal")).toBeNull();
  });

  it("todas tienen respuesta y el precio sale de precios.ts", () => {
    for (const d of DUDAS) expect(d.respuesta().length, d.id).toBeGreaterThan(0);
    expect(DUDAS.find((d) => d.id === "precio")!.respuesta().join(" ")).toContain(formatearPesos(planCajaPro().unico));
  });
});

describe("Al Toque no ofrece rubros de salud (van por Sala de Espera)", () => {
  it("Alto no los lista ni usa la plantilla de consultorio", () => {
    for (const r of RUBROS) expect(r.plantilla, r.id).not.toBe("consultorio");
    expect(RUBROS.map((r) => r.nombre).join(" ")).not.toMatch(/salud|consultorio|psicolog|odontolog|nutrici|kinesio/i);
  });
});
