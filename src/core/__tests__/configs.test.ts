import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { migrateConfig } from "../schema/migrate";

// Las landings publicadas en fase 1 son archivos: si alguno queda inválido, que falle acá y no en el build.
const DIR = new URL("../../../configs/", import.meta.url);
const archivos = readdirSync(DIR).filter((a) => a.endsWith(".json"));

describe("configs/*.json", () => {
  it("hay al menos una config publicada", () => expect(archivos.length).toBeGreaterThan(0));

  it.each(archivos)("%s es válida", (archivo) => {
    const r = migrateConfig(JSON.parse(readFileSync(new URL(archivo, DIR), "utf8")));
    expect(r.ok ? [] : r.errores).toEqual([]);
  });
});
