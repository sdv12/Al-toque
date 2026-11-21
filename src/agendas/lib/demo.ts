import type { Base } from "./store";
import { PROFESIONES, type IdProfesion } from "./profesiones";
import type { Db, Negocio, Servicio } from "./tipos";

/*
 * Link de demo compartible (/turnos/demo?demo=…): el negocio (sin logo ni PIN) y sus servicios en
 * base64url. Al abrirlo, la app arma la demo con esos datos y turnos de ejemplo.
 */

function aBase64Url(json: string): string {
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function codificarBase(negocio: Partial<Negocio>, servicios: Servicio[]): string {
  const n: Partial<Negocio> = { ...negocio };
  delete n.logo;
  delete n.pin;
  return aBase64Url(JSON.stringify({ n, s: servicios.map(({ id, nombre, duracion, precio, activo }) => ({ id, nombre, duracion, precio, activo })) }));
}

export const codificarDemo = (db: Db) => codificarBase(db.negocio, db.servicios);

export const decodificarDemo = (txt: string): Base => {
  const j = JSON.parse(decodeURIComponent(escape(atob(txt.replace(/-/g, "+").replace(/_/g, "/"))))) as { n: Partial<Negocio>; s: Servicio[] };
  return { negocio: j.n, servicios: j.s };
};

/** Demo de turnos con el nombre y el rubro de alguien (para llegar desde Alto). `pantalla`: "probar", "" (reserva) o "admin". */
export function linkDemoAgenda(nombre: string, profesion: IdProfesion, pantalla = "probar"): string {
  const servicios = PROFESIONES[profesion].servicios.map(([n, duracion, precio], i): Servicio => ({ id: `s${i}`, nombre: n, duracion, precio, activo: true }));
  return `/turnos/demo?demo=${codificarBase({ nombre: nombre.trim() || PROFESIONES[profesion].demo, profesion }, servicios)}#/${pantalla}`;
}
