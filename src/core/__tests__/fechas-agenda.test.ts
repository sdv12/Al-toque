import { describe, expect, it } from "vitest";
import { barberiaDefault } from "../defaults/barberia";
import { AGENDA_POR_DEFECTO, diasConAtencion, franjasDelDia, iniciosDelDia, profesionalesPara, serviciosPara } from "../lib/agenda";
import { diaSemana, diasEntre, etiquetaDia, fechaISO, horaDe, instante, instanteISO, sumarDias } from "../lib/fechas";

// Martes 29/09/2026, 08:00 en Córdoba (11:00 UTC).
const AHORA = new Date("2026-09-29T11:00:00Z");
const agenda = barberiaDefault.agenda!;
const equipo = barberiaDefault.contenido.equipo!;
const servicios = barberiaDefault.contenido.servicios!;
const lu = equipo.find((p) => p.id === "lu")!;

describe("fechas (zona Córdoba)", () => {
  it("interpreta fechas y horas en Córdoba, no en la zona del proceso", () => {
    expect(instanteISO(instante("2026-09-30", "10:00"))).toBe("2026-09-30T10:00:00.000-03:00");
    expect(instante("2026-09-30", "10:00").toISOString()).toBe("2026-09-30T10:00:00.000-03:00");
    expect(new Date(instante("2026-09-30", "10:00")).toJSON()).toBe("2026-09-30T13:00:00.000Z");
  });

  it("calcula la fecha local aunque en UTC ya sea otro día", () => {
    // 23:30 del 29 en Córdoba = 02:30 del 30 en UTC.
    expect(fechaISO(new Date("2026-09-30T02:30:00Z"))).toBe("2026-09-29");
  });

  it("suma días cruzando mes y año", () => {
    expect(sumarDias("2026-09-29", 3)).toBe("2026-10-02");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(diasEntre("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("día de la semana y etiquetas en español", () => {
    expect(diaSemana("2026-09-29")).toBe(2);
    expect(etiquetaDia("2026-09-29")).toEqual({ semanaCorta: "mar", numero: "29", mesCorto: "sep", larga: "martes 29 de septiembre" });
    expect(horaDe("2026-09-29T17:15:00.000-03:00")).toBe("17:15");
  });
});

describe("agenda", () => {
  it("usa la agenda propia del profesional cuando la tiene", () => {
    expect(franjasDelDia(agenda, undefined, "2026-09-29")).toEqual([{ desde: "10:00", hasta: "20:00" }]);
    expect(franjasDelDia(agenda, lu, "2026-09-29")).toEqual([]); // Lu no trabaja los martes
    expect(franjasDelDia(agenda, lu, "2026-09-30")).toEqual([{ desde: "12:00", hasta: "20:00" }]);
  });

  it("lista solo días con atención", () => {
    const dias = diasConAtencion({ agenda, profesionales: [], desde: "2026-09-27", cantidad: 7 });
    // Dom 27 y lun 28 cerrado; mar 29 a sáb 3 abierto.
    expect(dias).toEqual(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03"]);
    expect(diasConAtencion({ agenda, profesionales: [lu], desde: "2026-09-27", cantidad: 7 })).toEqual([
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
    ]);
  });

  it("genera inicios donde el servicio entra completo", () => {
    const inicios = iniciosDelDia({ agenda, fecha: "2026-09-30", duracionMin: 70, ahora: AHORA }).map((d) => horaDe(d.toISOString()));
    expect(inicios[0]).toBe("10:00");
    expect(inicios.at(-1)).toBe("18:45"); // 18:45 + 70 min = 19:55 ≤ 20:00
    expect(inicios).not.toContain("19:00");
    expect(inicios).toHaveLength(36);
  });

  it("respeta la anticipación mínima", () => {
    // Hoy 29/09 a las 08:00, anticipación 2 h: el primero posible es 10:00.
    const hoy = iniciosDelDia({ agenda, fecha: "2026-09-29", duracionMin: 40, ahora: new Date("2026-09-29T13:10:00Z") });
    // 10:10 + 2 h = 12:10 → el primero es 12:15.
    expect(horaDe(hoy[0]!.toISOString())).toBe("12:15");
  });

  it("maneja varias franjas por día", () => {
    const partida = { ...AGENDA_POR_DEFECTO, dias: [{ dia: 3, franjas: [{ desde: "09:00", hasta: "10:00" }, { desde: "15:00", hasta: "16:00" }] }] };
    const inicios = iniciosDelDia({ agenda: partida, fecha: "2026-09-30", duracionMin: 30, ahora: AHORA }).map((d) => horaDe(d.toISOString()));
    expect(inicios).toEqual(["09:00", "09:30", "15:00", "15:30"]);
  });

  it("filtra servicios y profesionales compatibles", () => {
    const navaja = servicios.find((s) => s.id === "afeitado-navaja")!;
    expect(profesionalesPara(navaja, equipo).map((p) => p.id)).toEqual(["tano"]);
    expect(profesionalesPara(servicios[0], equipo)).toHaveLength(3);
    expect(serviciosPara("lu", servicios).map((s) => s.id)).not.toContain("afeitado-navaja");
    expect(serviciosPara("tano", servicios)).toHaveLength(servicios.length);
  });
});
