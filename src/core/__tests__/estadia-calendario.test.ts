import { describe, expect, it } from "vitest";
import { alojamientoDefault } from "../defaults/alojamiento";
import { nombreMes, semanasDelMes, sumarMeses } from "../lib/calendario";
import {
  RANGO_VACIO,
  elegirDia,
  estimar,
  noches,
  nochesDelRango,
  problemasEstadia,
  salidaPosible,
} from "../lib/estadia";
import { mensajeConsulta, rangoLegible } from "../lib/mensajes";

const molle = alojamientoDefault.contenido.propiedades![0]!;
// Noches ocupadas: 17 y 18 de octubre.
const bloqueados = new Set(["2026-10-17", "2026-10-18"]);

describe("calendario", () => {
  it("arma semanas de lunes a domingo con huecos", () => {
    const octubre = semanasDelMes("2026-10"); // 1/10/2026 es jueves
    expect(octubre[0]).toEqual([null, null, null, "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"]);
    expect(octubre.at(-1)).toEqual(["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", null]);
    expect(octubre.flat().filter(Boolean)).toHaveLength(31);
    expect(semanasDelMes("2027-02").flat().filter(Boolean)).toHaveLength(28);
  });

  it("navega meses y los nombra en español", () => {
    expect(sumarMeses("2026-12", 1)).toBe("2027-01");
    expect(sumarMeses("2026-01", -1)).toBe("2025-12");
    expect(nombreMes("2026-10")).toBe("octubre 2026");
  });
});

describe("estadía: selección de rango", () => {
  it("primer toque = entrada, segundo = salida", () => {
    const a = elegirDia(RANGO_VACIO, "2026-10-10", bloqueados);
    expect(a.rango).toEqual({ desde: "2026-10-10", hasta: null });
    const b = elegirDia(a.rango, "2026-10-13", bloqueados);
    expect(b.rango).toEqual({ desde: "2026-10-10", hasta: "2026-10-13" });
    expect(noches(b.rango)).toBe(3);
  });

  it("tocar antes de la entrada la reemplaza; con rango completo, empieza de nuevo", () => {
    const r = { desde: "2026-10-10", hasta: null };
    expect(elegirDia(r, "2026-10-08", bloqueados).rango).toEqual({ desde: "2026-10-08", hasta: null });
    expect(elegirDia({ desde: "2026-10-10", hasta: "2026-10-12" }, "2026-10-20", bloqueados).rango).toEqual({ desde: "2026-10-20", hasta: null });
  });

  it("no deja cruzar noches ocupadas, pero sí salir el día que empieza una ocupación", () => {
    const r = { desde: "2026-10-15", hasta: null };
    expect(elegirDia(r, "2026-10-17", bloqueados).rango).toEqual({ desde: "2026-10-15", hasta: "2026-10-17" }); // check-out el 17
    expect(elegirDia(r, "2026-10-19", bloqueados)).toEqual({ rango: r, aviso: "noches-ocupadas" });
    expect(salidaPosible("2026-10-15", "2026-10-17", bloqueados)).toBe(true);
    expect(salidaPosible("2026-10-15", "2026-10-18", bloqueados)).toBe(false);
  });

  it("no deja entrar una noche ocupada", () => {
    expect(elegirDia(RANGO_VACIO, "2026-10-17", bloqueados)).toEqual({ rango: RANGO_VACIO, aviso: "entrada-ocupada" });
    // Pero sí entrar el día que termina la ocupación (la noche del 19 está libre).
    expect(elegirDia(RANGO_VACIO, "2026-10-19", bloqueados).rango.desde).toBe("2026-10-19");
  });

  it("cuenta noches cruzando mes", () => {
    expect(nochesDelRango("2026-10-30", "2026-11-02")).toEqual(["2026-10-30", "2026-10-31", "2026-11-01"]);
  });
});

describe("estadía: reglas y estimado", () => {
  it("exige mínimo de noches y respeta la capacidad", () => {
    expect(problemasEstadia(molle, RANGO_VACIO, 2)).toEqual([{ tipo: "faltan-fechas" }]);
    expect(problemasEstadia(molle, { desde: "2026-10-10", hasta: "2026-10-11" }, 2)).toEqual([{ tipo: "min-noches", minimo: 2 }]);
    expect(problemasEstadia(molle, { desde: "2026-10-10", hasta: "2026-10-12" }, 7)).toEqual([{ tipo: "capacidad", maximo: 6 }]);
    expect(problemasEstadia({ ...molle, maxHuespedes: 4 }, { desde: "2026-10-10", hasta: "2026-10-12" }, 5)).toEqual([{ tipo: "capacidad", maximo: 4 }]);
    expect(problemasEstadia(molle, { desde: "2026-10-10", hasta: "2026-10-12" }, 6)).toEqual([]);
  });

  it("estima total y seña", () => {
    expect(estimar(molle, { desde: "2026-10-10", hasta: "2026-10-13" })).toEqual({ noches: 3, total: 480000, sena: 144000 });
    expect(estimar({ ...molle, precioNoche: null }, { desde: "2026-10-10", hasta: "2026-10-13" })).toBeNull();
    expect(estimar(molle, RANGO_VACIO)).toBeNull();
  });

  it("arma el mensaje de consulta", () => {
    expect(rangoLegible("2026-10-15", "2026-10-18")).toBe("del jueves 15 al domingo 18 de octubre");
    expect(rangoLegible("2026-10-30", "2026-11-02")).toBe("del viernes 30 de octubre al lunes 2 de noviembre");
    const texto = mensajeConsulta({
      negocio: alojamientoDefault.negocio,
      propiedad: molle,
      desde: "2026-10-15",
      hasta: "2026-10-18",
      noches: 3,
      huespedes: 4,
      estimado: { total: 480000, sena: 144000 },
      cliente: { nombre: "Carla" },
    });
    expect(texto).toBe(
      [
        "Hola Casas del Arroyo! Quería consultar disponibilidad:",
        "",
        "• El Molle",
        "• Del jueves 15 al domingo 18 de octubre (3 noches)",
        "• 4 huéspedes",
        "• Estimado web: $480.000 (seña 30 %: $144.000)",
        "• A nombre de Carla",
        "",
        "¿Está libre? Gracias.",
      ].join("\n"),
    );
  });
});
