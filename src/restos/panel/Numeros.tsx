"use client";

import { useState } from "react";
import { numeros } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import { MEDIOS } from "../lib/tipos";
import { fechaCorta, hoyISO, plata, sumarDias, fechaDe } from "../lib/util";
import { Cabecera } from "./comun";

const RANGOS = [
  { id: "hoy", nombre: "Hoy", dias: 0 },
  { id: "7", nombre: "Últimos 7 días", dias: 7 },
  { id: "30", nombre: "Últimos 30 días", dias: 30 },
] as const;

/** Barra horizontal con su valor (sin librerías de gráficos). */
function Barras({ filas, formato = plata, tope }: { filas: { nombre: string; valor: number; detalle?: string }[]; formato?: (n: number) => string; tope?: number }) {
  const max = Math.max(1, tope ?? 0, ...filas.map((f) => f.valor));
  return (
    <ul className="barras">
      {filas.map((f) => (
        <li key={f.nombre}>
          <span className="barras-nombre">{f.nombre}</span>
          <span className="barras-barra" aria-hidden>
            <i style={{ width: (f.valor / max) * 100 + "%" }} />
          </span>
          <b>{formato(f.valor)}</b>
          {f.detalle && <small>{f.detalle}</small>}
        </li>
      ))}
      {!filas.length && <li className="vacio">Sin datos en este período.</li>}
    </ul>
  );
}

/** Números del restaurante a partir de las ventas cerradas (mesas cobradas y pedidos pagados). */
export default function Numeros() {
  const { st } = useResto();
  const ahora = useAhora();
  const [rango, setRango] = useState<(typeof RANGOS)[number]["id"]>("7");
  const r = RANGOS.find((x) => x.id === rango)!;
  const hoy = hoyISO(new Date(ahora));
  const desde = fechaDe(sumarDias(hoy, -r.dias)).getTime();
  const hasta = fechaDe(sumarDias(hoy, 1)).getTime();
  const n = numeros(st.ventas, desde, hasta);
  // El período anterior del mismo largo, para comparar.
  const antes = r.dias ? numeros(st.ventas, fechaDe(sumarDias(hoy, -2 * r.dias)).getTime(), desde) : numeros(st.ventas, fechaDe(sumarDias(hoy, -7)).getTime(), fechaDe(sumarDias(hoy, -6)).getTime());
  const variacion = antes.total ? Math.round(((n.total - antes.total) / antes.total) * 100) : null;
  const nombre = (id: string) => st.local.personal.find((p) => p.id === id)?.nombre ?? "Sin asignar";
  const menos = [...n.platos].sort((a, b) => a.cant - b.cant).slice(0, 5);

  return (
    <div className="vista">
      <Cabecera et="Lo que se vendió" titulo="Números">
        <div className="chips" role="tablist" aria-label="Período">
          {RANGOS.map((x) => (
            <button key={x.id} role="tab" aria-selected={rango === x.id} className={rango === x.id ? "on" : ""} onClick={() => setRango(x.id)}>
              {x.nombre}
            </button>
          ))}
        </div>
      </Cabecera>

      <div className="kpis">
        <div className="kpi grande">
          <span>Vendido</span>
          <strong>{plata(n.total)}</strong>
          <small>
            {variacion === null ? "sin período anterior para comparar" : `${variacion >= 0 ? "+" : ""}${variacion} % ${r.dias ? `que los ${r.dias} días anteriores` : "que el mismo día de la semana pasada"}`}
          </small>
        </div>
        <div className="kpi">
          <span>Ticket promedio</span>
          <strong>{plata(n.ticket)}</strong>
          <small>
            {n.mesas} mesas · {n.pedidos} pedidos
          </small>
        </div>
        <div className="kpi">
          <span>Por persona</span>
          <strong>{plata(n.porPersona)}</strong>
          <small>{n.personas} personas en el salón</small>
        </div>
        <div className="kpi">
          <span>Propinas</span>
          <strong>{plata(n.propinas)}</strong>
          <small>descuentos: {plata(n.descuentos)}</small>
        </div>
      </div>

      {r.dias > 0 && (
        <section className="tarjeta">
          <h3>Día por día</h3>
          <div className="columnas" role="img" aria-label="Ventas por día">
            {n.porDia.map((d) => {
              const max = Math.max(1, ...n.porDia.map((x) => x.total));
              return (
                <div key={d.fecha} className="columna" title={`${fechaCorta(d.fecha)}: ${plata(d.total)} (${d.ventas} ventas)`}>
                  <span className="columna-barra">
                    <i style={{ height: (d.total / max) * 100 + "%" }} />
                  </span>
                  <small>{fechaCorta(d.fecha).split(" ").slice(0, 2).join(" ")}</small>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="caja-grid">
        <section className="tarjeta">
          <h3>Lo que más sale</h3>
          <Barras filas={n.platos.slice(0, 10).map((p) => ({ nombre: p.nombre, valor: p.cant, detalle: plata(p.total) }))} formato={(x) => `${x} u.`} />
        </section>
        <section className="tarjeta">
          <h3>Por turno</h3>
          <Barras filas={n.porFranja.map((f) => ({ nombre: f.nombre, valor: f.total, detalle: `${f.ventas} ventas` }))} />
          {st.local.modulos.salon && (
            <>
              <h3>Por mozo</h3>
              <Barras filas={n.porMozo.map((m) => ({ nombre: nombre(m.id), valor: m.total, detalle: `${m.ventas} mesas · ${m.personas} personas` }))} />
            </>
          )}
          <h3>Cómo pagaron</h3>
          <Barras filas={n.porMedio.map((m) => ({ nombre: MEDIOS[m.medio], valor: m.total }))} />
        </section>
      </div>

      {menos.length > 0 && (
        <section className="tarjeta">
          <h3>Lo que menos sale</h3>
          <p className="nota-chica">Para revisar la carta: quizás hay que cambiarles el precio, la descripción o sacarlos.</p>
          <Barras filas={menos.map((p) => ({ nombre: p.nombre, valor: p.cant, detalle: plata(p.total) }))} formato={(x) => `${x} u.`} tope={n.platos[0]?.cant} />
        </section>
      )}
      <p className="nota-chica">Cuentan las mesas cobradas y los pedidos pagados. En la demo hay cuatro semanas de ventas inventadas.</p>
    </div>
  );
}
