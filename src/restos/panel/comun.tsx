"use client";

import { Plus, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import ElegirOpciones, { lineaDe } from "../comun/Opciones";
import { comision, precioVigente, saleHoy } from "../lib/logica";
import { useAhora, useResto } from "../lib/store";
import { ID_MEDIOS, MEDIOS, type Medio, type Plato } from "../lib/tipos";
import { pct, plata } from "../lib/util";

/** Panel lateral (cajón) con su encabezado. */
export function Cajon({ titulo, sub, ancho, cerrar, children }: { titulo: ReactNode; sub?: ReactNode; ancho?: boolean; cerrar: () => void; children: ReactNode }) {
  return (
    <div className="capa" onClick={cerrar}>
      <aside className={"cajon" + (ancho ? " ancho" : "")} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={typeof titulo === "string" ? titulo : undefined}>
        <div className="bolsa-cab">
          <h3>
            {titulo} {sub && <small>{sub}</small>}
          </h3>
          <button type="button" onClick={cerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export type Linea = ReturnType<typeof lineaDe>;

/** Lista de la carta para sumar platos a una mesa o a un pedido (con sus opciones y la promo de ahora). */
export function Selector({ onSumar, soloLlevar }: { onSumar: (linea: Linea, cant: number) => void; soloLlevar?: boolean }) {
  const { st } = useResto();
  const ahora = new Date(useAhora());
  const [cat, setCat] = useState(st.categorias[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [eligiendo, setEligiendo] = useState<Plato | null>(null);
  const [ultimo, setUltimo] = useState("");
  const sumar = (p: Plato) => {
    if (p.opciones?.length) return setEligiendo(p);
    onSumar(lineaDe(st.local, p, ahora), 1);
    setUltimo(p.id);
  };
  const lista = st.platos.filter((p) => (soloLlevar ? p.llevar : true) && (q ? p.nombre.toLowerCase().includes(q.toLowerCase()) : p.cat === cat));

  return (
    <div className="sel">
      <label className="sel-buscar">
        <Search size={16} />
        <input placeholder="Buscar plato…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar plato" />
      </label>
      {!q && (
        <div className="chips chico">
          {st.categorias.map((c) => (
            <button key={c.id} type="button" className={c.id === cat ? "on" : ""} onClick={() => setCat(c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>
      )}
      <ul className="sel-lista">
        {lista.map((p) => (
          <li key={p.id}>
            <button type="button" disabled={!p.disponible || !saleHoy(p, ahora)} onClick={() => sumar(p)} className={ultimo === p.id ? "recien" : ""}>
              <span>
                {p.nombre}
                {!p.disponible && <small> · se terminó</small>}
                {p.disponible && !saleHoy(p, ahora) && <small> · hoy no sale</small>}
                {p.opciones?.length ? <small> · con opciones</small> : null}
              </span>
              <b>
                {precioVigente(st.local, p, ahora).promo && <s>{plata(p.precio)}</s>} {plata(precioVigente(st.local, p, ahora).precio)}
              </b>
              <Plus size={16} />
            </button>
          </li>
        ))}
        {!lista.length && <li className="vacio">Sin resultados</li>}
      </ul>
      {eligiendo && (
        <ElegirOpciones
          plato={eligiendo}
          onElegir={(linea, cant) => {
            onSumar(linea, cant);
            setUltimo(eligiendo.id);
          }}
          cerrar={() => setEligiendo(null)}
        />
      )}
    </div>
  );
}

/** Elegir medio de pago: muestra la comisión de Mercado Pago y lo que entra limpio. */
export function Cobro({ total, conPropina, inicial = "efectivo", onCobrar, onCancelar }: { total: number; conPropina?: boolean; inicial?: Medio; onCobrar: (medio: Medio, propina: number) => void; onCancelar: () => void }) {
  const { st } = useResto();
  const [medio, setMedio] = useState<Medio>(inicial);
  const [propina, setPropina] = useState(0);
  const bruto = total + (Number(propina) || 0);
  const com = comision(st.local, medio, bruto);
  const tasa = st.local.comisiones[medio] || 0;

  return (
    <div className="cobro">
      <div className="cobro-medios">
        {ID_MEDIOS.map((k) => (
          <button type="button" key={k} className={k === medio ? "on" : ""} aria-pressed={k === medio} onClick={() => setMedio(k)}>
            {MEDIOS[k]}
            {st.local.comisiones[k] > 0 && <small>{pct(st.local.comisiones[k])}</small>}
          </button>
        ))}
      </div>
      {conPropina && (
        <>
          <div className="cobro-propina">
            <span>Propina</span>
            {[0, 10, 15].map((p) => (
              <button type="button" key={p} className={Number(propina) === Math.round((total * p) / 100) ? "on" : ""} onClick={() => setPropina(Math.round((total * p) / 100))}>
                {p ? p + " %" : "Sin"}
              </button>
            ))}
            <input type="number" min="0" value={propina} onChange={(e) => setPropina(Number(e.target.value) || 0)} aria-label="Propina en pesos" />
          </div>
        </>
      )}
      <dl className="cobro-cuentas">
        <div>
          <dt>Cuenta</dt>
          <dd>{plata(total)}</dd>
        </div>
        {propina > 0 && (
          <div>
            <dt>Propina</dt>
            <dd>+ {plata(propina)}</dd>
          </div>
        )}
        <div>
          <dt>Cobrás</dt>
          <dd>{plata(bruto)}</dd>
        </div>
        {tasa > 0 && (
          <div className="com">
            <dt>Comisión MP ({pct(tasa)})</dt>
            <dd>− {plata(com)}</dd>
          </div>
        )}
        <div className="neto">
          <dt>Te queda</dt>
          <dd>{plata(bruto - com)}</dd>
        </div>
      </dl>
      <div className="fila-btns">
        <button type="button" className="btn btn-2" onClick={onCancelar}>
          Volver
        </button>
        <button type="button" className="btn btn-1" onClick={() => onCobrar(medio, Number(propina) || 0)}>
          Cobrar {plata(bruto)}
        </button>
      </div>
      <p className="nota-chica">Comisiones de Mercado Pago sin IVA ni retenciones. Se cambian en Ajustes → Cobros.</p>
    </div>
  );
}

export function Cabecera({ et, titulo, children }: { et: ReactNode; titulo: string; children?: ReactNode }) {
  return (
    <header className="vista-cab">
      <div>
        <span className="sec-et">{et}</span>
        <h1>{titulo}</h1>
      </div>
      {children}
    </header>
  );
}
