/*
 * Restaurantes publicados (clientes) en /r/<slug>, desde configs/restos/<slug>.json.
 *
 * Mientras no haya nube, la web de un cliente no guarda nada en el navegador de quien la visita: las
 * reservas, los pedidos y la lista de espera se mandan por WhatsApp al restaurante, con el mensaje
 * armado. El panel funciona en el equipo del local (en su navegador). La carta y la web que ve la
 * gente son las publicadas: para cambiarlas, el restaurante nos manda la copia (Ajustes → Copia y
 * datos) y la volvemos a publicar con `pnpm publicar-resto`.
 */
import { codificar, decodificar } from "@/core/lib/codigo";
import { PLANES_RESTO, type IdPlanResto } from "@/core/lib/precios";
import { esTipo } from "./locales";
import { franjasDel } from "./horarios";
import { migrar } from "./migrar";
import { ID_DISENOS, MEDIOS, type Estado, type IdDiseno, type IdTipo, type Item, type Pedido, type Reserva } from "./tipos";
import { fechaLarga, plata } from "./util";

export type PlanResto = IdPlanResto;
export const PLANES = Object.keys(PLANES_RESTO) as PlanResto[];

/** Lo que se publica: el plan y el restaurante (configuración y carta, sin la operación). */
export interface RestoPublicado {
  version: 1;
  plan: PlanResto;
  estado: Estado;
}

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** "demo" y "ejemplo" se reservan para no confundir con la demo. */
export const SLUGS_RESERVADOS = ["demo", "ejemplo", "prueba"];

/** Módulos que el plan «Carta y web» no incluye (no hay panel del salón). */
export function aplicarPlan(st: Estado, plan: PlanResto): Estado {
  if (plan === "carta") {
    st.local.modulos.salon = false;
    st.local.modulos.ocupacionWeb = false;
    st.local.modulos.caja = false;
  }
  return st;
}

/**
 * Deja un restaurante listo para publicar: saca todo lo de la operación (mesas ocupadas, reservas,
 * pedidos, caja, comandas, números) y las fotos de ejemplo vacías de la galería.
 */
export function prepararPublicacion(st: Estado, plan: PlanResto): RestoPublicado {
  const e = migrar(structuredClone(st));
  e.mesas = e.mesas.map((m) => ({ ...m, unidaA: null, ocupada: null }));
  e.reservas = [];
  e.pedidos = [];
  e.proximoPedido = 1;
  e.caja = { abierta: false, apertura: null, fondo: 0, movs: [] };
  e.cierres = [];
  e.comandas = [];
  e.espera = [];
  e.ventas = [];
  e.llamados = [];
  e.local.web.galeria = e.local.web.galeria.filter((f) => f.src);
  return { version: 1, plan, estado: aplicarPlan(e, plan) };
}

export type ResultadoPublicado = { ok: true; valor: RestoPublicado } | { ok: false; errores: string[] };

/** Revisa un restaurante para publicar. Los errores van en castellano, para el que publica. */
export function validarPublicado(valor: unknown): ResultadoPublicado {
  const v = valor as Partial<RestoPublicado> | null;
  const errores: string[] = [];
  if (!v || v.version !== 1) return { ok: false, errores: ["No es un restaurante publicado (falta version: 1)."] };
  if (!v.plan || !PLANES.includes(v.plan)) errores.push(`Plan desconocido: ${String(v.plan)} (va ${PLANES.join(" o ")}).`);
  const st = v.estado;
  if (!st || st.v !== 1 || !st.local || !Array.isArray(st.platos) || !Array.isArray(st.mesas)) return { ok: false, errores: [...errores, "Falta el restaurante (estado)."] };
  if (!esTipo(st.local.tipo)) errores.push(`Tipo de local desconocido: ${String(st.local.tipo)}.`);
  if (!ID_DISENOS.includes(st.local.diseno)) errores.push(`Diseño desconocido: ${String(st.local.diseno)}.`);
  if (!st.local.nombre || st.local.nombre.trim().length < 2) errores.push("Falta el nombre del local.");
  if (st.local.whatsapp.replace(/\D/g, "").length < 8) errores.push("Falta el WhatsApp del local: ahí llegan las reservas y los pedidos.");
  if (!st.platos.length) errores.push("La carta está vacía.");
  if (!st.local.personal?.some((p) => p.rol === "encargado" && p.activo)) errores.push("Falta un encargado activo en el personal.");
  if (st.local.personal?.some((p) => p.pin === "1234")) errores.push("Hay alguien con el PIN de la demo (1234): que lo cambie antes de publicar.");
  if (!st.local.horarios.semana.some((d) => d.length)) errores.push("No tiene ningún día con horario.");
  if (errores.length) return { ok: false, errores };
  return { ok: true, valor: { version: 1, plan: v.plan!, estado: migrar(structuredClone(st)) } };
}

