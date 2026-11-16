"use client";

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, Trash2, Lock, Banknote } from 'lucide-react'
import { useStore, clienteDe, servicioDe } from '../lib/store'
import { hoyISO, sumarDias, fechaLarga, fechaCorta, plata } from '../lib/fechas'
import type { Metodo, Movimiento } from '../lib/tipos'
import { Kpi, METODOS, TurnoModal, Modal } from './ui'

export default function Caja() {
  const st = useStore()
  const { db } = st
  const [fecha, setFecha] = useState(hoyISO())
  const [form, setForm] = useState<{ tipo: 'ingreso' | 'egreso'; monto: string; metodo: Metodo; concepto: string } | null>(null)
  const [cierre, setCierre] = useState(false)
  const [contado, setContado] = useState('')
  const [abierto, setAbierto] = useState<string | null>(null)
  const movs = db.movimientos.filter((m) => m.fecha === fecha).sort((a, b) => b.hora.localeCompare(a.hora))
  const suma = (fn: (m: Movimiento) => boolean) => movs.filter(fn).reduce((a, m) => a + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
  const ingresos = movs.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const egresos = movs.filter((m) => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0)
  const efectivo = suma((m) => m.metodo === 'efectivo')
  const porMetodo = (Object.keys(METODOS) as Metodo[]).map((k): [Metodo, number] => [k, suma((m) => m.metodo === k)])
  const cerrado = db.cierres.find((c) => c.fecha === fecha)
  const sinCobrar = db.turnos.filter((t) => t.fecha <= fecha && t.fecha >= sumarDias(fecha, -7) && !t.pago && t.precio > 0 && ['atendido', 'confirmado', 'pendiente'].includes(t.estado) && (t.fecha < fecha || t.estado === 'atendido'))

  return (
    <div className="vista">
      <div className="v-cab">
        <h1 className="v-tit">Caja</h1>
        <div className="ag-nav">
          <button className="icon" aria-label="Día anterior" onClick={() => setFecha(sumarDias(fecha, -1))}><ChevronLeft size={20} /></button>
          <span className="caja-fecha">{fecha === hoyISO() ? 'Hoy' : fechaCorta(fecha)}</span>
          <button className="icon" aria-label="Día siguiente" disabled={fecha >= hoyISO()} onClick={() => setFecha(sumarDias(fecha, 1))}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="kpis">
        <Kpi titulo="Ingresos" valor={plata(ingresos)} tono="acento" />
        <Kpi titulo="Egresos" valor={plata(egresos)} />
        <Kpi titulo="Saldo del día" valor={plata(ingresos - egresos)} />
        <Kpi titulo="Efectivo en caja" valor={plata(efectivo)} sub={cerrado ? `Cerrada · dif. ${plata(cerrado.diferencia)}` : 'Sin cerrar'} />
      </div>

      <div className="caja-acc">
        <button className="btn" onClick={() => setForm({ tipo: 'ingreso', monto: '', metodo: 'efectivo', concepto: '' })}><ArrowDownLeft size={18} /> Ingreso</button>
        <button className="btn sec" onClick={() => setForm({ tipo: 'egreso', monto: '', metodo: 'efectivo', concepto: '' })}><ArrowUpRight size={18} /> Gasto</button>
        <button className="btn sec" onClick={() => { setContado(String(efectivo)); setCierre(true) }}><Lock size={18} /> {cerrado ? 'Re-cerrar' : 'Cerrar caja'}</button>
      </div>

      <div className="dos-col">
        <section>
          <h2 className="s-tit">Movimientos · {fechaLarga(fecha)}</h2>
          <div className="card lista">
            {!movs.length && <p className="vacio">Sin movimientos este día.</p>}
            {movs.map((m) => (
              <div key={m.id} className="fila-turno">
                <span className={'mov-ico ' + m.tipo}>{m.tipo === 'ingreso' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span>
                <div className="ft-info"><b>{m.concepto || (m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto')}</b><small>{m.hora} · {METODOS[m.metodo]}</small></div>
                <b className={'mov-monto ' + m.tipo}>{m.tipo === 'egreso' ? '−' : '+'}{plata(m.monto)}</b>
                <button className="icon" aria-label="Borrar" onClick={() => confirm('¿Borrar este movimiento?') && st.borrarMovimiento(m.id)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="s-tit">Por medio de pago</h2>
          <div className="card metodos">
            {porMetodo.map(([k, n]) => (
              <div key={k} className="metodo"><span>{METODOS[k]}</span><div className="barra"><i style={{ width: ingresos ? Math.max(0, n) / ingresos * 100 + '%' : 0 }} /></div><b>{plata(n)}</b></div>
            ))}
          </div>
          <h2 className="s-tit">Falta cobrar</h2>
          <div className="card lista">
            {!sinCobrar.length && <p className="vacio">Nada pendiente 👌</p>}
            {sinCobrar.map((t) => (
              <div key={t.id} className="fila-turno" onClick={() => setAbierto(t.id!)}>
                <span className="ft-hora"><small>{fechaCorta(t.fecha)}</small>{t.hora}</span>
                <div className="ft-info"><b>{clienteDe(db, t).nombre}</b><small>{servicioDe(db, t).nombre}</small></div>
                <b>{plata(t.precio)}</b><Banknote size={18} className="acento-txt" />
              </div>
            ))}
          </div>
          <h2 className="s-tit">Últimos cierres</h2>
          <div className="card lista">
            {db.cierres.slice(-6).reverse().map((c) => (
              <div key={c.id} className="fila-turno"><div className="ft-info"><b>{fechaCorta(c.fecha)}</b><small>Esperado {plata(c.esperado)} · contado {plata(c.contado)}</small></div><span className={'badge ' + (c.diferencia === 0 ? 'verde' : 'rojo')}>{c.diferencia === 0 ? 'OK' : plata(c.diferencia)}</span></div>
            ))}
          </div>
        </section>
      </div>

      {form && (
        <Modal titulo={form.tipo === 'ingreso' ? 'Nuevo ingreso' : 'Nuevo gasto'} onCerrar={() => setForm(null)}>
          <form className="form-col" onSubmit={(e) => { e.preventDefault(); if (Number(form.monto) > 0) { st.movimiento({ ...form, monto: Number(form.monto), ...(fecha !== hoyISO() && { fecha }) }); setForm(null) } }}>
            <label>Monto<input className="input grande-num" type="number" min="1" autoFocus value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></label>
            <div className="seg">{Object.entries(METODOS).map(([k, n]) => <button type="button" key={k} className={form.metodo === k ? 'sel' : ''} onClick={() => setForm({ ...form, metodo: k as Metodo })}>{n}</button>)}</div>
            <label>Concepto<input className="input" value={form.concepto} placeholder={form.tipo === 'ingreso' ? 'Venta de producto, seña…' : 'Insumos, alquiler, luz…'} onChange={(e) => setForm({ ...form, concepto: e.target.value })} /></label>
            <button className="btn grande">Guardar</button>
          </form>
        </Modal>
      )}
      {cierre && (
        <Modal titulo={`Cierre de caja · ${fechaCorta(fecha)}`} onCerrar={() => setCierre(false)}>
          <form className="form-col" onSubmit={(e) => { e.preventDefault(); st.cerrarCaja({ fecha, esperado: efectivo, contado: Number(contado), diferencia: Number(contado) - efectivo, nota: '' }); setCierre(false) }}>
            <p>Efectivo esperado: <b>{plata(efectivo)}</b></p>
            <label>¿Cuánto contaste?<input className="input grande-num" type="number" value={contado} onChange={(e) => setContado(e.target.value)} autoFocus /></label>
            <p className={Number(contado) - efectivo === 0 ? 'ok-txt' : 'error'}>Diferencia: {plata(Number(contado) - efectivo)}</p>
            <button className="btn grande">Cerrar caja</button>
          </form>
        </Modal>
      )}
      {abierto && <TurnoModal id={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  )
}
