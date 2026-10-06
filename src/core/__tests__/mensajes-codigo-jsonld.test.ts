import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { libreEjemplo } from "../defaults/libre";
import { PLANTILLAS_DE_RUBRO } from "../registry";
import { barberiaDefault } from "../defaults/barberia";
import { codificarConfig, leerEntradaConfig } from "../lib/codigo";
import { jsonLdNegocio } from "../lib/jsonld";
import { formatearDuracion, formatearPrecio, linkWhatsApp, mensajeContacto, mensajeTurno } from "../lib/mensajes";
import { migrateConfig } from "../schema/migrate";

describe("mensajes", () => {
  it("formatea precios en ARS", () => {
    expect(formatearPrecio({ precio: 18000 })).toBe("$18.000");
    expect(formatearPrecio({ precio: 1400000, precioDesde: true })).toBe("desde $1.400.000");
    expect(formatearPrecio({ precio: null })).toBe("A consultar");
    expect(formatearPrecio({ precio: 0 })).toBe("Sin cargo");
  });

  it("formatea duraciones", () => {
    expect(formatearDuracion(40)).toBe("40 min");
    expect(formatearDuracion(60)).toBe("1 h");
    expect(formatearDuracion(70)).toBe("1 h 10 min");
  });

  it("arma el mensaje de turno", () => {
    const servicio = barberiaDefault.contenido.servicios!.find((s) => s.id === "corte-y-barba")!;
    const texto = mensajeTurno({
      negocio: barberiaDefault.negocio,
      servicio,
      profesional: { nombre: "Lucía Ferreyra" },
      inicio: "2026-09-30T17:15:00.000-03:00",
      cliente: { nombre: " Juan " },
      nota: "Primera vez",
    });
    expect(texto).toBe(
      [
        "Hola Barbería Güemes! Quiero reservar un turno:",
        "",
        "• Corte + barba ($26.000, 1 h 10 min)",
        "• Con Lucía Ferreyra",
        "• Miércoles 30 de septiembre a las 17:15",
        "• A nombre de Juan",
        "",
        "Nota: Primera vez",
        "",
        "¿Me lo confirman? Gracias.",
      ].join("\n"),
    );
  });

  it("suma líneas extra antes del nombre", () => {
    const servicio = barberiaDefault.contenido.servicios![0]!;
    const texto = mensajeTurno({
      negocio: { nombre: "Consultorio" },
      servicio,
      inicio: "2026-09-30T10:00:00.000-03:00",
      cliente: { nombre: "Ana" },
      extras: ["Cobertura: OSDE"],
    });
    expect(texto).toContain("• Cobertura: OSDE\n• A nombre de Ana");
  });

  it("arma el mensaje de contacto", () => {
    expect(
      mensajeContacto({ negocio: { nombre: "Taller Sur" }, nombre: " Vale ", tema: "Muebles de cocina", mensaje: " Cocina de 3 m lineales. ", zona: "Alta Córdoba" }),
    ).toBe("Hola Taller Sur! Soy Vale.\nTe escribo por: Muebles de cocina.\n\nCocina de 3 m lineales.\n\nZona: Alta Córdoba");
    expect(mensajeContacto({ negocio: { nombre: "X" }, nombre: "Ana", mensaje: "Hola" })).toBe("Hola X! Soy Ana.\n\nHola");
  });

  it("arma links wa.me codificados", () => {
    expect(linkWhatsApp("5493515550101")).toBe("https://wa.me/5493515550101");
    expect(linkWhatsApp("5493515550101", "Hola & chau\n¿sí?")).toBe("https://wa.me/5493515550101?text=Hola%20%26%20chau%0A%C2%BFs%C3%AD%3F");
  });
});

describe("código LK1", () => {
  it("ida y vuelta sin pérdida y bastante más corto que el JSON", async () => {
    for (const config of [...PLANTILLAS_DE_RUBRO.map((p) => configsPorDefecto[p]), libreEjemplo]) {
      const codigo = await codificarConfig(config);
      expect(codigo).toMatch(/^LK1\.[A-Za-z0-9_-]+$/);
      expect(codigo.length).toBeLessThan(JSON.stringify(config).length * 0.7);
      const leida = await leerEntradaConfig(`Hola! Te paso mi config: ${codigo} gracias`);
      expect(leida).toEqual({ ok: true, valor: config });
      expect(migrateConfig(leida.ok && leida.valor).ok).toBe(true);
    }
  });

  it("acepta JSON pegado y rechaza basura", async () => {
    expect(await leerEntradaConfig(' {"version":1} ')).toEqual({ ok: true, valor: { version: 1 } });
    expect((await leerEntradaConfig("hola")).ok).toBe(false);
    expect((await leerEntradaConfig("LK1.zzzz")).ok).toBe(false);
    expect((await leerEntradaConfig("{roto")).ok).toBe(false);
  });
});

describe("JSON-LD", () => {
  it("describe el negocio con su subtipo y horarios", () => {
    const ld = jsonLdNegocio(barberiaDefault, "https://ejemplo.com/l/demo-barberia");
    expect(ld).toMatchObject({
      "@type": "BarberShop",
      name: "Barbería Güemes",
      telephone: "+5493515550101",
      url: "https://ejemplo.com/l/demo-barberia",
      sameAs: ["https://instagram.com/barberiaguemes"],
      priceRange: "$12000 - $26000",
    });
    expect(ld.openingHoursSpecification).toHaveLength(5);
    expect(jsonLdNegocio(configsPorDefecto.alojamiento)["@type"]).toBe("LodgingBusiness");
  });
});
