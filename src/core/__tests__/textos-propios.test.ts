import { describe, expect, it } from "vitest";
import { configsPorDefecto } from "../defaults";
import { claveDeElemento, cssDeTextos, fuentesUsadas, textoTocado } from "../lib/textos-propios";
import { landingConfigSchema } from "../schema/landing-config";

/** Elemento mínimo (lo que usan las funciones): sin depender de un DOM de pruebas. */
type Nodo = { tagName: string; id: string; parentElement: Nodo | null; children: Nodo[]; childNodes: ({ nodeType: number; textContent: string } | Nodo)[]; closest: (s: string) => Nodo | null };
function el(tag: string, hijos: (Nodo | string)[] = [], id = ""): Nodo {
  const n: Nodo = { tagName: tag.toUpperCase(), id, parentElement: null, children: [], childNodes: [], closest: () => null };
  for (const h of hijos) {
    if (typeof h === "string") n.childNodes.push({ nodeType: 3, textContent: h });
    else {
      h.parentElement = n;
      n.children.push(h);
      n.childNodes.push(h);
    }
  }
  return n;
}
const comoEl = (n: Nodo) => n as unknown as Element;

describe("textos con estilo propio", () => {
  it("la clave se ancla en el id más cercano y baja por posición", () => {
    const b = el("b", ["clásico"]);
    const h3 = el("h3", ["Corte ", b]);
    const raiz = el("div", [el("section", [el("div", [el("p", ["Intro"]), h3])], "servicios")]);
    expect(claveDeElemento(comoEl(h3), comoEl(raiz))).toBe("#servicios > div:nth-child(1) > h3:nth-child(2)");
    expect(textoTocado(comoEl(b), comoEl(raiz))).toBe(comoEl(b));
  });

  it("sin id, la clave arranca en la raíz", () => {
    const p = el("p", ["Texto"]);
    const raiz = el("div", [el("header", [el("h1", ["Hola"])]), el("main", [p])]);
    expect(claveDeElemento(comoEl(p), comoEl(raiz))).toBe(" > main:nth-child(2) > p:nth-child(1)");
  });

  it("no usa ids de React como ancla y sube hasta un texto propio", () => {
    const span = el("span", ["Hola"]);
    const raiz = el("div", [el("div", [span], ":r1:")]);
    expect(claveDeElemento(comoEl(span), comoEl(raiz))).toBe(" > div:nth-child(1) > span:nth-child(1)");
    const contenedor = el("div", [el("span", ["   "])]);
    const raiz2 = el("div", [contenedor]);
    expect(textoTocado(comoEl(contenedor.children[0]!), comoEl(raiz2))).toBeNull();
  });

  it("arma el CSS y lista solo las fuentes usadas", () => {
    const textos = { "#inicio > h1:nth-child(1)": { tamano: 48, color: "#112233", fuente: "lora" as const } };
    const css = cssDeTextos(textos);
    expect(css).toContain("[data-plantilla] #inicio > h1:nth-child(1){");
    expect(css).toContain("font-size:48px!important");
    expect(css).toContain("color:#112233!important");
    expect(css).toContain("var(--fuente-texto-lora)");
    expect(fuentesUsadas(textos)).toEqual(["lora"]);
  });

  it("el schema rechaza claves que podrían colar CSS", () => {
    const base = structuredClone(configsPorDefecto.generico);
    const conClave = (clave: string) => ({ ...base, estilo: { ...base.estilo, textos: { [clave]: { tamano: 20 } } } });
    expect(landingConfigSchema.safeParse(conClave("#inicio > h1:nth-child(1)")).success).toBe(true);
    expect(landingConfigSchema.safeParse(conClave("h1{} body{display:none")).success).toBe(false);
    expect(landingConfigSchema.safeParse(conClave("#a > h1:nth-child(1)} *{color:red")).success).toBe(false);
    expect(cssDeTextos({ "} body {": { tamano: 20 } })).toBe("");
  });
});
