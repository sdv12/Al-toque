"use client";

import { useEffect, useState } from "react";
import App from "./App";
import { ModoProvider } from "./lib/modo";
import type { RestoPublicado } from "./lib/publicado";
import { StoreProvider } from "./lib/store";

const enPanel = () => location.hash.startsWith("#/panel");

/**
 * La web de un restaurante publicado (/r/<slug>).
 * - La web pública muestra siempre lo publicado y no guarda nada en el navegador de quien la visita.
 * - El panel (#/panel) trabaja en el equipo del local: arranca con lo publicado y guarda ahí.
 */
export default function RaizCliente({ slug, publicado }: { slug: string; publicado: RestoPublicado }) {
  const [panel, setPanel] = useState(enPanel);
  useEffect(() => {
    const on = () => setPanel(enPanel());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const tipo = publicado.estado.local.tipo;
  return (
    <ModoProvider value={{ tipo: "cliente", slug, plan: publicado.plan }}>
      {panel ? (
        <StoreProvider key="panel" id={`cliente-${slug}`} tipo={tipo} semillaPropia={publicado.estado}>
          <App tipo={tipo} cambiarTipo={() => {}} demo={false} />
        </StoreProvider>
      ) : (
        <StoreProvider key="web" id={`web-${slug}`} tipo={tipo} inicial={publicado.estado} soloLectura>
          <App tipo={tipo} cambiarTipo={() => {}} demo={false} />
        </StoreProvider>
      )}
    </ModoProvider>
  );
}
