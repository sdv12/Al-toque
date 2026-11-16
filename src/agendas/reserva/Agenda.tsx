"use client";

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReserva, dur, precio, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { desdeISO, DIAS, MESES, hoyISO, sumarDias, aMin, fechaLarga } from '../lib/fechas'
import { PROFESIONES } from '../lib/profesiones'

export default function Agenda() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [semana, setSemana] = useState(0)
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const [movil, setMovil] = useState(() => matchMedia('(max-width: 760px)').matches)
  const abierto = (sem: number) => { for (let i = 0; i < 7; i++) if ((negocio.horarios[desdeISO(sumarDias(hoyISO(), sem * 7 + i)).getDay()] || []).length) return i; return 0 }
  const [diaM, setDiaM] = useState(() => abierto(0))
  const post = useRef<HTMLDivElement>(null)
  useEffect(() => { const m = matchMedia('(max-width: 760px)'); const fn = () => setMovil(m.matches); m.addEventListener('change', fn); return () => m.removeEventListener('change', fn) }, [])
  useEffect(() => { if (movil && (hora || hecho)) post.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }, [hora, hecho, movil])
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(hoyISO(), semana * 7 + i))
  const todas = Object.values(negocio.horarios).flat()
  const hIni = Math.floor(Math.min(...todas.map((x) => aMin(x[0]))) / 60)
  const hFin = Math.ceil(Math.max(...todas.map((x) => aMin(x[1]))) / 60)
  const horasFila = Array.from({ length: hFin - hIni }, (_, i) => hIni + i)
  const libresPorDia = Object.fromEntries(dias.map((d) => [d, servicio ? r.libres(d) : []]))
  const d0 = desdeISO(dias[0]!), d6 = desdeISO(dias[6]!)

  return (
    <div className="a-mesa">
      <div className="a-libreta">
        <nav className="a-indice" aria-label="Servicios">
          <p className="a-rot">índice</p>
          {r.servicios.map((s) => (
            <button key={s.id} className={'a-pest' + (servicio?.id === s.id ? ' sel' : '')} onClick={() => { r.setServicio(s); r.setFecha(null); r.setHora(null) }}>
              <span>{s.nombre}</span><small>{dur(s.duracion)} · {precio(s.precio)}</small>
            </button>
          ))}
        </nav>

        <div className="a-hoja">
          <header className="a-cab">
            <div>
              <p className="a-rot">agenda de</p>
              <h1>{negocio.nombre}</h1>
              <p className="a-sub">{PROFESIONES[negocio.profesion].nombre} · {negocio.direccion}</p>
            </div>
            <div className="a-nav">
              <button aria-label="Semana anterior" disabled={semana === 0} onClick={() => { setSemana(semana - 1); setDiaM(abierto(semana - 1)) }}><ChevronLeft size={18} /></button>
              <span>{d0.getDate()} {MESES[d0.getMonth()]!.slice(0, 3)} — {d6.getDate()} {MESES[d6.getMonth()]!.slice(0, 3)}</span>
              <button aria-label="Semana siguiente" disabled={semana >= 3} onClick={() => { setSemana(semana + 1); setDiaM(abierto(semana + 1)) }}><ChevronRight size={18} /></button>
            </div>
          </header>

          {!servicio && <p className="a-nota">← Elegí primero qué {r.v.atencion} querés en las pestañas del índice.</p>}

          {movil ? (
            <div className="a-movil">
              <div className="a-mdias">
                {dias.map((d, i) => { const x = desdeISO(d); const cerr = !(negocio.horarios[x.getDay()] || []).length; return (
                  <button key={d} className={(diaM === i ? 'sel ' : '') + (cerr ? 'cerr' : '')} onClick={() => setDiaM(i)}><span>{DIAS[x.getDay()]!.slice(0, 3)}</span><b>{x.getDate()}</b></button>
                ) })}
              </div>
              <p className="a-mtit">{fechaLarga(dias[diaM]!)}</p>
              {!(negocio.horarios[desdeISO(dias[diaM]!).getDay()] || []).length ? <p className="a-nota">Cerrado este día.</p> : (
                <ol className="a-mhoras">
                  {horasFila.map((h) => {
                    const aca = (libresPorDia[dias[diaM]!] ?? []).filter((x) => Math.floor(aMin(x) / 60) === h)
                    return (
                      <li key={h}>
                        <span>{h}:00</span>
                        <div>{aca.length ? aca.map((x) => <button key={x} className={fecha === dias[diaM] && hora === x ? 'sel' : ''} onClick={() => { r.setFecha(dias[diaM]!); r.setHora(x) }}>{x}</button>) : <em>{servicio ? '—' : ''}</em>}</div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          ) : (
          <div className="a-tabla-wrap">
            <table className="a-tabla">
              <thead>
                <tr><th />{dias.map((d) => { const x = desdeISO(d); return <th key={d}><span>{DIAS[x.getDay()]!.slice(0, 3)}</span><b>{x.getDate()}</b></th> })}</tr>
              </thead>
              <tbody>
                {horasFila.map((h) => (
                  <tr key={h}>
                    <th>{h}:00</th>
                    {dias.map((d) => {
                      const cerrado = !(negocio.horarios[desdeISO(d).getDay()] || []).length
                      const aca = libresPorDia[d]!.filter((x) => Math.floor(aMin(x) / 60) === h)
                      return (
                        <td key={d} className={cerrado ? 'cerr' : ''}>
                          {aca.map((x) => (
                            <button key={x} className={fecha === d && hora === x ? 'sel' : ''} onClick={() => { r.setFecha(d); r.setHora(x) }}>{x.slice(3)}&apos;</button>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
          {servicio && <ListaEspera onEnviar={r.anotarEspera} clase="a-espera" />}
        </div>

        <aside className="a-post" ref={post}>
          {hecho ? (
            <div className="a-anotado">
              <div className="a-sello">ANOTADO</div>
              <p className="a-manus">{hecho.nombre.split(' ')[0]}, te esperamos el {fechaLarga(hecho.fecha).toLowerCase()} a las {hecho.hora}.</p>
              <button onClick={() => descargarICS(negocio, hecho, hecho.servicio)}>Pasar a mi calendario</button>
              <a href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer">Escribir por WhatsApp</a>
              <button className="a-link" onClick={r.reiniciar}>Anotar otro</button>
            </div>
          ) : hora ? (
            <form onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) r.confirmar(f) }}>
              <p className="a-manus">{servicio!.nombre!}<br />{fechaLarga(fecha!)}, {hora} h</p>
              <label>Nombre<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required autoFocus /></label>
              <label>WhatsApp<input inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} required /></label>
              <label>{r.v.nota}<input value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
              <button disabled={!f.nombre.trim() || !telValido(f.tel)}>Anotar en la agenda</button>
            </form>
          ) : (
            <p className="a-manus a-vacio">Tocá un horario libre de la planilla y anotamos tu {r.v.atencion} acá.</p>
          )}
        </aside>
      </div>
      <Pie clase="a-pie" />
    </div>
  )
}
