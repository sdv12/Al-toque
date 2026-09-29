import { describe, expect, it } from "vitest";
import { crearDemoAdapter } from "../adapters/demo";
import { barberiaDefault } from "../defaults/barberia";
import {
  CUALQUIERA,
  crearReductorReserva,
  estadoInicial,
  ordenReserva,
  pasoActual,
  puedeAvanzar,
  reservaCompleta,
  type PasoReserva,
} from "../lib/reserva";

const ORDEN: PasoReserva[] = ["profesional", "servicio", "dia", "horario", "datos"];
const catalogo = { servicios: barberiaDefault.contenido.servicios!, equipo: barberiaDefault.contenido.equipo! };
const reducir = crearReductorReserva(catalogo);
const slot = { inicio: "2026-09-30T12:00:00.000-03:00", fin: "2026-09-30T12:40:00.000-03:00", disponible: true };

describe("reserva (reducer)", () => {
  it("arranca en el primer paso sin completar según la preselección", () => {
    expect(pasoActual(estadoInicial(catalogo, ORDEN))).toBe("profesional");
    expect(pasoActual(estadoInicial(catalogo, ORDEN, { profesionalId: "lu" }))).toBe("servicio");
    expect(pasoActual(estadoInicial(catalogo, ORDEN, { profesionalId: "lu", servicioId: "fade" }))).toBe("dia");
  });

  it("descarta preselecciones inválidas o incompatibles", () => {
    const e = estadoInicial(catalogo, ORDEN, { profesionalId: "lu", servicioId: "afeitado-navaja" });
    expect(e.servicioId).toBeNull();
    expect(estadoInicial(catalogo, ORDEN, { profesionalId: "fantasma" }).profesionalId).toBeNull();
  });

  it("omite el paso de profesional si no hay equipo", () => {
    expect(ordenReserva({ servicios: catalogo.servicios, equipo: [] }, ORDEN)).toEqual(["servicio", "dia", "horario", "datos"]);
  });

  it("no avanza sin completar el paso", () => {
    let e = estadoInicial(catalogo, ORDEN);
    expect(puedeAvanzar(e)).toBe(false);
    e = reducir(e, { tipo: "avanzar" });
    expect(pasoActual(e)).toBe("profesional");
    e = reducir(reducir(e, { tipo: "profesional", id: CUALQUIERA }), { tipo: "avanzar" });
    expect(pasoActual(e)).toBe("servicio");
  });

  it("cambiar una elección invalida las que dependen de ella", () => {
    let e = estadoInicial(catalogo, ORDEN, { profesionalId: "tano", servicioId: "afeitado-navaja" });
    e = reducir(e, { tipo: "fecha", fecha: "2026-09-30" });
    e = reducir(e, { tipo: "slot", slot });
    e = reducir(e, { tipo: "profesional", id: "lu" }); // Lu no hace afeitado a navaja
    expect(e).toMatchObject({ profesionalId: "lu", servicioId: null, fecha: null, slot: null });

    let f = estadoInicial(catalogo, ORDEN, { profesionalId: "lu", servicioId: "fade" });
    f = reducir(f, { tipo: "fecha", fecha: "2026-09-30" });
    f = reducir(f, { tipo: "slot", slot });
    f = reducir(f, { tipo: "fecha", fecha: "2026-10-01" });
    expect(f.slot).toBeNull();
    f = reducir(f, { tipo: "servicio", id: "afeitado-navaja" }); // incompatible con Lu
    expect(f).toMatchObject({ servicioId: "afeitado-navaja", profesionalId: null, fecha: null });
  });

  it("solo salta a pasos alcanzables", () => {
    let e = estadoInicial(catalogo, ORDEN);
    e = reducir(e, { tipo: "ir", paso: "datos" });
    expect(pasoActual(e)).toBe("profesional");
    e = estadoInicial(catalogo, ORDEN, { profesionalId: "lu", servicioId: "fade" });
    e = reducir(e, { tipo: "ir", paso: "profesional" });
    expect(pasoActual(e)).toBe("profesional");
  });

  it("preseleccionar desde afuera salta al primer paso pendiente y conserva el nombre", () => {
    const orden: PasoReserva[] = ["servicio", "profesional", "dia", "horario", "datos"];
    let e = estadoInicial(catalogo, orden);
    e = reducir(e, { tipo: "nombre", valor: "Ana" });
    e = reducir(e, { tipo: "preseleccionar", pre: { servicioId: "afeitado-navaja" } });
    expect(pasoActual(e)).toBe("profesional");
    expect(e).toMatchObject({ servicioId: "afeitado-navaja", nombre: "Ana" });
    e = reducir(e, { tipo: "preseleccionar", pre: { servicioId: "fade", profesionalId: "lu" } });
    expect(pasoActual(e)).toBe("dia");
  });

  it("queda completa con todo elegido y nombre de al menos 2 letras", () => {
    let e = estadoInicial(catalogo, ORDEN, { profesionalId: "lu", servicioId: "fade" });
    e = reducir(e, { tipo: "fecha", fecha: "2026-09-30" });
    e = reducir(e, { tipo: "slot", slot });
    e = reducir(e, { tipo: "nombre", valor: " J " });
    expect(reservaCompleta(e)).toBe(false);
    e = reducir(e, { tipo: "nombre", valor: "Juan" });
    expect(reservaCompleta(e)).toBe(true);
  });
});

