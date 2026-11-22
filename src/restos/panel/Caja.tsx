"use client";

import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { comision, resumenCaja } from "../lib/logica";
import { useResto } from "../lib/store";
import { ID_MEDIOS, MEDIOS, type Medio, type Movimiento, type TipoMov } from "../lib/tipos";
import { hora, pct, plata } from "../lib/util";
import { Cabecera, Cajon } from "./comun";

const OPCIONES_MEDIO = ID_MEDIOS.map((k) => (
  <option key={k} value={k}>
    {MEDIOS[k]}
  </option>
));

function Abrir() {
  const { st, act } = useResto();
  const [fondo, setFondo] = useState("");
  const ult = st.cierres[0];
  return (
    <div className="vista">
      <Cabecera et="Caja cerrada" titulo="Caja" />
      <form
        className="tarjeta abrir"
        onSubmit={(e) => {
          e.preventDefault();
          act.abrirCaja(Number(fondo) || 0);
        }}
      >
        <h3>Abrir la caja del turno</h3>
        <label className="campo">
          Efectivo con el que arrancás (cambio)
          <input type="number" min="0" value={fondo} onChange={(e) => setFondo(e.target.value)} placeholder="0" autoFocus />
        </label>
        <button className="btn btn-1">Abrir caja</button>
      </form>
      <Historial />
      {ult && <p className="nota-chica">Último cierre: {new Date(ult.cierre).toLocaleString("es-AR")}</p>}
    </div>
  );
}

function FilaMov({ m }: { m: Movimiento }) {
  const { st, act } = useResto();
  const [ed, setEd] = useState<{ concepto: string; monto: number; medio: Medio; tipo: TipoMov } | null>(null);
  if (ed)
    return (
      <li className="mv-edit">
        <input value={ed.concepto} onChange={(e) => setEd({ ...ed, concepto: e.target.value })} aria-label="Concepto" />
        <input type="number" min="0" value={ed.monto} onChange={(e) => setEd({ ...ed, monto: Number(e.target.value) || 0 })} aria-label="Monto" />
        <select value={ed.medio} onChange={(e) => setEd({ ...ed, medio: e.target.value as Medio })} aria-label="Forma de pago">
          {OPCIONES_MEDIO}
        </select>
        <select value={ed.tipo} onChange={(e) => setEd({ ...ed, tipo: e.target.value as TipoMov })} aria-label="Tipo">
          <option value="venta">Venta</option>
          <option value="ingreso">Ingreso</option>
          <option value="egreso">Gasto</option>
        </select>
        <span className="fila-btns">
          <button
            className="icono"
            onClick={() => {
              act.editarMovimiento(m.id, ed);
              setEd(null);
            }}
            aria-label="Guardar"
          >
            <Check size={16} />
          </button>
          <button className="icono" onClick={() => setEd(null)} aria-label="Cancelar">
            <X size={16} />
          </button>
        </span>
      </li>
    );
  const com = m.tipo === "venta" ? comision(st.local, m.medio, m.monto) : 0;
  return (
    <li className={m.tipo}>
      <span className="mv-hora">{hora(m.ts)}</span>
      <span className="mv-con">
        {m.concepto}
        <small>
          {MEDIOS[m.medio]}
          {com > 0 ? ` · comisión ${plata(com)}` : ""}
        </small>
      </span>
      <b>
        {m.tipo === "egreso" ? "− " : ""}
        {plata(m.monto)}
      </b>
      <span className="mv-acc">
        <button onClick={() => setEd({ concepto: m.concepto, monto: m.monto, medio: m.medio, tipo: m.tipo })} aria-label="Editar movimiento">
          <Pencil size={15} />
        </button>
        <button onClick={() => confirm("¿Borrar este movimiento?") && act.borrarMovimiento(m.id)} aria-label="Borrar movimiento">
          <Trash2 size={15} />
        </button>
      </span>
    </li>
  );
}

