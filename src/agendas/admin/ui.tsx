"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { X, MessageCircle, Banknote, UserX, Check, Ban, Phone } from 'lucide-react'
import { useStore, servicioDe, clienteDe, waLink } from '../lib/store'
import { fechaLarga, plata, aHora, aMin, horariosLibres, hoyISO } from '../lib/fechas'
import { voc, cap } from '../lib/profesiones'
import type { Db, EstadoTurno, Metodo, Turno } from '../lib/tipos'

export function Modal({ titulo, onCerrar, children, ancho }: { titulo: string; onCerrar: () => void; children: ReactNode; ancho?: number | string }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onCerrar])
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal card" style={ancho ? { maxWidth: ancho } : undefined} role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <header className="modal-cab"><h3>{titulo}</h3><button className="icon" aria-label="Cerrar" onClick={onCerrar}><X size={20} /></button></header>
        {children}
      </div>
    </div>
  )
}

export const ESTADOS: Record<EstadoTurno, { t: string; c: string }> = {
  pendiente: { t: 'A confirmar', c: 'amarillo' },
  confirmado: { t: 'Confirmado', c: 'azul' },
  atendido: { t: 'Atendido', c: 'verde' },
  ausente: { t: 'No vino', c: 'rojo' },
  cancelado: { t: 'Cancelado', c: 'gris' },
}
export const Estado = ({ e }: { e: EstadoTurno }) => <span className={'badge ' + ESTADOS[e].c}>{ESTADOS[e].t}</span>
export const METODOS: Record<Metodo, string> = { efectivo: 'Efectivo', transferencia: 'Transferencia', mercadopago: 'Mercado Pago', tarjeta: 'Tarjeta' }

export function Kpi({ titulo, valor, sub, tono }: { titulo: ReactNode; valor: ReactNode; sub?: ReactNode; tono?: string }) {
  return <div className={'kpi card' + (tono ? ' ' + tono : '')}><p>{titulo}</p><b>{valor}</b>{sub && <small>{sub}</small>}</div>
}

export const recordatorio = (db: Db, t: Turno) => {
  const c = clienteDe(db, t), s = servicioDe(db, t)
  return waLink(c.tel, `Hola ${c.nombre.split(' ')[0]}! Te recuerdo tu ${voc(db.negocio).atencion} de ${s.nombre} el ${fechaLarga(t.fecha).toLowerCase()} a las ${t.hora} en ${db.negocio.nombre}. ¿Me confirmás? 🙌`)
}

