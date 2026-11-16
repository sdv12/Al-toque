"use client";

import { useState } from 'react'
import { useReserva, dur, precio, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { desdeISO, DIAS_C, MESES, fechaLarga, aMin, aHora } from '../lib/fechas'
import { PROFESIONES } from '../lib/profesiones'

const C = 170, R = 138
const punto = (m: number, r = R): [number, number] => { const a = ((m % 720) / 720) * 2 * Math.PI - Math.PI / 2; return [C + r * Math.cos(a), C + r * Math.sin(a)] }

export default function Reloj() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  // Mañana o tarde: arranca en la que tiene lugar; si la persona la cambia, se respeta hasta que cambie el día o el servicio.
  const [eleccion, setEleccion] = useState<{ clave: string; tarde: boolean } | null>(null)
  const clave = `${fecha}|${servicio?.id}`
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const libres = r.horas.map(aMin)
  const tarde = eleccion?.clave === clave ? eleccion.tarde : !libres.some((m) => m < 720)
  const setTarde = (valor: boolean) => setEleccion({ clave, tarde: valor })
  const visibles = libres.filter((m) => (tarde ? m >= 720 : m < 720))

  return (
    <div className="r-fondo">
      <header className="r-cab">
        <p>{PROFESIONES[negocio.profesion].nombre}</p>
        <h1>{negocio.nombre}</h1>
        <span className="r-filete" />
      </header>

      <h2 className={'r-paso' + (servicio ? ' ok' : ' act')}><span>1</span> ¿Qué servicio?</h2>
      <div className="r-servs">
        {r.servicios.map((s) => (
          <button key={s.id} className={servicio?.id === s.id ? 'sel' : ''} onClick={() => { r.setServicio(s); r.setHora(null) }} disabled={!!hecho}>
            {s.nombre}<small>{dur(s.duracion)} · {precio(s.precio)}</small>
          </button>
        ))}
      </div>

      <h2 className={'r-paso' + (fecha ? ' ok' : servicio ? ' act' : '')}><span>2</span> ¿Qué día? <small>deslizá →</small></h2>
      <div className={'r-rueda' + (servicio ? '' : ' r-off')} role="listbox" aria-label="Día">
        {r.dias.map((d) => {
          const x = desdeISO(d), n = servicio ? r.libres(d).length : 0
          return (
            <button key={d} role="option" aria-selected={fecha === d} disabled={!n || !!hecho} className={fecha === d ? 'sel' : ''} onClick={() => { r.setFecha(d); r.setHora(null) }}>
              <small>{DIAS_C[x.getDay()]}</small><b>{x.getDate()}</b><small>{MESES[x.getMonth()]!.slice(0, 3)}</small>
            </button>
          )
        })}
      </div>

      <div className="r-centro">
        <div className={'r-dial-wrap' + (fecha && servicio ? '' : ' r-off')}>
          <h2 className={'r-paso' + (hora ? ' ok' : fecha ? ' act' : '')}><span>3</span> ¿A qué hora? <small>tocá un punto dorado</small></h2>
          <div className="r-toggle">
            <button className={!tarde ? 'sel' : ''} onClick={() => setTarde(false)}>Mañana</button>
            <button className={tarde ? 'sel' : ''} onClick={() => setTarde(true)}>Tarde</button>
          </div>
          <div className="r-dial-box">
          <svg viewBox="0 0 340 340" className="r-dial" role="group" aria-label="Horarios libres">
            <circle cx={C} cy={C} r={162} className="r-aro" />
            <circle cx={C} cy={C} r={R} className="r-pista" />
            {Array.from({ length: 60 }, (_, i) => { const [x1, y1] = punto(i * 12, 156), [x2, y2] = punto(i * 12, i % 5 ? 151 : 146); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="r-marca" /> })}
            {Array.from({ length: 12 }, (_, i) => { const [x, y] = punto((i + 1) * 60, 110); return <text key={i} x={x} y={y} className="r-num">{tarde ? (i + 1 === 12 ? 12 : i + 13) : i + 1}</text> })}
            {hora && (() => { const [x, y] = punto(aMin(hora), R - 12); return <line x1={C} y1={C} x2={x} y2={y} className="r-aguja" /> })()}
            <circle cx={C} cy={C} r={5} className="r-eje" />
            {visibles.map((m) => {
              const [x, y] = punto(m)
              const h = aHora(m)
              return (
                <g key={m} className={'r-slot' + (hora === h ? ' sel' : '') + (!hora ? ' late' : '')} onClick={() => !hecho && r.setHora(h)} role="button" tabIndex={0} aria-label={'Reservar ' + h} onKeyDown={(e) => e.key === 'Enter' && r.setHora(h)}>
                  <title>{h}</title>
                  <circle cx={x} cy={y} r={14} className="r-hit" />
                  <circle cx={x} cy={y} r={hora === h ? 9 : 6} />
                </g>
              )
            })}
          </svg>
          <div className="r-lectura">
            <b>{hora || '— : —'}</b>
            <small>{hora && servicio ? `hasta las ${aHora(aMin(hora) + servicio.duracion)}` : fecha ? `${visibles.length} libres · tocá un punto` : 'elegí un día'}</small>
          </div>
          </div>
          {fecha && servicio && (
            <div className="r-chips">
              <p>o elegí de la lista</p>
              <div>{visibles.map((m) => { const h = aHora(m); return <button key={m} className={hora === h ? 'sel' : ''} onClick={() => !hecho && r.setHora(h)}>{h}</button> })}</div>
            </div>
          )}
        </div>

        <aside className="r-panel">
          {hecho ? (
            <div className="r-ok">
              <p className="r-sup">Reserva confirmada</p>
              <h2>{fechaLarga(hecho.fecha)}</h2>
              <p className="r-hora-big">{hecho.hora}</p>
              <p>{hecho.servicio.nombre} · {negocio.direccion}</p>
              <button className="r-btn" onClick={() => descargarICS(negocio, hecho, hecho.servicio)}>Agregar al calendario</button>
              <a className="r-btn sec" href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>
              <button className="r-link" onClick={r.reiniciar}>Nueva reserva</button>
            </div>
          ) : hora ? (
            <form onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) r.confirmar(f) }}>
              <p className="r-sup">{fechaLarga(fecha!)} · {hora}</p>
              <label>Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required /></label>
              <label>WhatsApp<input inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} required /></label>
              <label>{r.v.nota}<input value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
              <button className="r-btn" disabled={!f.nombre.trim() || !telValido(f.tel)}>Reservar · {precio(servicio!.precio!)}</button>
            </form>
          ) : (
            <div className="r-guia">
              <p className="r-sup">Tu reserva</p>
              <dl>
                <dt>Servicio</dt><dd>{servicio ? servicio.nombre : <em>paso 1</em>}</dd>
                <dt>Día</dt><dd>{fecha ? fechaLarga(fecha) : <em>paso 2</em>}</dd>
                <dt>Hora</dt><dd><em>paso 3</em></dd>
                <dt>Total</dt><dd>{servicio ? precio(servicio.precio) : '—'}</dd>
              </dl>
              {fecha && servicio && <ListaEspera onEnviar={r.anotarEspera} clase="r-espera" />}
            </div>
          )}
        </aside>
      </div>
      <Pie clase="r-pie" />
    </div>
  )
}
