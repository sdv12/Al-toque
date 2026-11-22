"use client";

import { Check, ChefHat, Flame, Wine } from "lucide-react";
import { useState } from "react";
import { useAhora, useResto } from "../lib/store";
import type { Comanda, EstadoComanda } from "../lib/tipos";
import { minutosDesde } from "../lib/util";
import { Cabecera } from "./comun";

const COLS: { id: EstadoComanda; nombre: string; sig: EstadoComanda; accion: string }[] = [
  { id: "nueva", nombre: "Entraron", sig: "preparando", accion: "Empezar" },
  { id: "preparando", nombre: "Preparando", sig: "lista", accion: "Está lista" },
  { id: "lista", nombre: "Para servir", sig: "entregada", accion: "Salió" },
];

/** Minutos que pasan antes de marcar una comanda como demorada. */
const DEMORA = 15;
const MUY_DEMORADA = 25;

function Ticket({ c, ahora }: { c: Comanda; ahora: number }) {
  const { st, act } = useResto();
  const col = COLS.find((x) => x.id === c.estado)!;
  const min = minutosDesde(c.creada, ahora);
  const mozo = c.mozo ? st.local.personal.find((p) => p.id === c.mozo)?.nombre : null;
  const tarde = c.estado !== "lista" && min >= DEMORA;
  return (
    <article className={"ticket" + (tarde ? (min >= MUY_DEMORADA ? " muy-tarde" : " tarde") : "")}>
      <header>
        <b>{c.origen}</b>
        <span className="ticket-min">
          {tarde && <Flame size={14} />} {min} min
        </span>
      </header>
      {mozo && <small className="ticket-mozo">{mozo}</small>}
      <ul>
        {c.items.map((i, k) => (
          <li key={k}>
            <b>{i.cant}×</b>
            <span>
              {i.nombre}
              {i.opciones?.length ? <em>{i.opciones.join(" · ")}</em> : null}
              {i.nota ? <em className="ticket-nota">“{i.nota}”</em> : null}
            </span>
          </li>
        ))}
      </ul>
      <button className="btn btn-1 ancho" onClick={() => act.estadoComanda(c.id, col.sig)}>
        {c.estado === "lista" ? <Check size={16} /> : null} {c.pedidoId && c.estado === "lista" ? "Entregado" : col.accion}
      </button>
    </article>
  );
}

/** La pantalla de comandas para la cocina y la barra (sirve en una tablet aparte, en otra pestaña). */
export default function Cocina() {
  const ahora = useAhora(15_000);
  const { st } = useResto();
  const hayBarra = st.categorias.some((c) => c.barra);
  const [destino, setDestino] = useState<Comanda["destino"]>("cocina");
  const activas = st.comandas.filter((c) => c.estado !== "entregada");
  const de = (d: Comanda["destino"]) => activas.filter((c) => c.destino === d);
  const lista = de(destino);
  const salieron = st.comandas.filter((c) => c.destino === destino && c.estado === "entregada" && ahora - c.creada < 3 * 3600_000).length;

  return (
    <div className="vista cocina">
      <Cabecera et={`${lista.length} comandas en curso · ${salieron} salieron en las últimas 3 horas`} titulo={destino === "barra" ? "Barra" : "Cocina"}>
        {hayBarra && (
          <div className="chips" role="tablist" aria-label="Cocina o barra">
            <button role="tab" aria-selected={destino === "cocina"} className={destino === "cocina" ? "on" : ""} onClick={() => setDestino("cocina")}>
              <ChefHat size={15} /> Cocina {de("cocina").length ? `(${de("cocina").length})` : ""}
            </button>
            <button role="tab" aria-selected={destino === "barra"} className={destino === "barra" ? "on" : ""} onClick={() => setDestino("barra")}>
              <Wine size={15} /> Barra {de("barra").length ? `(${de("barra").length})` : ""}
            </button>
          </div>
        )}
      </Cabecera>
      <p className="nota-chica">
        Llega solo lo que el mozo manda desde la mesa y los pedidos que pasan a cocina. Las que pasan los {DEMORA} minutos se marcan en naranja; los {MUY_DEMORADA}, en rojo. Abrila en una tablet o en otra pestaña: se actualiza sola.
      </p>
      <div className="tablero tablero-cocina">
        {COLS.map((col) => {
          const cs = lista.filter((c) => c.estado === col.id).sort((a, b) => a.creada - b.creada);
          return (
            <section key={col.id} className={"col col-" + col.id}>
              <h2>
                {col.nombre} <span>{cs.length}</span>
              </h2>
              {cs.map((c) => (
                <Ticket key={c.id} c={c} ahora={ahora} />
              ))}
              {!cs.length && <p className="vacio">—</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}