function Historial() {
  const { st } = useResto();
  if (!st.cierres.length) return null;
  return (
    <section className="tarjeta">
      <h3>Cierres anteriores</h3>
      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              <th>Turno</th>
              <th>Cobros</th>
              <th>Vendido</th>
              <th>Comisiones</th>
              <th>Gastos</th>
              <th>Neto</th>
              <th>Efectivo</th>
            </tr>
          </thead>
          <tbody>
            {st.cierres.map((c) => (
              <tr key={c.id}>
                <td>
                  {new Date(c.apertura).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })} {hora(c.apertura)}–{hora(c.cierre)}
                  {c.nota && <small> · {c.nota}</small>}
                </td>
                <td>{c.ventas}</td>
                <td>{plata(c.bruto)}</td>
                <td>− {plata(c.com)}</td>
                <td>− {plata(c.egresos)}</td>
                <td>
                  <b>{plata(c.neto - c.egresos)}</b>
                </td>
                <td className={c.diferencia === 0 ? "" : c.diferencia > 0 ? "pos" : "neg"}>{c.diferencia === 0 ? "Justo" : (c.diferencia > 0 ? "+ " : "− ") + plata(Math.abs(c.diferencia))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Caja() {
  const { st, act } = useResto();
  const [mov, setMov] = useState<{ tipo: TipoMov; concepto: string; monto: string; medio: Medio }>({ tipo: "egreso", concepto: "", monto: "", medio: "efectivo" });
  const [cerrando, setCerrando] = useState(false);
  const [contado, setContado] = useState("");
  const [nota, setNota] = useState("");
  const [fondo, setFondo] = useState<string | null>(null);
  if (!st.caja.abierta) return <Abrir />;

  const r = resumenCaja(st);
  const movs = [...st.caja.movs].sort((a, b) => b.ts - a.ts);
  const dif = (Number(contado) || 0) - r.efectivoEsperado;

  const cargar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mov.concepto.trim() || !(Number(mov.monto) > 0)) return;
    act.movimiento(mov.tipo, mov.concepto.trim(), Number(mov.monto), mov.medio);
    setMov({ ...mov, concepto: "", monto: "" });
  };

  return (
    <div className="vista">
      <Cabecera et={`Abierta a las ${hora(st.caja.apertura ?? 0)} · fondo ${plata(st.caja.fondo)}`} titulo="Caja">
        {fondo === null ? (
          <button className="btn btn-3" onClick={() => setFondo(String(st.caja.fondo))}>
            <Pencil size={15} /> Editar fondo
          </button>
        ) : (
          <form
            className="fila-btns fondo-form"
            onSubmit={(e) => {
              e.preventDefault();
              act.editarFondo(Number(fondo) || 0);
              setFondo(null);
            }}
          >
            <input type="number" min="0" value={fondo} onChange={(e) => setFondo(e.target.value)} aria-label="Fondo de caja" autoFocus />
            <button className="btn btn-1">Guardar</button>
          </form>
        )}
        <button className="btn btn-1" onClick={() => setCerrando(true)}>
          Cerrar caja
        </button>
      </Cabecera>
      {st.caja.autoabierta && <p className="aviso-caja">La caja se abrió sola con el primer cobro (fondo $ 0). Revisá el fondo antes de cerrar.</p>}

      <div className="kpis">
        <div className="kpi grande">
          <span>Vendido</span>
          <strong>{plata(r.bruto)}</strong>
          <small>
            {r.ventas} cobros · ticket promedio {plata(r.ticket)}
          </small>
        </div>
        <div className="kpi">
          <span>Comisiones MP</span>
          <strong className="neg">− {plata(r.com)}</strong>
          <small>sin IVA ni retenciones</small>
        </div>
        <div className="kpi">
          <span>Te queda limpio</span>
          <strong>{plata(r.neto - r.egresos)}</strong>
          <small>neto menos gastos ({plata(r.egresos)})</small>
        </div>
        <div className="kpi">
          <span>Efectivo en caja</span>
          <strong>{plata(r.efectivoEsperado)}</strong>
          <small>debería haber en el cajón</small>
        </div>
      </div>

      <div className="caja-grid">
        <section className="tarjeta">
          <h3>Por medio de pago</h3>
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Medio</th>
                  <th>Cobros</th>
                  <th>Bruto</th>
                  <th>Comisión</th>
                  <th>Neto</th>
                </tr>
              </thead>
              <tbody>
                {r.porMedio.map((m) => (
                  <tr key={m.medio}>
                    <td>
                      {MEDIOS[m.medio]} {st.local.comisiones[m.medio] > 0 && <small>({pct(st.local.comisiones[m.medio])})</small>}
                    </td>
                    <td>{m.cant}</td>
                    <td>{plata(m.bruto)}</td>
                    <td>{m.com ? "− " + plata(m.com) : "—"}</td>
                    <td>
                      <b>{plata(m.neto)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{r.ventas}</td>
                  <td>{plata(r.bruto)}</td>
                  <td>− {plata(r.com)}</td>
                  <td>
                    <b>{plata(r.neto)}</b>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <form className="tarjeta" onSubmit={cargar}>
          <h3>Cargar movimiento</h3>
          <div className="chips chico">
            {(
              [
                ["egreso", "Gasto / proveedor"],
                ["ingreso", "Ingreso"],
                ["venta", "Venta suelta"],
              ] as const
            ).map(([k, n]) => (
              <button type="button" key={k} className={mov.tipo === k ? "on" : ""} onClick={() => setMov({ ...mov, tipo: k })}>
                {n}
              </button>
            ))}
          </div>
          <div className="campos">
            <label>
              Concepto
              <input value={mov.concepto} onChange={(e) => setMov({ ...mov, concepto: e.target.value })} placeholder={mov.tipo === "egreso" ? "Verdulería, hielo, gas…" : "Detalle"} />
            </label>
            <label>
              Monto
              <input type="number" min="0" value={mov.monto} onChange={(e) => setMov({ ...mov, monto: e.target.value })} />
            </label>
            <label>
              Medio
              <select value={mov.medio} onChange={(e) => setMov({ ...mov, medio: e.target.value as Medio })}>
                {OPCIONES_MEDIO}
              </select>
            </label>
          </div>
          <button className="btn btn-1">Cargar</button>
        </form>
      </div>

      <section className="tarjeta">
        <h3>Movimientos del turno</h3>
        <ul className="movs">
          {movs.map((m) => (
            <FilaMov key={m.id} m={m} />
          ))}
          {!movs.length && <li className="vacio">Todavía no hay movimientos.</li>}
        </ul>
      </section>

      <Historial />

      {cerrando && (
        <Cajon titulo="Cierre de caja" cerrar={() => setCerrando(false)}>
          <dl className="cobro-cuentas">
            <div>
              <dt>Vendido</dt>
              <dd>{plata(r.bruto)}</dd>
            </div>
            <div className="com">
              <dt>Comisiones</dt>
              <dd>− {plata(r.com)}</dd>
            </div>
            <div className="com">
              <dt>Gastos</dt>
              <dd>− {plata(r.egresos)}</dd>
            </div>
            <div className="neto">
              <dt>Resultado del turno</dt>
              <dd>{plata(r.neto - r.egresos)}</dd>
            </div>
            <div>
              <dt>Efectivo esperado</dt>
              <dd>{plata(r.efectivoEsperado)}</dd>
            </div>
          </dl>
          <label className="campo">
            Efectivo contado en el cajón
            <input type="number" min="0" value={contado} onChange={(e) => setContado(e.target.value)} autoFocus />
          </label>
          {contado !== "" && <p className={"dif " + (dif === 0 ? "ok" : dif > 0 ? "pos" : "neg")}>{dif === 0 ? "Caja justa" : dif > 0 ? `Sobran ${plata(dif)}` : `Faltan ${plata(-dif)}`}</p>}
          <label className="campo">
            Nota (opcional)
            <input value={nota} onChange={(e) => setNota(e.target.value)} />
          </label>
          <div className="fila-btns">
            <button className="btn btn-2" onClick={() => setCerrando(false)}>
              Volver
            </button>
            <button
              className="btn btn-1"
              disabled={contado === ""}
              onClick={() => {
                const c = Number(contado) || 0;
                act.cerrarCaja({ bruto: r.bruto, com: r.com, neto: r.neto, egresos: r.egresos, ventas: r.ventas, esperado: r.efectivoEsperado, contado: c, diferencia: c - r.efectivoEsperado, porMedio: r.porMedio, nota });
                setCerrando(false);
              }}
            >
              Cerrar caja
            </button>
          </div>
        </Cajon>
      )}
    </div>
  );
}
