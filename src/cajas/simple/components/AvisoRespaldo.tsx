"use client";

import { useEffect, useState } from "react";
import type { Sale } from "../lib/types";
import { EVENTO_RESPALDO, diasDesde, guardarCopia, necesitaRecordatorio, ultimoRespaldo } from "../lib/respaldo";
import { useToast } from "./Toast";

/**
 * Recordatorio amable, arriba de todo: si hay ventas y pasó una semana sin guardar una copia. Un
 * toque la guarda; "Ahora no" lo esconde hasta mañana.
 */
const CLAVE_POSPUESTO = "caja:respaldo-pospuesto";

export default function AvisoRespaldo({ negocio, sales }: { negocio: string; sales: Sale[] }) {
  const toast = useToast();
  const [ultimo, setUltimo] = useState<number | null | undefined>(undefined);
  const [ahora] = useState(() => Date.now());
  const [pospuesto, setPospuesto] = useState(() => {
    try {
      return Number(localStorage.getItem(CLAVE_POSPUESTO) ?? 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const leer = () => void ultimoRespaldo().then((v) => setUltimo(v ?? null), () => setUltimo(null));
    leer();
    window.addEventListener(EVENTO_RESPALDO, leer);
    return () => window.removeEventListener(EVENTO_RESPALDO, leer);
  }, []);

  if (ultimo === undefined || ahora < pospuesto) return null;
  const primeraVenta = sales.length ? Math.min(...sales.map((s) => s.createdAt)) : undefined;
  if (!necesitaRecordatorio(ultimo ?? undefined, primeraVenta, ahora)) return null;
  const dias = diasDesde(Math.max(ultimo ?? 0, primeraVenta ?? ahora), ahora);

  return (
    <div role="status" className="mx-3 mt-3 rounded-3xl border-2 border-acento bg-acento-claro p-4">
      <p className="text-xl font-bold leading-snug">
        {ultimo ? `Hace ${dias} días que no guardás una copia de la caja.` : "Todavía no guardaste una copia de la caja."}
      </p>
      <p className="mt-1 text-lg">Si este equipo se rompe o se pierde, con la copia no perdés nada.</p>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
        <button
          type="button"
          onClick={async () => {
            if (await guardarCopia(negocio).catch(() => false)) toast("¡Listo! Copia guardada.");
          }}
          className="min-h-14 rounded-2xl bg-acento px-4 text-xl font-bold text-white"
        >
          💾 Guardar una copia
        </button>
        <button
          type="button"
          onClick={() => {
            const hasta = Date.now() + 86_400_000;
            try {
              localStorage.setItem(CLAVE_POSPUESTO, String(hasta));
            } catch {}
            setPospuesto(hasta);
          }}
          className="min-h-14 rounded-2xl border-2 border-borde px-4 text-lg font-bold"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
