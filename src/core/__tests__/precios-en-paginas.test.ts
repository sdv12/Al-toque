import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Coherencia de precios: ninguna página escribe un precio a mano. Todos salen de
 * src/core/lib/precios.ts, así la portada, /web, /turnos, /caja, Alto y el configurador dicen lo mismo.
 */
function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : /\.tsx$/.test(n) && !/\.test\.tsx$/.test(n) ? [p] : [];
  });
}

describe("precios en las páginas", () => {
  it("ninguna página (.tsx) escribe un precio a mano", () => {
    const precioAMano = /\$\s?\d{1,3}(\.\d{3})+|\b\d{2,3}_000\b/;
    const culpables = archivos("src/app/(sitio)/(kit)")
      .filter((f) => !f.includes("/configurador/") && !f.includes("/legales/"))
      .filter((f) => precioAMano.test(readFileSync(f, "utf8")));
    expect(culpables).toEqual([]);
  });
});
