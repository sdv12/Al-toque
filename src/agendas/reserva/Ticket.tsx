"use client";

import { useState, type ReactNode } from 'react'
import { useReserva, dur, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { desdeISO, DIAS_C, plata, hoyISO } from '../lib/fechas'
import { PROFESIONES } from '../lib/profesiones'

const Linea = ({ izq, der, clase = '' }: { izq: ReactNode; der: ReactNode; clase?: string }) => <div className={'t-linea ' + clase}><span>{izq}</span><i /><span>{der}</span></div>
const ddmm = (d: string) => d.split('-').reverse().slice(0, 2).join('/')

export default function Ticket() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const listo = f.nombre.trim() && telValido(f.tel)
  const nro = hecho ? hecho.id.slice(0, 6).toUpperCase() : null
  const ahora = new Date()

  return (
    <div className="t-mesa">
      <header className="t-cartel">
        <p>{PROFESIONES[negocio.profesion].nombre.toUpperCase()} · {negocio.direccion.toUpperCase()}</p>
        <h1>{negocio.nombre.toUpperCase()}</h1>
        <p className="t-tag">MOSTRADOR DE {r.v.atencion.toUpperCase()}S · ATENCIÓN ONLINE 24 H</p>
      </header>

      <div className="t-grid">
        <main className="t-mostrador">
          <section className="t-sec">
            <h2><b>01</b> SERVICIO</h2>
            <table className="t-tabla">
              <thead><tr><th>DESCRIPCIÓN</th><th>DUR.</th><th>PRECIO</th></tr></thead>
              <tbody>
                {r.servicios.map((s) => (
                  <tr key={s.id} className={servicio?.id === s.id ? 'sel' : ''} onClick={() => !hecho && (r.setServicio(s), r.setFecha(null), r.setHora(null))} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && !hecho && r.setServicio(s)}>
                    <td>{servicio?.id === s.id ? '■' : '□'} {s.nombre.toUpperCase()}</td><td>{s.duracion}&apos;</td><td>{s.precio ? plata(s.precio) : 'S/C'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={'t-sec' + (servicio ? '' : ' t-off')}>
            <h2><b>02</b> FECHA</h2>
            <div className="t-dias">
              {r.dias.slice(0, 14).map((d) => {
                const x = desdeISO(d), n = servicio ? r.libres(d).length : 0
                return (
                  <button key={d} disabled={!n || !!hecho} className={fecha === d ? 'sel' : ''} onClick={() => { r.setFecha(d); r.setHora(null) }}>
                    <small>{DIAS_C[x.getDay()]!.toUpperCase()}</small><b>{String(x.getDate()).padStart(2, '0')}</b><small>{n ? n + ' LIB' : servicio ? 'COMPL' : '—'}</small>
                  </button>
                )
              })}
            </div>
          </section>

          <section className={'t-sec' + (fecha && servicio ? '' : ' t-off')}>
            <h2><b>03</b> HORA</h2>
            <div className="t-horas">
              {r.horas.map((h) => <button key={h} disabled={!!hecho} className={hora === h ? 'sel' : ''} onClick={() => r.setHora(h)}>{h}</button>)}
              {fecha && !r.horas.length && <p>-- SIN HORARIOS --</p>}
            </div>
            {fecha && !hecho && <ListaEspera onEnviar={r.anotarEspera} clase="t-espera" />}
          </section>

          <section className={'t-sec' + (hora ? '' : ' t-off')}>
            <h2><b>04</b> DATOS</h2>
            <div className="t-form">
              <label>NOMBRE<input value={f.nombre} disabled={!!hecho} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
              <label>WHATSAPP<input inputMode="tel" value={f.tel} disabled={!!hecho} onChange={(e) => setF({ ...f, tel: e.target.value })} /></label>
              <label className="t-ancho">NOTA<input placeholder={r.v.nota.toUpperCase()} value={f.notas} disabled={!!hecho} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
            </div>
          </section>
        </main>

        <aside className="t-caja">
          <div className="t-ticketera"><span className="t-led" /><span>TICKETERA</span><span className="t-ranura" /></div>
          <div className="t-papel">
            <div className="t-cab">
              <p className="t-neg">{negocio.nombre.toUpperCase()}</p>
              <p>{negocio.direccion.toUpperCase()}</p>
              <p>{ddmm(hoyISO())}/{ahora.getFullYear()} {ahora.toTimeString().slice(0, 5)}</p>
            </div>
            <p className="t-sep">================================</p>
            {!servicio && <p className="t-espera-txt">ESPERANDO SELECCIÓN…<span className="t-cursor">█</span></p>}
            {servicio && <div className="t-imp" key={servicio.id}><Linea izq={servicio.nombre.toUpperCase()} der={servicio.precio ? plata(servicio.precio) : 'S/C'} /><Linea izq={'  DURACIÓN'} der={dur(servicio.duracion).toUpperCase()} clase="t-sub" /></div>}
            {fecha && <div className="t-imp" key={fecha}><Linea izq="FECHA" der={`${DIAS_C[desdeISO(fecha).getDay()]!.toUpperCase()} ${ddmm(fecha)}`} /></div>}
            {hora && <div className="t-imp" key={hora}><Linea izq="HORA" der={hora} /></div>}
            {f.nombre.trim() && <div className="t-imp"><Linea izq="A NOMBRE DE" der={f.nombre.toUpperCase().slice(0, 16)} /></div>}
            {servicio && <>
              <p className="t-sep">--------------------------------</p>
              <Linea izq="TOTAL" der={servicio.precio ? plata(servicio.precio) : 'S/C'} clase="t-total" />
              <p className="t-chico">SE ABONA EN EL LOCAL</p>
            </>}

            {hecho ? (
              <div className="t-final">
                <p className="t-ok">*** {r.v.atencion.toUpperCase()} CONFIRMADO ***</p>
                <Linea izq="NRO" der={nro} />
                <div className="t-barras" aria-hidden="true">{(nro! + nro!).split('').flatMap((c, i) => [<b key={i} style={{ width: (c.charCodeAt(0) % 4) + 1 }} />, <i key={'i' + i} style={{ width: (c.charCodeAt(0) % 3) + 1 }} />])}</div>
                <p className="t-chico">GRACIAS POR SU VISITA</p>
              </div>
            ) : (
              <button className="t-imprimir" disabled={!hora || !listo} onClick={() => r.confirmar(f)}>
                {!servicio ? '[ ELEGÍ UN SERVICIO ]' : !hora ? '[ ELEGÍ DÍA Y HORA ]' : !listo ? '[ COMPLETÁ TUS DATOS ]' : `[ EMITIR ${r.v.atencion.toUpperCase()} ]`}
              </button>
            )}
          </div>
          {hecho && (
            <div className="t-talon">
              <p className="t-corte">- - - - - - ✂ - - - - - -</p>
              <button onClick={() => descargarICS(negocio, hecho, hecho.servicio)}>GUARDAR EN CALENDARIO</button>
              <a href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer">AVISAR POR WHATSAPP</a>
              <button onClick={() => { r.reiniciar(); setF({ nombre: '', tel: '', notas: '' }) }}>NUEVO TICKET</button>
            </div>
          )}
        </aside>
      </div>
      <Pie clase="t-pie" />
    </div>
  )
}
