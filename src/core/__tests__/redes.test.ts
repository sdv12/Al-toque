import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { jsonLdNegocio } from "../lib/jsonld";
import { esUrlDeRed, urlDeRed } from "../lib/redes";
import { negocioSchema } from "../schema/comun";
import { migrateConfig } from "../schema/migrate";

describe("urlDeRed", () => {
  it.each([
    ["instagram", "@barberiaguemes", "https://instagram.com/barberiaguemes"],
    ["instagram", "barberiaguemes", "https://instagram.com/barberiaguemes"],
    ["instagram", "https://www.instagram.com/barberiaguemes/?hl=es", "https://www.instagram.com/barberiaguemes"],
    ["instagram", "instagram.com/barberiaguemes", "https://instagram.com/barberiaguemes"],
    ["tiktok", "@tano.barber", "https://www.tiktok.com/@tano.barber"],
    ["youtube", "youtube.com/@canal", "https://youtube.com/@canal"],
    ["facebook", "https://m.facebook.com/barberia.guemes", "https://m.facebook.com/barberia.guemes"],
    ["x", "twitter.com/negocio", "https://twitter.com/negocio"],
    ["linkedin", "https://www.linkedin.com/company/acme/", "https://www.linkedin.com/company/acme"],
  ] as const)("%s: «%s» → %s", (red, entrada, esperado) => {
    expect(urlDeRed(red, entrada)).toBe(esperado);
  });

  it.each([
    ["instagram", ""],
    ["instagram", "con espacios"],
    ["instagram", "https://facebook.com/otra-red"],
    ["facebook", "https://facebook.com/"],
    ["tiktok", "https://evil.com/tiktok.com/@x"],
  ] as const)("%s: «%s» no se interpreta", (red, entrada) => {
    expect(urlDeRed(red, entrada)).toBeNull();
  });

  it("el schema solo acepta links https al dominio de la red", () => {
    expect(esUrlDeRed("instagram", "https://instagram.com/a")).toBe(true);
    expect(esUrlDeRed("instagram", "http://instagram.com/a")).toBe(false);
    expect(esUrlDeRed("instagram", "https://notinstagram.com/a")).toBe(false);
  });
});

describe("negocio.redes", () => {
  const negocio = configsPorDefecto.barberia.negocio;

  it("rechaza un link que no es de esa red, con ruta legible", () => {
    const r = negocioSchema.safeParse({ ...negocio, redes: [{ red: "tiktok", url: "https://instagram.com/x" }] });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["redes", 0, "url"]);
  });

  it("no deja repetir una red", () => {
    const url = "https://instagram.com/x";
    const r = negocioSchema.safeParse({ ...negocio, redes: [{ red: "instagram", url }, { red: "instagram", url }] });
    expect(r.success).toBe(false);
  });

  it("el JSON-LD lista todas las redes como sameAs", () => {
    const config = {
      ...configsPorDefecto.barberia,
      negocio: { ...negocio, redes: [{ red: "instagram" as const, url: "https://instagram.com/a" }, { red: "tiktok" as const, url: "https://www.tiktok.com/@a" }] },
    };
    expect(jsonLdNegocio(config).sameAs).toEqual(["https://instagram.com/a", "https://www.tiktok.com/@a"]);
  });
});

describe("migración v1 → v2", () => {
  /** Una config v1 tal como se guardaba: con el Instagram suelto en negocio. */
  const v1 = () => {
    const { redes, ...negocio } = JSON.parse(JSON.stringify(configsPorDefecto.consultorio.negocio));
    void redes;
    return { ...JSON.parse(JSON.stringify(configsPorDefecto.consultorio)), version: 1, negocio: { ...negocio, instagram: "dermacerro" } };
  };

  it("el Instagram del negocio pasa a ser su primera red", () => {
    const r = migrateConfig(v1());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.migradaDesde).toBe(1);
      expect(r.config.version).toBe(2);
      expect(r.config.negocio.redes).toEqual([{ red: "instagram", url: "https://instagram.com/dermacerro" }]);
      expect(r.config.negocio).not.toHaveProperty("instagram");
    }
  });

  it("sin Instagram, queda sin redes", () => {
    const { instagram, ...negocio } = v1().negocio;
    void instagram;
    const r = migrateConfig({ ...v1(), negocio });
    expect(r.ok && r.config.negocio.redes).toBeUndefined();
  });
});
