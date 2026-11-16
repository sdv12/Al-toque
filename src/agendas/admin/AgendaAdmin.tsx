"use client";

import { useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Plus, Lock, X } from 'lucide-react'
import { useStore, servicioDe, clienteDe } from '../lib/store'
import { hoyISO, sumarDias, desdeISO, fechaLarga, DIAS_C, aMin, plata } from '../lib/fechas'
import { voc, pl } from '../lib/profesiones'
import { TurnoModal, NuevoTurno, ESTADOS } from './ui'

const ALTO = 1.4 // px por minuto

export default function AgendaAdmin() {
  const st = useStore()
  const { db } = st
  const v = voc(db.negocio)
  const [fecha, setFecha] = useState(() => { let f = hoyISO(); for (let i = 0; i < 7 && !(db.negocio.horarios[desdeISO(f).getDay()] || []).length; i++) f = sumarDias(f, 1); return f })
  const [vista, setVista] = useState('dia')
  const [abierto, setAbierto] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState<{ fecha?: string; hora?: string } | null>(null)
  const todas = Object.values(db.negocio.horarios).flat()
  const ini = Math.floor(Math.min(...todas.map((x) => aMin(x[0]))) / 60) * 60
  const fin = Math.ceil(Math.max(...todas.map((x) => aMin(x[1]))) / 60) * 60
  const turnosDe = (f: string) => db.turnos.filter((t) => t.fecha === f && t.estado !== 'cancelado').sort((a, b) => a.hora.localeCompare(b.hora))
  const dias = vista === 'dia' ? [fecha] : Array.from({ length: 7 }, (_, i) => sumarDias(fecha, i - ((desdeISO(fecha).getDay() + 6) % 7)))
  const mover = (n: number) => setFecha(sumarDias(fecha, vista === 'dia' ? n : n * 7))
  const total = turnosDe(fecha)

  return (
    <div className="vista">
      <div className="v-cab">
        <h1 className="v-tit">Agenda</h1>
        <button className="btn" onClick={() => setNuevo({ fecha })}><Plus size={18} /> Nuevo</button>
      </div>
      <div className="ag-barra">
        <div className="ag-nav">
          <button className="icon" aria-label="Anterior" onClick={() => mover(-1)}><ChevronLeft size={20} /></button>
          <button className="btn sec chico" onClick={() => setFecha(hoyISO())}>Hoy</button>
          <button className="icon" aria-label="Siguiente" onClick={() => mover(1)}><ChevronRight size={20} /></button>
          <input className="input chico" type="date" value={fecha} onChange={(e) => e.target.value && setFecha(e.target.value)} />
        </div>
        <div className="seg chico">{[['dia', 'Día'], ['semana', 'Semana']].map(([k, t]) => <button key={k} className={vista === k ? 'sel' : ''} onClick={() => setVista(k!)}>{t}</button>)}</div>
      </div>
      {vista === 'dia' && <p className="muted ag-sub">{fechaLarga(fecha)} · {total.length} {pl(v.atencion)} · {plata(total.reduce((a, t) => a + t.precio, 0))} estimado</p>}

      <div className="card ag-grilla-wrap">
        <div className={'ag-grilla ' + vista} style={{ '--cols': dias.length } as CSSProperties}>
          <div className="ag-horas">
            {vista === 'semana' && <div className="ag-dcab" />}
            {Array.from({ length: (fin - ini) / 60 }, (_, i) => <div key={i} style={{ height: 60 * ALTO }}>{String(ini / 60 + i).padStart(2, '0')}:00</div>)}
          </div>
          {dias.map((d) => {
            const franjas = db.negocio.horarios[desdeISO(d).getDay()] || []
            return (
              <div key={d} className="ag-col">
                {vista === 'semana' && <button className={'ag-dcab' + (d === hoyISO() ? ' hoy' : '')} onClick={() => { setFecha(d); setVista('dia') }}>{DIAS_C[desdeISO(d).getDay()]} <b>{desdeISO(d).getDate()}</b></button>}
                <div className="ag-cuerpo" style={{ height: (fin - ini) * ALTO }} onDoubleClick={(e) => {
                  const y = e.clientY - e.currentTarget.getBoundingClientRect().top
                  const m = ini + Math.floor(y / ALTO / 15) * 15
                  setNuevo({ fecha: d, hora: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}` })
                }}>
                  {!franjas.length && <div className="ag-cerrado">Cerrado</div>}
                  {franjas.map(([a, b], i) => <div key={i} className="ag-abierto" style={{ top: (aMin(a) - ini) * ALTO, height: (aMin(b) - aMin(a)) * ALTO }} />)}
                  {db.bloqueos.filter((b) => b.fecha === d).map((b) => (
                    <div key={b.id} className="ag-bloq" style={{ top: (aMin(b.desde) - ini) * ALTO, height: (aMin(b.hasta) - aMin(b.desde)) * ALTO }}>
                      <Lock size={12} /> {b.motivo || 'Bloqueado'}
                      <button aria-label="Quitar bloqueo" onClick={() => st.desbloquear(b.id)}><X size={12} /></button>
                    </div>
                  ))}
                  {turnosDe(d).map((t) => (
                    <button key={t.id} className={'ag-turno ' + ESTADOS[t.estado].c} style={{ top: (aMin(t.hora) - ini) * ALTO, height: t.duracion * ALTO - 2 }} onClick={() => setAbierto(t.id!)}>
                      <b>{t.hora} {clienteDe(db, t).nombre}</b>
                      {vista === 'dia' && <small>{servicioDe(db, t).nombre}{t.pago ? ' · pagado' : ''}</small>}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p className="small muted">Doble clic en un hueco para agendar a esa hora.</p>
      {abierto && <TurnoModal id={abierto} onCerrar={() => setAbierto(null)} />}
      {nuevo && <NuevoTurno fecha={nuevo.fecha} hora={nuevo.hora} onCerrar={() => setNuevo(null)} />}
    </div>
  )
}
