"use client";

import { useState } from 'react'
import { Plus, Link2, MessageCircle, Check, Banknote, X, Clock } from 'lucide-react'
import { useStore, servicioDe, clienteDe, waLink } from '../lib/store'
import { hoyISO, fechaLarga, fechaCorta, plata, aMin } from '../lib/fechas'
import { voc, cap, pl, fem } from '../lib/profesiones'
import { Kpi, Estado, TurnoModal, NuevoTurno, recordatorio } from './ui'

export default function Hoy() {
  const st = useStore()
  const { db } = st
  const v = voc(db.negocio)
  const hoy = hoyISO()
  const [abierto, setAbierto] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const siguiente = db.turnos.filter((t) => t.fecha > hoy && t.estado !== 'cancelado').map((t) => t.fecha).sort()[0]
  const delDia = db.turnos.filter((t) => t.fecha === hoy && t.estado !== 'cancelado').sort((a, b) => a.hora.localeCompare(b.hora))
  const ahora = new Date().getHours() * 60 + new Date().getMinutes()
  const proximo = delDia.find((t) => ['pendiente', 'confirmado'].includes(t.estado) && aMin(t.hora) + t.duracion > ahora)
  const cobrado = db.movimientos.filter((m) => m.fecha === hoy && m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const porCobrar = delDia.filter((t) => !t.pago && t.estado !== 'ausente').reduce((a, t) => a + t.precio, 0)
  const aConfirmar = db.turnos.filter((t) => t.estado === 'pendiente' && t.fecha >= hoy).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  const link = location.origin + location.pathname + '#/'

  return (
    <div className="vista">
      <div className="v-cab">
        <div><p className="muted">{fechaLarga(hoy)}</p><h1 className="v-tit">Hola 👋</h1></div>
        <button className="btn" onClick={() => setNuevo(true)}><Plus size={18} /> Nuevo {v.atencion}</button>
      </div>

      <div className="kpis">
        <Kpi titulo={`${cap(pl(v.atencion))} hoy`} valor={delDia.length} sub={`${delDia.filter((t) => t.estado === 'atendido').length} atendid${fem(v.atencion) ? 'as' : 'os'}`} />
        <Kpi titulo="Cobrado hoy" valor={plata(cobrado)} tono="acento" />
        <Kpi titulo="Falta cobrar" valor={plata(porCobrar)} />
        <Kpi titulo="A confirmar" valor={aConfirmar.length} sub="próximos días" />
      </div>

      {proximo && (
        <div className="card proximo" onClick={() => setAbierto(proximo.id!)}>
          <div><p className="lbl">Próximo</p><b>{proximo.hora} · {clienteDe(db, proximo).nombre}</b><p className="muted">{servicioDe(db, proximo).nombre}</p></div>
          <a className="btn sec" href={recordatorio(db, proximo)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><MessageCircle size={18} /> Avisar</a>
        </div>
      )}

      <div className="dos-col">
        <section>
          <h2 className="s-tit">Agenda de hoy</h2>
          <div className="card lista">
            {delDia.length === 0 && <p className="vacio">No hay {pl(v.atencion)} hoy. Buen día para descansar ☕</p>}
            {delDia.length === 0 && siguiente && <p className="lbl" style={{ padding: '0 .9rem' }}>Próximo día · {fechaLarga(siguiente)}</p>}
            {delDia.length === 0 && db.turnos.filter((t) => t.fecha === siguiente && t.estado !== 'cancelado').sort((a, b) => a.hora.localeCompare(b.hora)).map((t) => (
              <div key={t.id} className="fila-turno" onClick={() => setAbierto(t.id!)}>
                <span className="ft-hora">{t.hora}</span>
                <div className="ft-info"><b>{clienteDe(db, t).nombre}</b><small>{servicioDe(db, t).nombre} · {plata(t.precio)}</small></div>
                <Estado e={t.estado} />
              </div>
            ))}
            {delDia.map((t) => (
              <div key={t.id} className={'fila-turno' + (t.estado === 'atendido' ? ' hecho' : '')} onClick={() => setAbierto(t.id!)}>
                <span className="ft-hora">{t.hora}</span>
                <div className="ft-info"><b>{clienteDe(db, t).nombre}</b><small>{servicioDe(db, t).nombre} · {plata(t.precio)}</small></div>
                <Estado e={t.estado} />
                {!t.pago && ['pendiente', 'confirmado', 'atendido'].includes(t.estado) && <button className="icon acento" aria-label="Cobrar" onClick={(e) => { e.stopPropagation(); setAbierto(t.id!) }}><Banknote size={18} /></button>}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="s-tit">Para confirmar</h2>
          <div className="card lista">
            {aConfirmar.length === 0 && <p className="vacio">Todo confirmado ✓</p>}
            {aConfirmar.slice(0, 6).map((t) => (
              <div key={t.id} className="fila-turno">
                <span className="ft-hora"><small>{fechaCorta(t.fecha)}</small>{t.hora}</span>
                <div className="ft-info" onClick={() => setAbierto(t.id!)}><b>{clienteDe(db, t).nombre}</b><small>{servicioDe(db, t).nombre}</small></div>
                <a className="icon" aria-label="WhatsApp" href={recordatorio(db, t)} target="_blank" rel="noreferrer"><MessageCircle size={18} /></a>
                <button className="icon acento" aria-label="Confirmar" onClick={() => st.turno(t.id, { estado: 'confirmado' })}><Check size={18} /></button>
              </div>
            ))}
          </div>

          <h2 className="s-tit">Lista de espera</h2>
          <div className="card lista">
            {db.espera.length === 0 && <p className="vacio">Nadie esperando.</p>}
            {db.espera.map((e) => (
              <div key={e.id} className="fila-turno">
                <Clock size={18} className="muted" />
                <div className="ft-info"><b>{e.nombre}</b><small>{db.servicios.find((s) => s.id === e.servicioId)?.nombre || 'Cualquiera'} · {e.preferencia || 'sin preferencia'}</small></div>
                <a className="icon" aria-label="Avisar" href={waLink(e.tel, `Hola ${e.nombre.split(' ')[0]}! Se liberó un lugar en ${db.negocio.nombre}. ¿Te sirve?`)} target="_blank" rel="noreferrer"><MessageCircle size={18} /></a>
                <button className="icon" aria-label="Quitar" onClick={() => st.quitarEspera(e.id)}><X size={18} /></button>
              </div>
            ))}
          </div>

          <div className="card compartir">
            <Link2 size={20} />
            <div><b>Tu link de reservas</b><small>Pegalo en tu Instagram, WhatsApp o Google.</small></div>
            <button className="btn sec" onClick={() => { navigator.clipboard?.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 1500) }}>{copiado ? '¡Copiado!' : 'Copiar'}</button>
          </div>
        </section>
      </div>

      {abierto && <TurnoModal id={abierto} onCerrar={() => setAbierto(null)} />}
      {nuevo && <NuevoTurno onCerrar={() => setNuevo(false)} />}
    </div>
  )
}
