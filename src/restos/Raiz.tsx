"use client";

import { useState } from "react";
import App from "./App";
import { esTipo } from "./lib/locales";
import { StoreProvider } from "./lib/store";
import { ID_DISENOS, type Estado, type IdDiseno, type IdTipo } from "./lib/tipos";

/**
 * La demo de Resto al toque: /resto/demo?tipo=parrilla&d=brasa&nombre=La%20Leña.
 * Cada tipo guarda su restaurante de ejemplo aparte, así se puede ir y volver entre tipos.
 */
export default function Raiz() {
  const [inicio] = useState(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get("tipo");
    const d = q.get("d");
    return {
      tipo: (esTipo(t) ? t : "bodegon") as IdTipo,
      diseno: ID_DISENOS.includes(d as IdDiseno) ? (d as IdDiseno) : null,
      nombre: (q.get("nombre") ?? "").trim().slice(0, 40),
      /** Vista previa dentro del editor de la web: sin la barra de la demo. */
      previa: q.get("vista") === "previa",
    };
  });
  const [tipo, setTipo] = useState<IdTipo>(inicio.tipo);
  // Los parámetros del link se aplican una sola vez, al primer restaurante que se abre.
  const [usados, setUsados] = useState(false);

  const preparar = (st: Estado): Estado => {
    if (usados || tipo !== inicio.tipo) return st;
    if (inicio.diseno) st.local.diseno = inicio.diseno;
    if (inicio.nombre.length >= 2) st.local.nombre = inicio.nombre;
    return st;
  };

  const cambiarTipo = (t: IdTipo) => {
    setUsados(true);
    setTipo(t);
    const q = new URLSearchParams(location.search);
    q.set("tipo", t);
    q.delete("d");
    q.delete("nombre");
    history.replaceState(null, "", `${location.pathname}?${q}${location.hash}`);
  };

  return (
    <StoreProvider key={tipo} id={`demo-${tipo}`} tipo={tipo} preparar={preparar} soloLectura={inicio.previa}>
      <App tipo={tipo} cambiarTipo={cambiarTipo} demo barra={!inicio.previa} />
    </StoreProvider>
  );
}
