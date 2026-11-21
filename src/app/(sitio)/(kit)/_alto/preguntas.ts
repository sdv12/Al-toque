import { normalizarWhatsappAR } from "@/core/lib/whatsapp";
import {
  COBROS,
  COMENTARIO_RUBRO,
  CONOCIO,
  CONSEJO,
  DIFICULTADES,
  DOMINIO,
  EQUIPO,
  FOTOS,
  FUNCIONES,
  HORARIO,
  LOGO,
  MODALIDAD,
  PLAZO,
  PRESENCIA,
  PRESUPUESTO,
  PRIORIDADES,
  PRODUCTOS,
  RUBROS,
  SERVICIOS,
  SUCURSALES,
  ZONAS,
  coloresPara,
  funcionesSugeridas,
  queQuiere,
  type Respuestas,
} from "./alto";

/*
 * El guion de Alto: las preguntas como datos. El chat las recorre en orden, salteando las que no
 * aplican a lo que la persona ya contestó (por ejemplo, el logo solo si va a tener página).
 */

export type Parcial = Partial<Respuestas>;

export interface Opcion {
  valor: string;
  etiqueta: string;
  /** Muestra de color (pregunta de colores). */
  color?: string;
  /** Al elegirla, se pide que escriba (ej. "Otro"). */
  escribir?: string;
}

interface Base {
  id: string;
  /** Lo que dice Alto (uno o más globos). */
  texto: (r: Parcial) => string[];
  /** Si no aplica, se saltea sola. */
  aplica?: (r: Parcial) => boolean;
  /** Si se puede saltear, el texto del botón. */
  saltear?: string;
}

export type Pregunta =
  | (Base & { tipo: "texto"; placeholder: string; max: number; guardar: (texto: string | null, r: Parcial) => Parcial })
  | (Base & { tipo: "whatsapp"; placeholder: string; guardar: (numero: string | null) => Parcial })
  | (Base & { tipo: "una"; opciones: (r: Parcial) => Opcion[]; guardar: (valor: string | null, r: Parcial, escrito?: string) => Parcial })
  | (Base & { tipo: "varias"; opciones: (r: Parcial) => Opcion[]; sugeridas?: (r: Parcial) => string[]; ninguna: string; guardar: (valores: string[]) => Parcial });

const desde = <K extends string>(o: Record<K, string>): Opcion[] => Object.entries<string>(o).map(([valor, etiqueta]) => ({ valor, etiqueta }));
const quiere = (r: Parcial) => queQuiere(r.funciones);

