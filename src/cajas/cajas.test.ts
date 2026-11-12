import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cotizarCaja, MODULOS_CAJA } from "@/core/lib/precios";
import { COLORES_CAJA, cajaPorDefecto, codificarCaja, leerCodigoCaja, validarCaja } from "./config";
import { configDePrueba } from "./prueba";
import { RUBROS, RUBROS_CAJA } from "./rubros";
import { activaDesde } from "./simple/lib/activa";
import { datosDeEjemplo } from "./simple/lib/ejemplo";
import { productEmojis, seedProducts } from "./simple/lib/seed";

describe("rubros", () => {
  it.each(RUBROS_CAJA)("%s: productos con nombre único, precio y cajón", (rubro) => {
    const productos = seedProducts(rubro, 0);
    expect(productos.length).toBeGreaterThanOrEqual(15);
    expect(new Set(productos.map((p) => p.name)).size).toBe(productos.length);
    expect(productos.every((p) => p.price > 0 && (p.crate ?? 0) > 0)).toBe(true);
    // Todos los dibujos de los productos se pueden volver a elegir al editar.
    const emojis = new Set(productEmojis(rubro));
    expect(productos.every((p) => emojis.has(p.emoji))).toBe(true);
  });

  it("el nombre de ejemplo de cada rubro es válido", () => {
    for (const r of RUBROS_CAJA) expect(validarCaja(cajaPorDefecto(r)).ok).toBe(true);
  });
});

describe("configuración de la caja", () => {
  it("cajones solo donde el rubro los tiene", () => {
    const almacen = { ...cajaPorDefecto("almacen"), modulos: { fiado: true, cajones: true } };
    const r = validarCaja(almacen);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores[0]?.ruta).toBe("modulos.cajones");
    expect(RUBROS.verduleria.cajones).toBe(true);
  });

  it("pide nombre", () => {
    expect(validarCaja({ ...cajaPorDefecto(), negocio: { nombre: " a " } }).ok).toBe(false);
  });

  it("activaDesde: base propia y cajones apagados si el rubro no los tiene", () => {
    const a = activaDesde({ ...cajaPorDefecto("kiosco"), demo: true }, "caja-x");
    expect(a).toMatchObject({ base: "caja-x", rubro: "kiosco", cajones: false, fiado: true, ejemplo: true });
  });

  it("código CJ1 de ida y vuelta, también dentro del mensaje", async () => {
    const config = { ...cajaPorDefecto("dietetica"), color: "bordo" as const };
    const codigo = await codificarCaja(config);
    expect(codigo.startsWith("CJ1.")).toBe(true);
    expect(await leerCodigoCaja(`Hola! Quiero la caja.\n\nCódigo (no lo edites):\n${codigo}`)).toEqual(config);
    expect(await leerCodigoCaja(JSON.stringify(config))).toEqual(config);
    expect(await leerCodigoCaja("hola")).toBeUndefined();
  });
});

describe("prueba de /caja", () => {
  it("nombre a medio escribir: mismo rubro y color, nombre provisorio", () => {
    const c = configDePrueba(JSON.stringify({ ...cajaPorDefecto("almacen"), color: "azul", negocio: { nombre: "A" } }));
    expect(c).toMatchObject({ rubro: "almacen", color: "azul", negocio: { nombre: "Tu negocio" }, demo: true });
  });

  it("sin nada guardado o con basura: la caja por defecto en modo demo", () => {
    expect(configDePrueba(null)).toEqual({ ...cajaPorDefecto(), demo: true });
    expect(configDePrueba("{no es json")).toEqual({ ...cajaPorDefecto(), demo: true });
  });
});

describe("precio de la caja", () => {
  it("base + módulos", () => {
    const solo = cotizarCaja({ modulos: { fiado: false, cajones: false } });
    const todo = cotizarCaja({ modulos: { fiado: true, cajones: true } });
    expect(solo.lineas).toHaveLength(1);
    expect(todo.total.unico).toBe(solo.total.unico + MODULOS_CAJA.fiado.unico + MODULOS_CAJA.cajones.unico);
    expect(todo.usaSistema).toBe(false);
  });
});

/** Contraste WCAG entre dos colores #rrggbb. */
function contraste(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x! + 0.05) / (y! + 0.05);
}

describe("colores", () => {
  it.each(Object.entries(COLORES_CAJA))("%s: texto blanco se lee (AA) sobre el acento y el oscuro", (_, c) => {
    expect(contraste(c.acento, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.oscuro, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contraste(c.oscuro, c.claro)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("datos de ejemplo", () => {
  it.each(RUBROS_CAJA)("%s: ventas con total correcto y fiados a clientes que existen", (rubro) => {
    const { sales, customers, opening } = datosDeEjemplo(seedProducts(rubro, 0), Date.UTC(2026, 10, 11, 15));
    const clientes = new Set(customers.map((c) => c.id));
    for (const s of sales) {
      expect(s.total).toBe(s.items.reduce((t, i) => t + i.subtotal, 0));
      expect(s.total).toBeGreaterThan(0);
      if (s.method === "fiado") expect(clientes.has(s.customerId!)).toBe(true);
      if (s.paidWith) expect(s.paidWith).toBeGreaterThanOrEqual(s.total);
    }
    expect(opening.at).toBeLessThan(Math.min(...sales.map((s) => s.createdAt)));
  });
});

describe("cajas publicadas", () => {
  const carpeta = path.join(process.cwd(), "configs", "cajas");
  it.each(readdirSync(carpeta).filter((a) => a.endsWith(".json")))("%s es válida", (archivo) => {
    const r = validarCaja(JSON.parse(readFileSync(path.join(carpeta, archivo), "utf8")));
    expect(r.ok ? [] : r.errores).toEqual([]);
  });
});
