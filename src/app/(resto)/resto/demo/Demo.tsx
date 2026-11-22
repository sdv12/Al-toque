"use client";

import dynamic from "next/dynamic";

/** Solo en el navegador: la app arranca leyendo localStorage y la URL (#/panel, ?tipo=, ?d=, ?nombre=). */
const App = dynamic(() => import("@/restos/Raiz"), {
  ssr: false,
  loading: () => <p style={{ padding: "2rem", fontFamily: "system-ui" }}>Cargando…</p>,
});

export function Demo() {
  return <App />;
}