// Detalle de un turno con todas las acciones rápidas.
export function TurnoModal({ id, onCerrar }: { id: string; onCerrar: () => void }) {
  const st = useStore()
  const { db } = st
  const t = db.turnos.find((x) => x.id === id)
  const [cobrando, setCobrando] = useState(false)
  const [monto, setMonto] = useState<number | string>(t?.precio || 0)
  const [metodo, setMetodo] = useState<Metodo>('efectivo')
  if (!t) return null
  const s = servicioDe(db, t), c = clienteDe(db, t)
  const v = voc(db.negocio)
  const visitas = db.turnos.filter((x) => x.clienteId === c.id && x.estado === 'atendido').length

  return (
    <Modal titulo={`${cap(v.atencion)} · ${t.hora}`} onCerrar={onCerrar}>
      <div className="tm-cab">
        <div>
          <b className="tm-nombre">{c.nombre}</b>
          <p className="muted">{s.nombre} · {t.duracion} min · {plata(t.precio)}</p>
          <p className="muted">{fechaLarga(t.fecha)}, {t.hora} a {aHora(aMin(t.hora) + t.duracion)}</p>
        </div>
        <Estado e={t.estado} />
      </div>
      <p className="small muted">{visitas} visitas · reservó por {t.origen === 'web' ? 'la web' : 'carga manual'}{c.notas ? ' · 📝 ' + c.notas : ''}</p>
      {t.notas && <p className="tm-nota">“{t.notas}”</p>}
      {t.pago && <p className="tm-pago"><Banknote size={16} /> Cobrado {plata(t.pago.monto)} en {METODOS[t.pago.metodo]}</p>}

      {cobrando ? (
        <form className="tm-cobro" onSubmit={(e) => { e.preventDefault(); st.cobrar(t.id, Number(monto), metodo); onCerrar() }}>
          <label>Monto<input className="input" type="number" min="0" value={monto} onChange={(e) => setMonto(e.target.value)} autoFocus /></label>
          <div className="seg">{Object.entries(METODOS).map(([k, n]) => <button type="button" key={k} className={metodo === k ? 'sel' : ''} onClick={() => setMetodo(k as Metodo)}>{n}</button>)}</div>
          <button className="btn grande">Registrar cobro de {plata(Number(monto))}</button>
        </form>
      ) : (
        <div className="tm-acc">
          {!t.pago && t.estado !== 'cancelado' && <button className="btn" onClick={() => setCobrando(true)}><Banknote size={18} /> Cobrar</button>}
          {t.estado === 'pendiente' && <button className="btn sec" onClick={() => st.turno(t.id, { estado: 'confirmado' })}><Check size={18} /> Confirmar</button>}
          {['pendiente', 'confirmado'].includes(t.estado) && <button className="btn sec" onClick={() => st.turno(t.id, { estado: 'atendido' })}><Check size={18} /> Atendido sin cobro</button>}
          <a className="btn sec" href={recordatorio(db, t)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Recordatorio</a>
          <a className="btn sec" href={'tel:' + c.tel}><Phone size={18} /> Llamar</a>
          {['pendiente', 'confirmado'].includes(t.estado) && <button className="btn sec peligro" onClick={() => st.turno(t.id, { estado: 'ausente' })}><UserX size={18} /> No vino</button>}
          {['pendiente', 'confirmado'].includes(t.estado) && <button className="btn sec peligro" onClick={() => { st.turno(t.id, { estado: 'cancelado' }); onCerrar() }}><Ban size={18} /> Cancelar</button>}
        </div>
      )}
    </Modal>
  )
}

// Carga manual (llamada, mostrador) o bloqueo de horario.
export function NuevoTurno({ fecha: f0, hora: h0, onCerrar }: { fecha?: string; hora?: string; onCerrar: () => void }) {
  const st = useStore()
  const { db } = st
  const v = voc(db.negocio)
  const [modo, setModo] = useState<'turno' | 'bloqueo'>('turno')
  const [f, setF] = useState({ servicioId: db.servicios.find((s) => s.activo)?.id, fecha: f0 || hoyISO(), hora: h0 || '', nombre: '', tel: '', desde: h0 || '13:00', hasta: '14:00', motivo: '' })
  const s = db.servicios.find((x) => x.id === f.servicioId)
  const libres = s ? horariosLibres({ ...db.negocio, anticipacion: 0 }, db.turnos, db.bloqueos, f.fecha, s.duracion) : []
  const conocido = db.clientes.find((c) => c.nombre.toLowerCase() === f.nombre.toLowerCase())

  function guardar(e: FormEvent) {
    e.preventDefault()
    if (modo === 'bloqueo') { st.bloquear({ fecha: f.fecha, desde: f.desde, hasta: f.hasta, motivo: f.motivo }); return onCerrar() }
    if (!f.hora || !f.nombre.trim() || !f.servicioId) return
    st.reservar({ servicioId: f.servicioId, fecha: f.fecha, hora: f.hora, nombre: f.nombre.trim(), tel: f.tel || conocido?.tel || '', origen: 'manual', estado: 'confirmado' })
    onCerrar()
  }

  return (
    <Modal titulo={modo === 'turno' ? `Nuevo ${v.atencion}` : 'Bloquear horario'} onCerrar={onCerrar}>
      <div className="seg">
        <button type="button" className={modo === 'turno' ? 'sel' : ''} onClick={() => setModo('turno')}>{cap(v.atencion)}</button>
        <button type="button" className={modo === 'bloqueo' ? 'sel' : ''} onClick={() => setModo('bloqueo')}>Bloqueo</button>
      </div>
      <form className="form-col" onSubmit={guardar}>
        <label>Fecha<input className="input" type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value, hora: '' })} /></label>
        {modo === 'turno' ? (
          <>
            <label>Servicio<select className="input" value={f.servicioId} onChange={(e) => setF({ ...f, servicioId: e.target.value, hora: '' })}>{db.servicios.filter((x) => x.activo).map((x) => <option key={x.id} value={x.id}>{x.nombre} · {x.duracion}&apos;</option>)}</select></label>
            <div><p className="lbl">Hora</p><div className="chips">{libres.map((h) => <button type="button" key={h} className={'chip' + (f.hora === h ? ' sel' : '')} onClick={() => setF({ ...f, hora: h })}>{h}</button>)}{!libres.length && <span className="muted small">Sin lugar ese día.</span>}</div></div>
            <label>{cap(v.persona)}<input className="input" list="lista-clientes" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Nombre" required /></label>
            <datalist id="lista-clientes">{db.clientes.map((c) => <option key={c.id} value={c.nombre} />)}</datalist>
            {!conocido && <label>WhatsApp<input className="input" inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} /></label>}
            {conocido && <p className="small muted">✓ {cap(v.persona)} existente · {conocido.tel}</p>}
            <button className="btn grande" disabled={!f.hora || !f.nombre.trim()}>Agendar</button>
          </>
        ) : (
          <>
            <div className="fila2"><label>Desde<input className="input" type="time" step="900" value={f.desde} onChange={(e) => setF({ ...f, desde: e.target.value })} /></label><label>Hasta<input className="input" type="time" step="900" value={f.hasta} onChange={(e) => setF({ ...f, hasta: e.target.value })} /></label></div>
            <label>Motivo<input className="input" value={f.motivo} placeholder="Almuerzo, trámite, vacaciones…" onChange={(e) => setF({ ...f, motivo: e.target.value })} /></label>
            <button className="btn grande">Bloquear</button>
          </>
        )}
      </form>
    </Modal>
  )
}
