import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { libreEjemplo } from "../defaults/libre";
import { PLANTILLAS_DE_RUBRO, type SeccionConfig } from "../registry";
import { landingConfigSchema, type ConfigDe } from "../schema/landing-config";

const clonar = <P extends keyof typeof configsPorDefecto>(p: P): ConfigDe<P> => structuredClone(configsPorDefecto[p]);

function mensajes(valor: unknown): string[] {
  const r = landingConfigSchema.safeParse(valor);
  return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe("landingConfigSchema", () => {
  it.each(PLANTILLAS_DE_RUBRO)("acepta la config de ejemplo de %s", (plantilla) => {
    const r = landingConfigSchema.safeParse(configsPorDefecto[plantilla]);
    expect(r.success ? [] : r.error.issues).toEqual([]);
  });

  describe("plantilla a tu medida", () => {
    it("la hoja en blanco pide bloques y un WhatsApp real", () => {
      expect(mensajes(configsPorDefecto.libre).sort()).toEqual(["Agregá al menos un bloque a la página", "Cargá tu número de WhatsApp"].sort());
    });

    it("acepta el ejemplo armado con bloques", () => {
      expect(mensajes(libreEjemplo)).toEqual([]);
    });

    it("permite repetir bloques repetibles y no los demás", () => {
      const c = structuredClone(libreEjemplo);
      c.secciones.push({ id: "b-texto-2", tipo: "texto", variante: "simple", activa: true, datos: { cuerpo: "Otro texto." } });
      expect(mensajes(c)).toEqual([]);
      c.secciones.push({ id: "b-faq-2", tipo: "faq", variante: "acordeon", activa: true });
      expect(mensajes(c)).toContain('La sección "faq" está repetida');
    });

    it("exige ids únicos y valida los datos propios de cada bloque", () => {
      const c = structuredClone(libreEjemplo);
      c.secciones.push({ id: "b-texto", tipo: "texto", variante: "simple", activa: true, datos: { cuerpo: "" } });
      const m = mensajes(c);
      expect(m).toContain("Id de bloque repetido: b-texto");
      expect(m).toContain("No puede quedar vacío");
    });

    it("solo acepta extras conocidos", () => {
      expect(mensajes({ ...libreEjemplo, extras: ["recordatorios", "dominio"] })).toEqual([]);
      expect(mensajes({ ...libreEjemplo, extras: ["teletransporte"] }).length).toBeGreaterThan(0);
    });
  });

  it("rechaza una plantilla desconocida", () => {
    expect(mensajes({ ...clonar("barberia"), plantilla: "veterinaria" })[0]).toMatch(/Plantilla desconocida/);
  });

  it("rechaza una variante que la plantilla no tiene", () => {
    const c = clonar("barberia") as { secciones: { tipo: string; variante: string; activa: boolean }[] };
    c.secciones[1] = { tipo: "servicios", variante: "tabla", activa: true };
    expect(mensajes(c)).toContain('Variante no disponible para "Servicios"');
  });

  it("rechaza una sección de otra plantilla", () => {
    const c = clonar("barberia") as { secciones: { tipo: string; variante: string; activa: boolean }[] };
    c.secciones.push({ tipo: "mapa", variante: "ilustrado", activa: true });
    expect(mensajes(c)[0]).toMatch(/Sección no soportada por la plantilla Nocturna editorial/);
  });

  it("rechaza secciones repetidas", () => {
    const c = clonar("generico");
    c.secciones.push({ tipo: "casos", variante: "problema-solucion", activa: true });
    expect(mensajes(c)).toContain('La sección "casos" está repetida');
  });

  it("exige la sección de inicio primera, presente y activa", () => {
    const movida = clonar("consultorio");
    movida.secciones.reverse();
    expect(mensajes(movida)).toContain('"Portada con turnos" tiene que ser la primera sección');

    const ausente = clonar("alojamiento");
    ausente.secciones = ausente.secciones.filter((s) => s.tipo !== "recorrido");
    expect(mensajes(ausente)).toContain('Falta la sección obligatoria "Recorrido por las casas"');

    const inactiva = clonar("barberia");
    inactiva.secciones[0]!.activa = false;
    expect(mensajes(inactiva)).toContain('"Portada" no se puede desactivar');
  });

  it("exige el contenido que necesitan las secciones activas", () => {
    const c = clonar("alojamiento");
    c.contenido.puntosInteres = [];
    expect(mensajes(c)).toContain('La sección "Mapa de la zona" necesita cargar puntosInteres');

    // Desactivada, ya no hace falta.
    c.secciones = c.secciones.map((s) => (s.tipo === "mapa" ? { ...s, activa: false } : s));
    expect(mensajes(c)).toEqual([]);
  });

  it("rechaza un modo que la plantilla no soporta", () => {
    const c = clonar("barberia");
    c.estilo.modo = "claro";
    expect(mensajes(c)).toContain("Nocturna editorial no tiene modo claro");
  });

  it("rechaza ids repetidos y referencias rotas a profesionales", () => {
    const c = clonar("barberia");
    c.contenido.servicios!.push({ ...c.contenido.servicios![0]! });
    c.contenido.servicios![1]!.profesionalIds = ["fantasma"];
    const m = mensajes(c);
    expect(m).toContain("Id repetido: corte");
    expect(m.some((x) => x.includes("(fantasma)"))).toBe(true);
  });

  it("valida formatos de negocio y estilo", () => {
    const c = clonar("generico");
    c.negocio.whatsapp = "0351 15 555-0404";
    c.estilo.acento = "naranja";
    const m = mensajes(c);
    expect(m.some((x) => x.startsWith("WhatsApp en formato 549"))).toBe(true);
    expect(m).toContain("Color en formato #RRGGBB");
  });

  it("rechaza franjas horarias invertidas", () => {
    const c = clonar("consultorio");
    c.agenda!.dias[0]!.franjas[0] = { desde: "13:00", hasta: "09:00" };
    expect(mensajes(c)).toContain("La franja tiene que terminar después de empezar");
  });

  it("ata tipo y variante a nivel de tipos", () => {
    const ok: SeccionConfig<"barberia"> = { tipo: "servicios", variante: "pizarra", activa: true };
    // @ts-expect-error "tabla" es una variante de consultorio, no de barbería
    const malaVariante: SeccionConfig<"barberia"> = { tipo: "servicios", variante: "tabla", activa: true };
    // @ts-expect-error "mapa" no es una sección de barbería
    const malTipo: SeccionConfig<"barberia"> = { tipo: "mapa", variante: "ilustrado", activa: true };
    expect([ok, malaVariante, malTipo]).toHaveLength(3);
  });
});
