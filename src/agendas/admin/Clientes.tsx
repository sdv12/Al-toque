"use client";

import { useState } from 'react'
import { Search, MessageCircle } from 'lucide-react'
import { useStore, waLink, servicioDe } from '../lib/store'
import { hoyISO, sumarDias, fechaCorta, plata } from '../lib/fechas'
import { voc, cap } from '../lib/profesiones'
import { Modal, Estado } from './ui'

export default function Clientes() {
  const st = useStore()
  const { db } = st
  const v = voc(db.negocio)
  const [q, setQ] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [abierto, setAbierto] = useState<string | null>(null)
  const hace45 = sumarDias(hoyISO(), -45)

  const filas = db.clientes.map((c) => {
    const ts = db.turnos.filter((t) => t.clienteId === c.id)
    const at = ts.filter((t) => t.estado === 'atendido')
    const ultima = at.map((t) => t.fecha).sort().pop()
    const futuro = ts.some((t) => t.fecha >= hoyISO() && ['pendiente', 'confirmado'].includes(t.estado))
    return { c, ts, visitas: at.length, gastado: at.reduce((a, t) => a + (t.pago?.monto || 0), 0), ausencias: ts.filter((t) => t.estado === 'ausente').length, ultima, futuro }
  })
    .filter((x) => !q || (x.c.nombre + x.c.tel).toLowerCase().includes(q.toLowerCase()))
    .filter((x) => filtro === 'todos' || (filtro === 'perdidos' ? x.ultima && x.ultima < hace45 && !x.futuro : x.ausencias >= 2))
    .sort((a, b) => (b.ultima || '').localeCompare(a.ultima || ''))

  const sel = abierto && filas.find((x) => x.c.id === abierto)

  return (
    <div className="vista">
      <div className="v-cab"><h1 className="v-tit">{cap(v.personas)}</h1><span className="muted">{db.clientes.length} en total</span></div>
      <div className="ag-barra">
        <label className="buscar"><Search size={18} /><input placeholder="Buscar por nombre o teléfono" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <div className="seg chico">{[['todos', 'Todos'], ['perdidos', 'Hace +45 días'], ['faltan', 'Faltan seguido']].map(([k, t]) => <button key={k} className={filtro === k ? 'sel' : ''} onClick={() => setFiltro(k!)}>{t}</button>)}</div>
      </div>
      {filtro === 'perdidos' && <p className="small muted">Hace más de 45 días que no vienen y no tienen nada agendado. Un mensaje a tiempo los recupera.</p>}
      <div className="card lista">
        {filas.map((x) => (
          <div key={x.c.id} className="fila-turno" onClick={() => setAbierto(x.c.id!)}>
            <span className="av-chico">{x.c.nombre[0]}</span>
            <div className="ft-info"><b>{x.c.nombre}</b><small>{x.visitas} visitas · última {x.ultima ? fechaCorta(x.ultima) : '—'}{x.ausencias ? ` · ${x.ausencias} faltas` : ''}</small></div>
            <b className="oculto-movil">{plata(x.gastado)}</b>
            <a className="icon" aria-label="WhatsApp" onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer"
              href={waLink(x.c.tel, filtro === 'perdidos' ? `Hola ${x.c.nombre.split(' ')[0]}! Hace un tiempo que no te vemos por ${db.negocio.nombre}. ¿Te reservo un ${v.atencion}?` : `Hola ${x.c.nombre.split(' ')[0]}!`)}><MessageCircle size={18} /></a>
          </div>
        ))}
        {!filas.length && <p className="vacio">No hay resultados.</p>}
      </div>

      {sel && (
        <Modal titulo={sel.c.nombre} onCerrar={() => setAbierto(null)}>
          <div className="kpis tres">
            <div><small className="muted">Visitas</small><b>{sel.visitas}</b></div>
            <div><small className="muted">Gastado</small><b>{plata(sel.gastado)}</b></div>
            <div><small className="muted">Faltas</small><b>{sel.ausencias}</b></div>
          </div>
          <label className="form-col">Notas privadas<textarea className="input" rows={2} defaultValue={sel.c.notas} onBlur={(e) => st.cliente(sel.c.id, { notas: e.target.value })} placeholder="Alergias, preferencias, lo que charlaron…" /></label>
          <p className="small muted">📱 {sel.c.tel}</p>
          <h4 className="s-tit">Historial</h4>
          <div className="lista historial">
            {sel.ts.sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 12).map((t) => (
              <div key={t.id} className="fila-turno"><span className="ft-hora"><small>{fechaCorta(t.fecha)}</small>{t.hora}</span><div className="ft-info"><b>{servicioDe(db, t).nombre}</b><small>{t.pago ? plata(t.pago.monto) : '—'}</small></div><Estado e={t.estado} /></div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
