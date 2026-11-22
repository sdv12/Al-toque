/* Completa lo que les falta a los datos guardados con versiones anteriores. Puro: sirve en el navegador, en el servidor y en los scripts. */
import { completarSecciones, webDe } from "./contenidoWeb";
import { PERSONAL_DEMO, vacio } from "./semilla";
import type { Estado, Local } from "./tipos";

/** Completa lo que les falta a los datos guardados con una versión anterior (R1 → R2). */
export function migrar(st: Estado): Estado {
  const base = vacio(st.local.tipo);
  const l = st.local as Local & { pin?: string };
  l.zonas ??= base.local.zonas.slice(0, 1);
  l.promos ??= [];
  l.bloqueos ??= [];
  l.delivery.zonas ??= [];
  if (!l.personal?.length) l.personal = PERSONAL_DEMO.map((p, i) => ({ ...p, id: "p" + (i + 1), pin: i === 0 && l.pin ? l.pin : p.pin }));
  delete l.pin;
  const zona = l.zonas[0]?.id ?? "salon";
  st.mesas.forEach((m) => {
    m.zona ??= zona;
    m.unidaA ??= null;
  });
  l.web ??= webDe(l.tipo);
  l.web.secciones = completarSecciones(l.web);
  st.llamados ??= [];
  st.comandas ??= [];
  st.espera ??= [];
  st.ventas ??= [];
  return st;
}

