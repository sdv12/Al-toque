"use client";

import { useEffect, useRef, useState } from "react";
import { formatWhen } from "../lib/dates";
import { EVENTO_RESPALDO, guardarCopia, leerRespaldo, recuperarCopia, ultimoRespaldo, type Respaldo as Copia } from "../lib/respaldo";
import Confirm from "./Confirm";
import { useToast } from "./Toast";

/**
 * "Copia de seguridad", al final de la Caja del día: guardar una copia (se comparte por WhatsApp,
 * Drive o mail, o se descarga) y recuperarla en este u otro equipo. Botones grandes y textos
 * simples: la usan personas mayores.
 */
export default function Respaldo({ negocio }: { negocio: string }) {
  const toast = useToast();
  const [ultimo, setUltimo] = useState<number | null | undefined>(undefined);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aRecuperar, setARecuperar] = useState<Copia | null>(null);
  const archivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const leer = () => void ultimoRespaldo().then((v) => setUltimo(v ?? null), () => setUltimo(null));
    leer();
    window.addEventListener(EVENTO_RESPALDO, leer);
    return () => window.removeEventListener(EVENTO_RESPALDO, leer);
  }, []);

  async function guardar() {
    setError(null);
    setOcupado(true);
    try {
      if (await guardarCopia(negocio)) toast("¡Listo! Copia guardada. Guardala en un lugar seguro (WhatsApp, Drive o mail).");
    } catch {
      setError("No se pudo armar la copia. Probá de nuevo.");
    }
    setOcupado(false);
  }

  async function elegido(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const r = leerRespaldo(await f.text());
    if (!r.ok) return setError(r.error);
    setError(null);
    setARecuperar(r.respaldo);
  }

  async function recuperar(c: Copia) {
    setARecuperar(null);
    setOcupado(true);
    try {
      await recuperarCopia(c);
      // Se recarga para que todas las pantallas lean lo recuperado.
      window.location.reload();
    } catch {
      setOcupado(false);
      setError("No se pudo recuperar la copia. No se cambió nada.");
    }
  }

  return (
    <section aria-labelledby="respaldo-titulo" className="rounded-3xl border-2 border-borde bg-white p-4">
      <h2 id="respaldo-titulo" className="text-2xl font-extrabold">
        Copia de seguridad
      </h2>
      <p className="mt-1 text-lg text-gris">
        Todo se guarda en este equipo. Si se rompe o se pierde, con una copia recuperás tus productos, precios, ventas y fiados.
      </p>
      <p className="mt-2 text-lg font-semibold">
        {ultimo === undefined ? " " : ultimo ? `Última copia: ${formatWhen(ultimo).toLowerCase()}` : "Todavía no guardaste ninguna copia."}
      </p>
      <div className="mt-4 grid gap-3">
        <button type="button" disabled={ocupado} onClick={guardar} className="min-h-16 rounded-2xl bg-acento px-4 text-xl font-bold text-white disabled:opacity-50">
          💾 Guardar una copia
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={() => archivo.current?.click()}
          className="min-h-16 rounded-2xl border-2 border-borde px-4 text-xl font-bold disabled:opacity-50"
        >
          Recuperar desde una copia
        </button>
        <input ref={archivo} type="file" accept="application/json,.json" onChange={elegido} className="sr-only" tabIndex={-1} aria-label="Elegir el archivo de la copia" />
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-2xl bg-rojo/10 p-3 text-lg font-semibold text-rojo">
          {error}
        </p>
      )}
      {aRecuperar && (
        <Confirm
          question="¿Recuperar esta copia?"
          detail={`Es de ${aRecuperar.negocio}, del ${formatWhen(aRecuperar.creado).toLowerCase()}. Lo que hay ahora en este equipo se reemplaza por lo de la copia.`}
          yesLabel="Sí, recuperar"
          onNo={() => setARecuperar(null)}
          onYes={() => recuperar(aRecuperar)}
        />
      )}
    </section>
  );
}