export const PREGUNTAS: Pregunta[] = [
  {
    id: "nombre",
    tipo: "texto",
    texto: () => ["¿Cómo se llama tu negocio?"],
    placeholder: "Escribí el nombre…",
    max: 60,
    saltear: "Todavía no tiene nombre",
    guardar: (t) => ({ nombre: t?.trim() ?? "" }),
  },
  {
    id: "rubro",
    tipo: "una",
    texto: (r) => [r.nombre ? `¡Buenísimo, ${r.nombre}!` : "No pasa nada, lo vemos después.", "¿De qué rubro es?"],
    opciones: () => RUBROS.map((x) => (x.id === "otro" ? { valor: x.id, etiqueta: "Otro", escribir: "¿A qué se dedica?" } : { valor: x.id, etiqueta: x.nombre })),
    guardar: (v, _r, escrito) => ({ rubro: RUBROS.find((x) => x.id === v) ?? RUBROS[RUBROS.length - 1]!, rubroOtro: v === "otro" ? escrito?.trim() || undefined : undefined }),
  },
  {
    id: "modalidad",
    tipo: "una",
    texto: (r) => [...(r.rubro && COMENTARIO_RUBRO[r.rubro.id] ? [COMENTARIO_RUBRO[r.rubro.id]!] : []), "¿Dónde atendés a tus clientes?"],
    opciones: () => desde(MODALIDAD),
    guardar: (v) => ({ modalidad: v as Respuestas["modalidad"] }),
  },
  {
    id: "horario",
    tipo: "una",
    texto: () => ["¿En qué horario trabajás, más o menos?"],
    opciones: () => desde(HORARIO),
    saltear: "Prefiero no decirlo",
    guardar: (v) => ({ horario: (v ?? undefined) as Respuestas["horario"] }),
  },
  {
    id: "presencia",
    tipo: "varias",
    texto: () => ["¿Dónde te encuentran hoy tus clientes? Marcá todas las que correspondan."],
    opciones: () => desde(PRESENCIA),
    ninguna: "Todavía en ningún lado",
    guardar: (v) => ({ presencia: v as Respuestas["presencia"] }),
  },
  {
    id: "instagram",
    tipo: "texto",
    texto: () => ["¿Cuál es tu usuario de Instagram? Así vemos tu estilo y lo sumamos a la página."],
    aplica: (r) => !!r.presencia?.includes("instagram"),
    placeholder: "@tunegocio",
    max: 60,
    saltear: "Prefiero no pasarlo",
    guardar: (t) => {
      const u = t?.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "");
      return { instagram: u ? `@${u}` : undefined };
    },
  },
  {
    id: "webActual",
    tipo: "texto",
    texto: () => ["¿Cuál es la dirección de tu página actual? La miramos para mejorarla."],
    aplica: (r) => !!r.presencia?.includes("web"),
    placeholder: "tunegocio.com.ar",
    max: 120,
    saltear: "Prefiero no pasarla",
    guardar: (t) => ({ webActual: t?.trim() || undefined }),
  },
  {
    id: "dificultades",
    tipo: "varias",
    texto: () => ["¿Qué es lo que más te complica hoy?"],
    opciones: () => desde(DIFICULTADES),
    ninguna: "Nada de esto, por ahora",
    guardar: (v) => ({ dificultades: v as Respuestas["dificultades"] }),
  },
  {
    id: "prioridad",
    tipo: "una",
    texto: (r) => {
      const primera = r.dificultades?.[0];
      return [primera ? `Entendido, eso tiene solución. ${CONSEJO[primera]}` : "Mejor así 🙌", "¿Qué querés resolver primero?"];
    },
    opciones: () => desde(PRIORIDADES),
    guardar: (v) => ({ prioridad: v as Respuestas["prioridad"] }),
  },
  {
    id: "zona",
    tipo: "una",
    texto: () => ["¿Qué zona querés cubrir?"],
    opciones: () => desde(ZONAS),
    guardar: (v) => ({ zona: v as Respuestas["zona"] }),
  },
  {
    id: "funciones",
    tipo: "varias",
    texto: () => ["¿Qué te gustaría que tenga?", "Te marqué lo que te puede servir por lo que me contaste. Sumá o sacá lo que quieras."],
    opciones: () => desde(FUNCIONES),
    sugeridas: (r) => (r.rubro && r.prioridad && r.zona ? funcionesSugeridas({ ...(r as Respuestas), dificultades: r.dificultades ?? [] }) : []),
    ninguna: "No sé, decime vos",
    guardar: (v) => ({ funciones: v as Respuestas["funciones"] }),
  },
  {
    id: "equipo",
    tipo: "una",
    texto: () => ["Un par de detalles para armarlo bien.", "¿Cuántas personas trabajan con vos?"],
    aplica: (r) => quiere(r).agenda || quiere(r).pro,
    opciones: () => desde(EQUIPO),
    guardar: (v) => ({ equipo: v as Respuestas["equipo"] }),
  },
  {
    id: "servicios",
    tipo: "una",
    texto: () => ["¿Cuántos servicios ofrecés, más o menos?"],
    aplica: (r) => quiere(r).agenda,
    opciones: () => desde(SERVICIOS),
    guardar: (v) => ({ servicios: v as Respuestas["servicios"] }),
  },
  {
    id: "productos",
    tipo: "una",
    texto: () => ["¿Cuántos productos vendés, más o menos?"],
    aplica: (r) => quiere(r).caja || quiere(r).pro,
    opciones: () => desde(PRODUCTOS),
    guardar: (v) => ({ productos: v as Respuestas["productos"] }),
  },
  {
    id: "cobros",
    tipo: "varias",
    texto: () => ["¿Cómo te pagan tus clientes?"],
    aplica: (r) => quiere(r).caja || quiere(r).pro,
    opciones: () => desde(COBROS),
    ninguna: "Saltear",
    guardar: (v) => ({ cobros: v as Respuestas["cobros"] }),
  },
  {
    id: "sucursales",
    tipo: "una",
    texto: () => ["¿Cuántas sucursales tenés?"],
    aplica: (r) => quiere(r).pro,
    opciones: () => desde(SUCURSALES),
    guardar: (v) => ({ sucursales: v as Respuestas["sucursales"] }),
  },
  {
    id: "logo",
    tipo: "una",
    texto: () => ["Para la página: ¿tenés logo?"],
    aplica: (r) => quiere(r).landing,
    opciones: () => desde(LOGO),
    guardar: (v) => ({ logo: v as Respuestas["logo"] }),
  },
  {
    id: "fotos",
    tipo: "una",
    texto: () => ["¿Tenés fotos de tu trabajo o de tu local?"],
    aplica: (r) => quiere(r).landing,
    opciones: () => desde(FOTOS),
    guardar: (v) => ({ fotos: v as Respuestas["fotos"] }),
  },
  {
    id: "dominio",
    tipo: "una",
    texto: () => ["¿Ya tenés un dominio? (tunegocio.com.ar)"],
    aplica: (r) => quiere(r).landing,
    opciones: () => desde(DOMINIO),
    guardar: (v) => ({ dominio: v as Respuestas["dominio"] }),
  },
  {
    id: "color",
    tipo: "una",
    texto: () => ["¿Qué colores van con tu negocio?"],
    aplica: (r) => quiere(r).landing || quiere(r).caja,
    opciones: (r) => (r.rubro ? coloresPara(r.rubro).map((c) => ({ valor: c.hex, etiqueta: c.nombre, color: c.hex })) : []),
    saltear: "Que lo elijan ustedes",
    guardar: (v, r) => ({ color: (r.rubro && coloresPara(r.rubro).find((c) => c.hex === v)) || null }),
  },
  {
    id: "presupuesto",
    tipo: "una",
    texto: () => ["¿Cuánto pensás invertir para arrancar? Es para proponerte algo que te cierre."],
    opciones: () => desde(PRESUPUESTO),
    saltear: "Prefiero no decirlo",
    guardar: (v) => ({ presupuesto: (v ?? undefined) as Respuestas["presupuesto"] }),
  },
  {
    id: "plazo",
    tipo: "una",
    texto: () => ["¿Para cuándo lo necesitás?"],
    opciones: () => desde(PLAZO),
    guardar: (v) => ({ plazo: v as Respuestas["plazo"] }),
  },
  {
    id: "conocio",
    tipo: "una",
    texto: () => ["¿Cómo nos conociste?"],
    opciones: () => desde(CONOCIO),
    saltear: "Saltear",
    guardar: (v) => ({ conocio: (v ?? undefined) as Respuestas["conocio"] }),
  },
  {
    id: "contacto",
    tipo: "texto",
    texto: () => ["Ya casi. Para responderte necesito un par de datos: los usamos solo para eso (está todo en la Política de privacidad).", "¿Cómo te llamás?"],
    placeholder: "Tu nombre…",
    max: 60,
    saltear: "Prefiero no decirlo",
    guardar: (t) => ({ contacto: t?.trim() || undefined }),
  },
  {
    id: "whatsapp",
    tipo: "whatsapp",
    texto: (r) => [`${r.contacto ? `Gracias, ${r.contacto.split(" ")[0]}. ` : ""}¿A qué WhatsApp te escribimos?`],
    placeholder: "Ej: 351 555 1234",
    saltear: "Prefiero que no",
    guardar: (n) => ({ whatsapp: n }),
  },
  {
    id: "comentario",
    tipo: "texto",
    texto: () => ["Última: ¿algo más que quieras contarnos? Lo que vendés, una página que te guste, lo que sea."],
    placeholder: "Escribí lo que quieras…",
    max: 500,
    saltear: "Nada más",
    guardar: (t) => ({ comentario: t?.trim() || undefined }),
  },
];

