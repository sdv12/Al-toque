/*
 * Estadísticas de pedidos: SOLO números (sin nombres, teléfonos ni nada personal), agrupados por
 * semana. Sirven para medir de dónde llegan los pedidos y qué se pide. Lo que manda el navegador
 * se normaliza contra listas cerradas: un valor raro cuenta como "otro", nunca se guarda tal cual.
 */

export const TIPOS = ["Landing", "Caja", "Agenda", "Resto", "Consulta", "Tienda"] as const;
export type TipoEvento = (typeof TIPOS)[number];

export const NIVELES = ["perfil", "vidriera", "medida", "sistema", "caja", "cajaPro", "agenda", "restoCarta", "resto", "tienda"] as const;

/** Páginas por las que se entra o desde las que se pide (las demás cuentan como "otra"). */
const PAGINAS = ["/", "/web", "/turnos", "/turnos/demo", "/caja", "/resto", "/resto/demo", "/tienda", "/configurador", "/estudio", "/c/pro", "/c/prueba"] as const;

export function normalizarPagina(ruta: unknown): string {
  if (typeof ruta !== "string") return "otra";
  const limpia = ruta.split(/[?#]/)[0]!.replace(/\/+$/, "") || "/";
  if ((PAGINAS as readonly string[]).includes(limpia)) return limpia;
  if (limpia.startsWith("/l/")) return "/l (demos de páginas)";
  if (limpia.startsWith("/c/")) return "/c (demos de caja)";
  return "otra";
}

const de = <T extends string>(lista: readonly T[], valor: unknown, otro: T | "otro" = "otro"): T | "otro" =>
  typeof valor === "string" && (lista as readonly string[]).includes(valor) ? (valor as T) : otro;

export interface Evento {
  tipo: TipoEvento | "otro";
  /** Página por la que entró a la visita. */
  entrada: string;
  /** Página desde la que mandó el pedido. */
  pagina: string;
  nivel: string;
}

/** Arma un evento válido con lo que mandó el navegador (o null si no es un evento). */
export function normalizarEvento(cuerpo: unknown): Evento | null {
  if (!cuerpo || typeof cuerpo !== "object") return null;
  const c = cuerpo as Record<string, unknown>;
  const tipo = de(TIPOS, c.tipo);
  if (tipo === "otro") return null;
  return { tipo, entrada: normalizarPagina(c.entrada), pagina: normalizarPagina(c.pagina), nivel: de(NIVELES, c.nivel, "otro") };
}

export type Conteo = Record<string, number>;

export interface Semana {
  /** Lunes de la semana, AAAA-MM-DD (hora de Argentina). */
  semana: string;
  total: number;
  tipo: Conteo;
  entrada: Conteo;
  pagina: Conteo;
  nivel: Conteo;
}

/** Lunes de la semana de `fecha` en Argentina (UTC−3, sin horario de verano). */
export function lunesDe(fecha: Date): string {
  const ar = new Date(fecha.getTime() - 3 * 3_600_000);
  const dia = (ar.getUTCDay() + 6) % 7; // 0 = lunes
  return new Date(Date.UTC(ar.getUTCFullYear(), ar.getUTCMonth(), ar.getUTCDate() - dia)).toISOString().slice(0, 10);
}

export const semanaVacia = (semana: string): Semana => ({ semana, total: 0, tipo: {}, entrada: {}, pagina: {}, nivel: {} });

const sumar = (c: Conteo, clave: string) => ({ ...c, [clave]: (c[clave] ?? 0) + 1 });

/** Suma un evento a su semana (sin modificar la original). */
export function sumarEvento(s: Semana, e: Evento): Semana {
  return { ...s, total: s.total + 1, tipo: sumar(s.tipo, e.tipo), entrada: sumar(s.entrada, e.entrada), pagina: sumar(s.pagina, e.pagina), nivel: sumar(s.nivel, e.nivel) };
}

/** Las últimas `n` semanas (de la más nueva a la más vieja), con cero en las que no hubo nada. */
export function ultimasSemanas(guardadas: Semana[], hoy: Date, n = 8): Semana[] {
  const por = new Map(guardadas.map((s) => [s.semana, s]));
  const lunes = lunesDe(hoy);
  return Array.from({ length: n }, (_, i) => {
    const clave = new Date(Date.parse(`${lunes}T00:00:00Z`) - i * 7 * 86_400_000).toISOString().slice(0, 10);
    return por.get(clave) ?? semanaVacia(clave);
  });
}

/** Suma varias semanas en una (para los totales del período). */
export function juntar(semanas: Semana[]): Semana {
  const mezclar = (a: Conteo, b: Conteo) => Object.entries(b).reduce((c, [k, v]) => ({ ...c, [k]: (c[k] ?? 0) + v }), a);
  return semanas.reduce(
    (t, s) => ({ ...t, total: t.total + s.total, tipo: mezclar(t.tipo, s.tipo), entrada: mezclar(t.entrada, s.entrada), pagina: mezclar(t.pagina, s.pagina), nivel: mezclar(t.nivel, s.nivel) }),
    semanaVacia("total"),
  );
}
