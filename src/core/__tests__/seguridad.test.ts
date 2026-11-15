import { describe, expect, it } from "vitest";
import { imagenSchema } from "../schema/comun";

describe("seguridad del schema", () => {
  it("las imágenes son https o rutas propias, no URLs de otro dominio disfrazadas de ruta", () => {
    const ok = (src: string) => imagenSchema.safeParse({ src, alt: "foto" }).success;
    expect(ok("https://ejemplo.com/foto.jpg")).toBe(true);
    expect(ok("/muestras/foto.jpg")).toBe(true);
    expect(ok("//otro-sitio.com/foto.jpg")).toBe(false);
    expect(ok("http://ejemplo.com/foto.jpg")).toBe(false);
    expect(ok("javascript:alert(1)")).toBe(false);
  });
});
