"use client";

import { useState } from 'react'
import { MapPin, Clock, Check, CalendarPlus, MessageCircle, ChevronLeft } from 'lucide-react'
import { useReserva, dur, precio, avatar, telValido, separarFranjas, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { fechaLarga, desdeISO, DIAS_C, MESES } from '../lib/fechas'
import { cap, PROFESIONES } from '../lib/profesiones'

export default function Base() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const paso = hecho ? 4 : !servicio ? 1 : !hora ? 2 : 3
  const { manana, tarde } = separarFranjas(r.horas)

  return (
    <div className="b-wrap">
      <header className="b-hero">
        <div className="b-avatar">{avatar(negocio)}</div>
        <div>
          <h1>{negocio.nombre}</h1>
          <p className="b-prof">{PROFESIONES[negocio.profesion].nombre}</p>
          <p className="b-dir"><MapPin size={14} /> {negocio.direccion}</p>
        </div>
      </header>

      <ol className="b-pasos" aria-label="Pasos">
        {['Servicio', 'Día y hora', 'Tus datos'].map((x, i) => (
          <li key={x} className={paso > i + 1 ? 'ok' : paso === i + 1 ? 'act' : ''}><span>{paso > i + 1 ? <Check size={14} /> : i + 1}</span>{x}</li>
        ))}
      </ol>

      <div className="b-grid">
        <main className="b-main">
          {hecho ? (
            <section className="card b-exito">
              <div className="b-check"><Check size={30} /></div>
              <h2>¡{cap(r.v.atencion)} reservad{r.v.atencion === 'turno' ? 'o' : 'a'}!</h2>
              <p>{hecho.servicio.nombre} · {fechaLarga(hecho.fecha)} a las {hecho.hora}</p>
              <div className="b-acc">
                <button className="btn" onClick={() => descargarICS(negocio, hecho, hecho.servicio)}><CalendarPlus size={18} /> Agregar al calendario</button>
                <a className="btn sec" href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Avisar por WhatsApp</a>
              </div>
              <button className="b-link" onClick={r.reiniciar}>Reservar otro</button>
            </section>
          ) : paso === 1 ? (
            <section>
              <h2 className="b-h2">¿Qué necesitás?</h2>
              <div className="b-servicios">
                {r.servicios.map((s) => (
                  <button key={s.id} className="card b-serv" onClick={() => r.setServicio(s)}>
                    <strong>{s.nombre}</strong>
                    <span className="b-meta"><Clock size={14} /> {dur(s.duracion)}</span>
                    <span className="b-precio">{precio(s.precio)}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : paso === 2 ? (
            <section>
              <button className="b-volver" onClick={() => { r.setServicio(null); r.setFecha(null) }}><ChevronLeft size={16} /> Cambiar servicio</button>
              <h2 className="b-h2">Elegí el día</h2>
              <div className="b-dias">
                {r.dias.map((d) => {
                  const x = desdeISO(d), n = r.libres(d).length
                  return (
                    <button key={d} className={'b-dia' + (fecha === d ? ' sel' : '') + (!n ? ' lleno' : '')} disabled={!n} onClick={() => { r.setFecha(d); r.setHora(null) }}>
                      <small>{DIAS_C[x.getDay()]}</small><b>{x.getDate()}</b><small>{MESES[x.getMonth()]!.slice(0, 3)}</small>
                    </button>
                  )
                })}
              </div>
              {fecha && (
                <>
                  <h2 className="b-h2">Horarios del {fechaLarga(fecha).toLowerCase()}</h2>
                  {([['Mañana', manana], ['Tarde', tarde]] as const).map(([t, hs]) => hs!.length! > 0 && (
                    <div key={t} className="b-franja">
                      <p>{t}</p>
                      <div className="b-horas">{hs.map((h) => <button key={h} className={'chip' + (hora === h ? ' sel' : '')} onClick={() => r.setHora(h)}>{h}</button>)}</div>
                    </div>
                  ))}
                  {!r.horas.length && <p className="muted">No quedan horarios este día.</p>}
                  <ListaEspera onEnviar={r.anotarEspera} />
                </>
              )}
            </section>
          ) : (
            <section>
              <button className="b-volver" onClick={() => r.setHora(null)}><ChevronLeft size={16} /> Cambiar horario</button>
              <h2 className="b-h2">Tus datos</h2>
              <form className="card b-form" onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) r.confirmar(f) }}>
                <label>Nombre y apellido<input className="input" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required autoFocus /></label>
                <label>WhatsApp<input className="input" inputMode="tel" placeholder="351 555 0000" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} required /></label>
                <label>{r.v.nota}<textarea className="input" rows={2} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
                <button className="btn grande" disabled={!f.nombre.trim() || !telValido(f.tel)}>Confirmar {r.v.atencion}</button>
              </form>
            </section>
          )}
        </main>

        <aside className="card b-resumen">
          <h3>Tu {r.v.atencion}</h3>
          <dl>
            <dt>Servicio</dt><dd>{servicio?.nombre || '—'}</dd>
            <dt>Día</dt><dd>{fecha ? fechaLarga(fecha) : '—'}</dd>
            <dt>Hora</dt><dd>{hora || '—'}</dd>
            <dt>Duración</dt><dd>{servicio ? dur(servicio.duracion) : '—'}</dd>
          </dl>
          <div className="b-total"><span>Total</span><b>{servicio ? precio(servicio.precio) : '—'}</b></div>
          <p className="muted small">{negocio.descripcion}</p>
        </aside>
      </div>
      <Pie />
    </div>
  )
}
