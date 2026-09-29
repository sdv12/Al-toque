"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { LandingConfig } from "../schema/landing-config";
import { crearDemoAdapter } from "./demo";
import type { DataAdapter } from "./types";

const AdapterContext = createContext<DataAdapter | null>(null);

/**
 * Inyecta el adaptador de datos. Sin `adapter` explícito usa el DemoAdapter de la config;
 * en fase 2 la página pasa el SupabaseAdapter y los componentes no se enteran.
 */
export function AdapterProvider({
  config,
  adapter,
  children,
}: {
  config: LandingConfig;
  adapter?: DataAdapter;
  children: ReactNode;
}) {
  const valor = useMemo(() => adapter ?? crearDemoAdapter(config), [adapter, config]);
  return <AdapterContext.Provider value={valor}>{children}</AdapterContext.Provider>;
}

export function useAdapter(): DataAdapter {
  const adapter = useContext(AdapterContext);
  if (!adapter) throw new Error("useAdapter necesita un <AdapterProvider> arriba en el árbol");
  return adapter;
}
