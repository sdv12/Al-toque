"use client";

/*
 * Demo o restaurante real. En la demo todo pasa en el navegador (la web y el panel comparten los
 * datos). En la web de un cliente (/r/<slug>), mientras no haya nube, las reservas y los pedidos se
 * mandan por WhatsApp al restaurante y la web muestra lo publicado.
 */
import { createContext, useContext } from "react";
import type { PlanResto } from "./publicado";

export type Modo = { tipo: "demo" } | { tipo: "cliente"; slug: string; plan: PlanResto };

const ModoCtx = createContext<Modo>({ tipo: "demo" });
export const ModoProvider = ModoCtx.Provider;
export const useModo = () => useContext(ModoCtx);
export const esCliente = (m: Modo) => m.tipo === "cliente";
