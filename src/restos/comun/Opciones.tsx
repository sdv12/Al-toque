"use client";

import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { extraOpciones, precioVigente } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import type { Item, Plato } from "../lib/tipos";
import { plata } from "../lib/util";

/** Arma la línea de un plato con las opciones elegidas y el precio de ahora (con promo). */
export function lineaDe(local: Parameters<typeof precioVigente>[0], p: Plato, ahora: Date, opciones: string[] = [], nota = ""): Pick<Item, "platoId" | "nombre" | "precio" | "opciones" | "nota"> {
  const { precio } = precioVigente(local, p, ahora, extraOpciones(p, opciones));
  return { platoId: p.id, nombre: p.nombre, precio, ...(opciones.length ? { opciones } : {}), ...(nota.trim() ? { nota: nota.trim() } : {}) };
}

/**
 * Elegir las opciones de un plato (punto, guarnición, tamaño), cuántos y una aclaración.
 * Se usa en la web (al pedir) y en el panel (al sumar a una mesa o pedido).
 */
export default function ElegirOpciones({ plato, conNota = true, accion = "Agregar", onElegir, cerrar }: { plato: Plato; conNota?: boolean; accion?: string; onElegir: (linea: ReturnType<typeof lineaDe>, cant: number) => void; cerrar: () => void }) {
  const { st } = useResto();
  const ahora = new Date(useAhora());
  const grupos = plato.opciones ?? [];
  const [elegidas, setElegidas] = useState<string[]>(() => grupos.map((g) => g.valores[0]?.nombre ?? ""));
  const [cant, setCant] = useState(1);
  const [nota, setNota] = useState("");
  const linea = lineaDe(st.local, plato, ahora, grupos.length ? elegidas : [], nota);
  const { promo, lista } = precioVigente(st.local, plato, ahora, extraOpciones(plato, elegidas));

  return (
    <div className="capa capa-centro" onClick={cerrar}>
      <div className="opciones" role="dialog" aria-modal="true" aria-label={`Opciones de ${plato.nombre}`} onClick={(e) => e.stopPropagation()}>
        <div className="bolsa-cab">
          <h3>
            {plato.nombre}
            {plato.desc && <small>{plato.desc}</small>}
          </h3>
          <button type="button" onClick={cerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {grupos.map((g, i) => (
          <fieldset key={g.nombre} className="op-grupo">
            <legend>{g.nombre}</legend>
            <div className="chips">
              {g.valores.map((v) => (
                <button
                  type="button"
                  key={v.nombre}
                  role="radio"
                  aria-checked={elegidas[i] === v.nombre}
                  className={elegidas[i] === v.nombre ? "on" : ""}
                  onClick={() => setElegidas(elegidas.map((x, j) => (j === i ? v.nombre : x)))}
                >
                  {v.nombre}
                  {v.extra !== 0 && <small> {v.extra > 0 ? "+" : "−"} {plata(Math.abs(v.extra))}</small>}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
        {conNota && (
          <label className="campo">
            Aclaración <small>(opcional)</small>
            <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Sin cebolla, bien caliente…" maxLength={80} />
          </label>
        )}
        <div className="op-pie">
          <span className="contador chico">
            <button type="button" onClick={() => setCant(Math.max(1, cant - 1))} aria-label="Uno menos">
              <Minus size={14} />
            </button>
            <output>{cant}</output>
            <button type="button" onClick={() => setCant(cant + 1)} aria-label="Uno más">
              <Plus size={14} />
            </button>
          </span>
          <button
            type="button"
            className="btn btn-1"
            onClick={() => {
              onElegir(linea, cant);
              cerrar();
            }}
          >
            {accion} · {plata(linea.precio * cant)}
            {promo && <s className="op-lista">{plata(lista * cant)}</s>}
          </button>
        </div>
      </div>
    </div>
  );
}
