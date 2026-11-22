import { linkDemoAgenda } from "@/agendas/lib/demo";
import { linkDemoResto } from "@/restos/lib/publicado";
import { esTipo } from "@/restos/lib/locales";
import type { IdTipo } from "@/restos/lib/tipos";
import { RUBROS } from "../_alto/alto";

/** Links y mensajes de "Mandar una demo" (/adm): la demo sale con el nombre y el rubro del negocio. */

export type Producto = "web" | "turnos" | "caja" | "resto";
export const PRODUCTOS: Record<Producto, string> = { web: "Página web", turnos: "Turnos", caja: "Caja", resto: "Resto" };

/** `tipoResto`: para Resto, el tipo de local de la demo (bodegón, parrilla, café…). */
export function linkDemo(producto: Producto, rubroId: string, nombre: string, tipoResto: IdTipo = "bodegon"): string | null {
  const r = RUBROS.find((x) => x.id === rubroId);
  if (!r) return null;
  const n = nombre.trim();
  if (producto === "web") return `/configurador?${new URLSearchParams({ plantilla: r.plantilla, ...(n.length >= 2 && { nombre: n }) })}`;
  if (producto === "turnos") return r.profesion ? linkDemoAgenda(n, r.profesion, "") : null;
  if (producto === "resto") return r.id === "gastronomia" ? linkDemoResto({ tipo: esTipo(tipoResto) ? tipoResto : "bodegon", nombre: n }) : null;
  return r.caja ? `/caja?${new URLSearchParams({ rubro: r.caja, ...(n.length >= 2 && { nombre: n }) })}` : null;
}

export function mensajeDemo(producto: Producto, nombre: string, url: string): string {
  const para = nombre.trim() ? ` para ${nombre.trim()}` : "";
  const que = producto === "web" ? "tu página web" : producto === "turnos" ? "tu agenda de turnos online" : producto === "resto" ? "la web y el panel de tu local, con la carta y las reservas" : "la caja de tu negocio";
  return `¡Hola! Te armé una demo de cómo quedaría ${que}${para} 👇\n${url}\nEntrá y probala con tranquilidad, no hace falta registrarse. Si te gusta, lo dejamos andando con tus datos.`;
}
