"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Preseleccion } from "@/core/lib/reserva";
import type { ConfigDe } from "@/core/schema/landing-config";

// El panel (Radix, fechas, lógica de turnos) se descarga recién cuando alguien quiere reservar.
const DrawerReserva = dynamic(() => import("./DrawerReserva").then((m) => m.DrawerReserva), { ssr: false });

type Valor = {
  abrir: (pre?: Preseleccion) => void;
};

const ReservaContext = createContext<Valor | null>(null);

/**
 * Estado del panel de reserva de la barbería. Cualquier botón de la página lo abre, con
 * barbero o servicio ya elegidos si corresponde. El panel se monta dentro de la raíz de la
 * plantilla (hereda los tokens y funciona dentro del preview del configurador).
 */
export function ReservaProvider({ config, children }: { config: ConfigDe<"barberia">; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const [preseleccion, setPreseleccion] = useState<Preseleccion>({});
  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null);
  // Cambia en cada apertura para que el flujo arranque de cero.
  const [apertura, setApertura] = useState(0);

  const abrir = useCallback((pre: Preseleccion = {}) => {
    setPreseleccion(pre);
    setApertura((n) => n + 1);
    setAbierto(true);
  }, []);

  const valor = useMemo(() => ({ abrir }), [abrir]);

  return (
    <ReservaContext.Provider value={valor}>
      {children}
      <div ref={setContenedor} />
      {apertura > 0 && (
        <DrawerReserva
          key={apertura}
          config={config}
          abierto={abierto}
          onAbiertoChange={setAbierto}
          preseleccion={preseleccion}
          contenedor={contenedor}
        />
      )}
    </ReservaContext.Provider>
  );
}

export function useReserva(): Valor {
  const valor = useContext(ReservaContext);
  if (!valor) throw new Error("useReserva necesita <ReservaProvider>");
  return valor;
}
