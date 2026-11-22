import { describe, expect, it } from "vitest";
import { decodificarDemo } from "@/agendas/lib/demo";
import { linkDemo, mensajeDemo } from "./demos-mandar";

describe("mandar una demo", () => {
  it("la página web arranca con la plantilla del rubro y el nombre del negocio", () => {
    expect(linkDemo("web", "barberia", "Lo de Juan")).toBe("/configurador?plantilla=barberia&nombre=Lo+de+Juan");
    expect(linkDemo("web", "alojamiento", "")).toBe("/configurador?plantilla=alojamiento");
  });

  it("turnos y caja solo para los rubros que los usan, con el nombre adentro", () => {
    const turnos = linkDemo("turnos", "barberia", "Lo de Juan")!;
    expect(turnos).toMatch(/^\/turnos\/demo\?demo=.+#\/$/);
    expect(decodificarDemo(turnos.slice("/turnos/demo?demo=".length, turnos.indexOf("#"))).negocio).toMatchObject({ nombre: "Lo de Juan" });
    expect(linkDemo("caja", "verduleria", "Lo de Juan")).toBe("/caja?rubro=verduleria&nombre=Lo+de+Juan");
    expect(linkDemo("caja", "alojamiento", "x")).toBeNull();
    expect(linkDemo("turnos", "verduleria", "x")).toBeNull();
    expect(linkDemo("resto", "gastronomia", "La Birra", "bar")).toBe("/resto/demo?tipo=bar&nombre=La+Birra");
    expect(linkDemo("resto", "barberia", "x")).toBeNull();
  });

  it("el mensaje lleva el link y el nombre", () => {
    const m = mensajeDemo("turnos", "Lo de Juan", "https://altoque-cba.com.ar/turnos/demo");
    expect(m).toContain("agenda de turnos online para Lo de Juan");
    expect(m).toContain("https://altoque-cba.com.ar/turnos/demo");
  });
});