/** Las preguntas que aplican con lo contestado hasta ahora (para la barra de progreso). */
export function preguntasPara(r: Parcial): Pregunta[] {
  return PREGUNTAS.filter((p) => !p.aplica || p.aplica(r));
}

/** WhatsApp argentino válido en formato 549…, o un mensaje de error para mostrar. */
export function validarWhatsapp(texto: string): { ok: true; numero: string } | { ok: false; error: string } {
  const n = normalizarWhatsappAR(texto);
  return n ? { ok: true, numero: n } : { ok: false, error: "Mmm, ese número no me cierra. Escribilo con la característica, por ejemplo 351 555 1234." };
}

/** Lo que dijo la persona, como globo del chat. */
export function respuestaEnTexto(p: Pregunta, r: Parcial): string {
  const opcion = (v: string | undefined) => (p.tipo === "una" || p.tipo === "varias" ? p.opciones(r).find((o) => o.valor === v)?.etiqueta : undefined) ?? v ?? "";
  switch (p.id) {
    case "nombre":
      return r.nombre || "Todavía no tiene nombre";
    case "rubro":
      return r.rubroOtro ? `Otro: ${r.rubroOtro}` : (r.rubro?.nombre ?? "");
    case "color":
      return r.color?.nombre ?? "Que lo elijan ustedes";
    case "contacto":
      return r.contacto ?? "Prefiero no decirlo";
    case "whatsapp":
      return r.whatsapp ? `+${r.whatsapp}` : "Prefiero que no";
    case "comentario":
      return r.comentario ?? "Nada más";
    case "instagram":
      return r.instagram ?? "Prefiero no pasarlo";
    case "webActual":
      return r.webActual ?? "Prefiero no pasarla";
    case "horario":
    case "presupuesto":
      if (!(r as Record<string, unknown>)[p.id]) return "Prefiero no decirlo";
      break;
    case "conocio":
      if (!r.conocio) return "Saltear";
      break;
  }
  const valor = (r as Record<string, unknown>)[p.id];
  if (Array.isArray(valor)) return valor.length ? valor.map((v: string) => opcion(v)).join(" · ") : p.tipo === "varias" ? p.ninguna : "—";
  return opcion(valor as string | undefined);
}
