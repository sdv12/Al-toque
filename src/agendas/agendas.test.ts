import { describe, expect, it } from "vitest";
import { DISENOS } from "./lib/disenos";
import { aMin, desdeISO, hoyISO, horariosLibres, proximosDias, sumarDias } from "./lib/fechas";
import { ID_PROFESIONES, PROFESIONES } from "./lib/profesiones";
import { semilla } from "./lib/store";
import type { Negocio, Turno } from "./lib/tipos";

/** Un día de la semana que viene que sea `dow` (0 = domingo), para no depender de la hora actual. */
function proximo(dow: number): string {
  let f = sumarDias(hoyISO(), 7);
  while (desdeISO(f).getDay() !== dow) f = sumarDias(f, 1);
  return f;
}

const negocio = (extra: Partial<Negocio> = {}): Negocio => ({
  ...semilla("peluqueria").negocio,
  horarios: { 0: [], 1: [["09:00", "12:00"]], 2: [], 3: [], 4: [], 5: [], 6: [] },
  intervalo: 30,
  anticipacion: 0,
  ...extra,
});

const turno = (fecha: string, hora: string, duracion: number, estado: Turno["estado"] = "confirmado"): Turno => ({
  id: hora, servicioId: "s0", fecha, hora, duracion, precio: 0, clienteId: "c0", estado, origen: "web", creado: fecha, pago: null, notas: "",
});

describe("horarios libres", () => {
  const lunes = proximo(1);

  it("arma los turnos según la franja, el intervalo y la duración", () => {
    expect(horariosLibres(negocio(), [], [], lunes, 60)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
  });

  it("no ofrece horarios que se pisan con turnos o bloqueos (los cancelados liberan)", () => {
    const turnos = [turno(lunes, "09:30", 30), turno(lunes, "11:00", 60, "cancelado")];
    const bloqueos = [{ id: "b", fecha: lunes, desde: "10:30", hasta: "11:00" }];
    expect(horariosLibres(negocio(), turnos, bloqueos, lunes, 30)).toEqual(["09:00", "10:00", "11:00", "11:30"]);
  });

  it("los días sin franjas no tienen horarios y no aparecen en los próximos días", () => {
    expect(horariosLibres(negocio(), [], [], proximo(2), 30)).toEqual([]);
    expect(proximosDias(negocio(), 5).every((f) => desdeISO(f).getDay() === 1)).toBe(true);
  });
});

describe("datos de ejemplo", () => {
  it.each(ID_PROFESIONES)("%s: servicios del rubro y turnos que no se pisan", (p) => {
    const db = semilla(p);
    expect(db.servicios.length).toBe(PROFESIONES[p].servicios.length);
    expect(db.negocio.nombre).toBe(PROFESIONES[p].demo);
    const porDia = new Map<string, [number, number][]>();
    for (const t of db.turnos.filter((x) => x.estado !== "cancelado")) {
      const ocupado = porDia.get(t.fecha) ?? [];
      const ini = aMin(t.hora);
      expect(ocupado.some(([a, b]) => ini < b && ini + t.duracion > a)).toBe(false);
      porDia.set(t.fecha, [...ocupado, [ini, ini + t.duracion]]);
    }
    // Lo cobrado en los turnos atendidos coincide con los ingresos de la caja.
    const cobrado = db.turnos.reduce((s, t) => s + (t.pago?.monto ?? 0), 0);
    const ingresos = db.movimientos.filter((m) => m.tipo === "ingreso" && m.turnoId).reduce((s, m) => s + m.monto, 0);
    expect(ingresos).toBe(cobrado);
  });

  it("con los datos del usuario, los ejemplos usan sus servicios", () => {
    const servicios = [{ id: "x", nombre: "Mi servicio", duracion: 30, precio: 1000, activo: true }];
    const db = semilla("nutricion", { negocio: { nombre: "Mi Negocio" }, servicios });
    expect(db.negocio.nombre).toBe("Mi Negocio");
    expect(db.turnos.every((t) => t.servicioId === "x")).toBe(true);
  });
});

it("nueve diseños, sin el de chat (el chat del kit es Alto)", () => {
  expect(DISENOS.map((d) => d.id)).not.toContain("chat");
  expect(DISENOS).toHaveLength(9);
});
