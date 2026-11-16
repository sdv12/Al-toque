import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { useReserva, dur, precio, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { desdeISO, DIAS_C, fechaLarga } from '../lib/fechas'
import { PROFESIONES } from '../lib/profesiones'

export default function Bruto() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [abierto, setAbierto] = useState(false)
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const prof = PROFESIONES[negocio.profesion].nombre

  return (
    <div className="x-wrap">
      <header className="x-top">
        <span className="x-tag">TURNOS ONLINE</span>
        <h1>{negocio.nombre}</h1>
        <p>{prof} — {negocio.direccion}</p>
      </header>
      <div className="x-cinta" aria-hidden="true"><div>{Array(6).fill(`RESERVÁ EN 30 SEGUNDOS ✶ SIN LLAMAR ✶ SIN ESPERAR ✶ `).join('')}</div></div>

      <section className="x-sec">
        <h2><em>01</em> ELEGÍ</h2>
        <div className="x-servs">
          {r.servicios.map((s, i) => (
            <button key={s.id} className={'x-serv' + (servicio?.id === s.id ? ' sel' : '')} onClick={() => { r.setServicio(s); r.setHora(null) }}>
              <span className="x-num">{String(i + 1).padStart(2, '0')}</span>
              <b>{s.nombre}</b>
              <span className="x-pie"><span>{dur(s.duracion)}</span><span>{precio(s.precio)}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className={'x-sec' + (servicio ? '' : ' x-off')}>
        <h2><em>02</em> CUÁNDO</h2>
        <div className="x-cal">
          {r.dias.slice(0, 14).map((d) => {
            const x = desdeISO(d), n = servicio ? r.libres(d).length : 0
            return (
              <button key={d} disabled={!n} className={fecha === d ? 'sel' : ''} onClick={() => { r.setFecha(d); r.setHora(null) }}>
                <small>{DIAS_C[x.getDay()]}</small><b>{x.getDate()}</b><small>{servicio ? (n ? n + ' libres' : 'lleno') : ''}</small>
              </button>
            )
          })}
        </div>
      </section>

      <section className={'x-sec' + (fecha && servicio ? '' : ' x-off')}>
        <h2><em>03</em> HORA</h2>
        <div className="x-horas">{r.horas.map((h) => <button key={h} className={hora === h ? 'sel' : ''} onClick={() => r.setHora(h)}>{h}</button>)}</div>
        {fecha && servicio && <ListaEspera onEnviar={r.anotarEspera} clase="x-espera" />}
      </section>

      <Pie clase="x-pief" />

      <div className="x-barra">
        <div className="x-res">
          <b>{servicio ? servicio.nombre : 'Elegí un servicio'}</b>
          <span>{fecha ? fechaLarga(fecha) : '—'}{hora ? ' · ' + hora : ''}</span>
        </div>
        <button disabled={!hora} onClick={() => setAbierto(true)}>RESERVAR <ArrowRight size={22} strokeWidth={3} /></button>
      </div>

      {abierto && (
        <div className="x-modal" role="dialog" aria-modal="true">
          <div className="x-hoja">
            <button className="x-cerrar" aria-label="Cerrar" onClick={() => { setAbierto(false); if (hecho) r.reiniciar() }}><X size={26} strokeWidth={3} /></button>
            {hecho ? (
              <>
                <h2 className="x-listo">LISTO.</h2>
                <p className="x-big">{hecho.servicio.nombre}<br />{fechaLarga(hecho.fecha)} — {hecho.hora}</p>
                <div className="x-acc">
                  <button onClick={() => descargarICS(negocio, hecho, hecho.servicio)}>AL CALENDARIO</button>
                  <a href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer">AVISAR X WHATSAPP</a>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) r.confirmar(f) }}>
                <h2><em>04</em> VOS</h2>
                <input placeholder="NOMBRE" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} autoFocus required />
                <input placeholder="WHATSAPP" inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} required />
                <input placeholder={r.v.nota.toUpperCase()} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} />
                <button className="x-go" disabled={!f.nombre.trim() || !telValido(f.tel)}>CONFIRMAR {servicio && precio(servicio.precio)}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