describe("DemoAdapter", () => {
  const ahora = () => new Date("2026-09-29T11:00:00Z");
  const nuevo = () => crearDemoAdapter({ ...barberiaDefault, demo: true }, { ahora });

  it("es determinista: mismos datos → mismos horarios", async () => {
    const q = { servicioId: "corte", profesionalId: "tano", fecha: "2026-09-30" };
    expect(await nuevo().getHorariosDisponibles(q)).toEqual(await nuevo().getHorariosDisponibles(q));
  });

  it("ocupa parte de los horarios, no todos", async () => {
    const slots = await nuevo().getHorariosDisponibles({ servicioId: "corte", profesionalId: "tano", fecha: "2026-09-30" });
    const libres = slots.filter((s) => s.disponible).length;
    expect(slots.length).toBeGreaterThan(20);
    expect(libres).toBeGreaterThan(slots.length * 0.4);
    expect(libres).toBeLessThan(slots.length);
  });

  it("sin preferencia asigna un profesional libre que hace el servicio", async () => {
    const slots = await nuevo().getHorariosDisponibles({ servicioId: "fade", fecha: "2026-09-30" });
    const libres = slots.filter((s) => s.disponible);
    expect(libres.length).toBeGreaterThan(0);
    for (const s of libres) expect(["tano", "lu", "nico"]).toContain(s.profesionalId);
    // Antes de las 12 Lu no trabaja: esos horarios no se le asignan.
    for (const s of libres.filter((s) => s.inicio < "2026-09-30T12")) expect(s.profesionalId).not.toBe("lu");
  });

  it("un turno creado ocupa el horario y no se puede duplicar", async () => {
    const a = nuevo();
    const q = { servicioId: "corte", profesionalId: "tano", fecha: "2026-09-30" };
    const libre = (await a.getHorariosDisponibles(q)).find((s) => s.disponible)!;
    const turno = { servicioId: "corte", profesionalId: "tano", inicio: libre.inicio, cliente: { nombre: "Juan" } };
    const r1 = await a.crearTurno(turno);
    expect(r1.ok).toBe(true);
    const r2 = await a.crearTurno(turno);
    expect(r2).toEqual({ ok: false, error: "Ese horario ya no está disponible. Elegí otro." });
    const despues = (await a.getHorariosDisponibles(q)).find((s) => s.inicio === libre.inicio)!;
    expect(despues.disponible).toBe(false);
  });

  it("sin flag demo no simula nada: todo lo de la agenda está libre", async () => {
    const real = crearDemoAdapter(barberiaDefault, { ahora });
    const slots = await real.getHorariosDisponibles({ servicioId: "corte", profesionalId: "tano", fecha: "2026-09-30" });
    expect(slots.length).toBeGreaterThan(20);
    expect(slots.every((s) => s.disponible)).toBe(true);
    expect(await real.getDiasBloqueados({ propiedadId: "el-molle", desde: "2026-10-01", hasta: "2026-12-31" })).toEqual([]);
  });

  it("bloquea noches de forma determinista y en tandas", async () => {
    const dias = await nuevo().getDiasBloqueados({ propiedadId: "el-molle", desde: "2026-10-01", hasta: "2026-12-31" });
    expect(dias.length).toBeGreaterThan(5);
    expect(dias.length).toBeLessThan(50);
    expect(await nuevo().getDiasBloqueados({ propiedadId: "el-molle", desde: "2026-11-01", hasta: "2026-11-30" })).toEqual(
      dias.filter((d) => d.startsWith("2026-11")),
    );
  });
});
