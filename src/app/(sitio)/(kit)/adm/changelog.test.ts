import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compararVersiones, leerChangelog, tipoDeVersion, trozos } from "./changelog";

describe("changelog de /adm", () => {
  it("lee versiones, fechas y cambios de varias líneas", () => {
    const v = leerChangelog(`# Cambios

Intro que no es una versión.

## 1.2.0 · 2026-10-01
- Primero
- Segundo que sigue
  en otra línea.

## 1.1.0 · 2026-09-01
- Viejo
`);
    expect(v).toEqual([
      { version: "1.2.0", fecha: "2026-10-01", cambios: ["Primero", "Segundo que sigue en otra línea."] },
      { version: "1.1.0", fecha: "2026-09-01", cambios: ["Viejo"] },
    ]);
  });

  it("el CHANGELOG del repo: todas las versiones con cambios, de la más nueva a la más vieja, y la primera es la de package.json", () => {
    const raiz = process.cwd();
    const v = leerChangelog(readFileSync(path.join(raiz, "CHANGELOG.md"), "utf8"));
    const paquete = JSON.parse(readFileSync(path.join(raiz, "package.json"), "utf8")) as { version: string };
    expect(v.length).toBeGreaterThan(10);
    expect(v.every((x) => x.cambios.length > 0)).toBe(true);
    for (let i = 1; i < v.length; i++) expect(compararVersiones(v[i - 1]!.version, v[i]!.version)).toBeGreaterThan(0);
    expect(v[0]!.version).toBe(paquete.version);
  });

  it("compara versiones como números, no como texto", () => {
    expect(compararVersiones("1.10.0", "1.9.1")).toBeGreaterThan(0);
    expect(compararVersiones("1.9.1", "1.9.1")).toBe(0);
  });

  it("tipo según semver", () => {
    expect(tipoDeVersion("2.0.0")).toBe("grande");
    expect(tipoDeVersion("1.9.0")).toBe("nueva");
    expect(tipoDeVersion("1.9.1")).toBe("ajuste");
  });

  it("negrita con código adentro queda entera (el código se parte al dibujar)", () => {
    expect(trozos("**Panel en `/adm`** listo")).toEqual([
      { tipo: "negrita", texto: "Panel en `/adm`" },
      { tipo: "texto", texto: " listo" },
    ]);
  });

  it("negrita y código", () => {
    expect(trozos("Un **cambio** en `precios.ts`.")).toEqual([
      { tipo: "texto", texto: "Un " },
      { tipo: "negrita", texto: "cambio" },
      { tipo: "texto", texto: " en " },
      { tipo: "codigo", texto: "precios.ts" },
      { tipo: "texto", texto: "." },
    ]);
  });
});
