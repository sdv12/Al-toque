import { describe, expect, it } from "vitest";
import { leerJSON, leerVarios, type StoreLectura } from "../lib/blobs";

/** Como Netlify Blobs: leer una clave que no existe se cuelga (acá, explota para que el test lo note). */
function store(datos: Record<string, unknown>): StoreLectura & { lecturas: string[] } {
  const lecturas: string[] = [];
  return {
    lecturas,
    async list(o) {
      return { blobs: Object.keys(datos).filter((k) => !o?.prefix || k.startsWith(o.prefix)).map((key) => ({ key })) };
    },
    async getWithMetadata(clave) {
      lecturas.push(clave);
      if (!(clave in datos)) throw new Error(`se colgaría leyendo ${clave}`);
      return { data: datos[clave], etag: `e-${clave}` };
    },
  };
}

describe("lectura segura de Blobs", () => {
  it("si la clave no existe devuelve null sin leerla", async () => {
    const s = store({ "contador-viejo": 3 });
    expect(await leerJSON(s, "contador")).toBeNull();
    expect(s.lecturas).toEqual([]);
  });

  it("si existe, trae el valor y el etag", async () => {
    expect(await leerJSON(store({ contador: 41 }), "contador")).toEqual({ data: 41, etag: "e-contador" });
  });

  it("de varias claves lee solo las que existen", async () => {
    const s = store({ "2026-11-16": { total: 2 }, "2026-11-02": { total: 1 } });
    expect(await leerVarios(s, ["2026-11-16", "2026-11-09", "2026-11-02"])).toEqual([{ total: 2 }, { total: 1 }]);
    expect(s.lecturas).toEqual(["2026-11-16", "2026-11-02"]);
  });
});