// ---------------------------------------------------------------- Mensajes de la web real

const lineasItems = (items: Item[]) => items.map((i) => `• ${i.cant} × ${i.nombre}${i.opciones?.length ? ` (${i.opciones.join(", ")})` : ""}${i.nota ? ` — ${i.nota}` : ""}`);

export function mensajeReserva(st: Estado, r: Pick<Reserva, "fecha" | "hora" | "personas" | "nombre" | "tel" | "nota">) {
  const franja = franjasDel(st.local.horarios, r.fecha).find((f) => f.desde <= r.hora)?.nombre;
  return [
    `¡Hola ${st.local.nombre}! Quiero reservar una mesa.`,
    "",
    `Día: ${fechaLarga(r.fecha)}${franja ? ` (${franja.toLowerCase()})` : ""}`,
    `Hora: ${r.hora}`,
    `Somos: ${r.personas}`,
    `A nombre de: ${r.nombre}`,
    `Teléfono: ${r.tel}`,
    ...(r.nota ? [`Nota: ${r.nota}`] : []),
  ].join("\n");
}

export function mensajePedidoWeb(st: Estado, p: Pick<Pedido, "nombre" | "tel" | "hora" | "entrega" | "direccion" | "envio" | "items" | "pago" | "nota"> & { zona?: string }) {
  const subtotal = p.items.reduce((s, i) => s + i.precio * i.cant, 0);
  return [
    `¡Hola ${st.local.nombre}! Quiero hacer un pedido ${p.entrega === "envio" ? "con envío" : "para retirar"}.`,
    "",
    ...lineasItems(p.items),
    "",
    ...(p.envio ? [`Envío${p.zona ? ` a ${p.zona}` : ""}: ${plata(p.envio)}`] : []),
    `Total: ${plata(subtotal + p.envio)}`,
    `${p.entrega === "envio" ? "Para" : "Lo retiro"}: ${p.hora === "Cuanto antes" ? "cuanto antes" : `a las ${p.hora}`}`,
    ...(p.entrega === "envio" ? [`Dirección: ${p.direccion}`] : []),
    `Pago: ${MEDIOS[p.pago]}`,
    `A nombre de: ${p.nombre} (${p.tel})`,
    ...(p.nota ? [`Aclaración: ${p.nota}`] : []),
  ].join("\n");
}

export function mensajeEspera(st: Estado, e: { nombre: string; personas: number; tel: string }) {
  return `¡Hola ${st.local.nombre}! ¿Nos anotan en la lista de espera? Somos ${e.personas}, a nombre de ${e.nombre} (${e.tel}). Avísennos por acá cuando haya mesa.`;
}

// ---------------------------------------------------------------- Lo que se pide desde /resto

/** Lo que arma el cliente en /resto: con esto le preparamos su restaurante. */
export interface PedidoResto {
  version: 1;
  tipo: IdTipo;
  nombre: string;
  diseno: IdDiseno;
  plan: PlanResto;
}

export const PREFIJO_RESTO = "RS1.";

export const codificarPedidoResto = (p: PedidoResto) => codificar(PREFIJO_RESTO, p);
export const leerPedidoResto = (texto: string) => decodificar(PREFIJO_RESTO, texto.trim()) as Promise<PedidoResto | undefined>;

/** Link a la demo con lo que eligió (tipo, diseño y nombre). */
export function linkDemoResto(p: Pick<PedidoResto, "tipo" | "nombre"> & { diseno?: IdDiseno }) {
  const q = new URLSearchParams({ tipo: p.tipo });
  if (p.diseno) q.set("d", p.diseno);
  if (p.nombre.trim().length >= 2) q.set("nombre", p.nombre.trim());
  return `/resto/demo?${q}`;
}
