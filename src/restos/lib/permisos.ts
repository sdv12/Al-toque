/* Qué puede ver cada persona del equipo en el panel, según su rol. */
import type { Rol } from "./tipos";

export type IdSeccion = "salon" | "cocina" | "reservas" | "pedidos" | "caja" | "numeros" | "carta" | "web" | "ajustes";

export const PERMISOS: Record<Rol, IdSeccion[]> = {
  encargado: ["salon", "cocina", "reservas", "pedidos", "caja", "numeros", "carta", "web", "ajustes"],
  mozo: ["salon", "cocina", "reservas", "pedidos", "carta"],
  cocina: ["cocina", "carta"],
  caja: ["salon", "reservas", "pedidos", "caja", "carta"],
};

export const puede = (rol: Rol, sec: IdSeccion) => PERMISOS[rol].includes(sec);

/** En la carta, solo el encargado edita platos y precios; el resto marca lo que se terminó. */
export const editaCarta = (rol: Rol) => rol === "encargado";
