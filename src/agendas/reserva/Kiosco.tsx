"use client";

import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, CornerDownLeft } from 'lucide-react'
import { useReserva, dur, precio, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { fechaLarga, fechaCorta } from '../lib/fechas'

export default function Kiosco() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [paso, setPaso] = useState(0)
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const total = 6

  type Opcion = { k: string; t: string; d?: string; ir: () => void }
  const opciones: Opcion[] =
    paso === 0 ? r.servicios.map((s) => ({ k: s.id, t: s.nombre, d: `${dur(s.duracion)} · ${precio(s.precio)}`, ir: () => { r.setServicio(s); r.setFecha(null); r.setHora(null); setPaso(1) } }))
    : paso === 1 ? r.dias.slice(0, 9).filter((d) => r.libres(d).length).map((d) => ({ k: d, t: fechaCorta(d), d: r.libres(d).length + ' horarios', ir: () => { r.setFecha(d); r.setHora(null); setPaso(2) } }))
    : paso === 2 ? r.horas.map((h) => ({ k: h, t: h, ir: () => { r.setHora(h); setPaso(3) } }))
    : []

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= 9 && opciones[n - 1]) opciones[n - 1]!.ir()
      if (e.key === 'Backspace' && paso > 0 && paso < 7) setPaso(paso - 1)
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  })

  const preguntas: [string, string | null | undefined][] = [
    [`¿Qué ${r.v.atencion} querés?`, negocio.nombre],
    ['¿Qué día?', servicio?.nombre],
    ['¿A qué hora?', fecha && fechaLarga(fecha)],
    ['¿Cómo te llamás?', `${fecha && fechaCorta(fecha)} · ${hora}`],
    ['Tu WhatsApp', 'Para el recordatorio'],
    [r.v.nota.replace(/ \(opcional\)$/, ''), 'Opcional'],
    ['¿Confirmamos?', ''],
  ]

  function siguiente(e: FormEvent) {
    e.preventDefault()
    if (paso === 3 && f.nombre.trim()) setPaso(4)
    else if (paso === 4 && telValido(f.tel)) setPaso(5)
    else if (paso === 5) setPaso(6)
    else if (paso === 6) { r.confirmar(f); setPaso(7) }
  }

  return (
    <div className="k-pant">
      <div className="k-prog"><i style={{ width: `${Math.min(paso, total) / total * 100}%` }} /></div>
      <header className="k-top">
        {paso > 0 && paso < 7 ? <button onClick={() => setPaso(paso - 1)}><ArrowLeft size={18} /> Atrás</button> : <span className="k-marca">{negocio.nombre}</span>}
        <span>{paso < 7 ? `${Math.min(paso + 1, total + 1)}/${total + 1}` : '✓'}</span>
      </header>

      <main className="k-centro" key={paso}>
        {paso < 7 ? (
          <>
            <p className="k-ante">{preguntas[paso]?.[1]}</p>
            <h1>{preguntas[paso]?.[0]}</h1>
            {paso <= 2 && (
              <ul className={'k-ops' + (paso === 2 ? ' k-grilla' : '')}>
                {opciones.map((o, i) => (
                  <li key={o.k}>
                    <button onClick={o.ir} className={(paso === 0 && servicio?.id === o.k) || (paso === 1 && fecha === o.k) || (paso === 2 && hora === o.k) ? 'sel' : ''}>
                      {i < 9 && <kbd>{i + 1}</kbd>}<span>{o.t}</span>{o.d && <small>{o.d}</small>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {paso === 2 && <ListaEspera onEnviar={r.anotarEspera} clase="k-espera" />}
            {paso >= 3 && (
              <form onSubmit={siguiente} className="k-form">
                {paso === 3 && <input autoFocus placeholder="Escribí acá…" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} />}
                {paso === 4 && <input autoFocus inputMode="tel" placeholder="351 555 0000" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} />}
                {paso === 5 && <input autoFocus placeholder="Escribí acá o seguí con Enter…" value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} />}
                {paso === 6 && (
                  <dl className="k-res">
                    <dt>Qué</dt><dd>{servicio!.nombre!}</dd>
                    <dt>Cuándo</dt><dd>{fechaLarga(fecha!)}, {hora}</dd>
                    <dt>Quién</dt><dd>{f.nombre}</dd>
                    {f.notas && <><dt>Nota</dt><dd>{f.notas}</dd></>}
                    <dt>Total</dt><dd>{precio(servicio!.precio!)}</dd>
                  </dl>
                )}
                <button className="k-ok" disabled={(paso === 3 && !f.nombre.trim()) || (paso === 4 && !telValido(f.tel))}>
                  {paso === 6 ? 'Confirmar' : paso === 5 && !f.notas ? 'Saltear' : 'OK'} <span className="k-enter">Enter <CornerDownLeft size={14} /></span>
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="k-fin">
            <p className="k-ante">Reservado</p>
            <h1>Nos vemos el {fechaCorta(hecho!.fecha!)}<br />a las <em>{hecho!.hora!}</em>.</h1>
            <div className="k-acc">
              <button onClick={() => descargarICS(negocio, hecho!, hecho!.servicio!)}>Agregar al calendario <ArrowRight size={18} /></button>
              <a href={avisoWa(negocio, hecho!, hecho!.servicio!, hecho!.nombre!)} target="_blank" rel="noreferrer">WhatsApp <ArrowRight size={18} /></a>
              <button onClick={() => { r.reiniciar(); setF({ nombre: '', tel: '', notas: '' }); setPaso(0) }}>Otro {r.v.atencion} <ArrowRight size={18} /></button>
            </div>
          </div>
        )}
      </main>
      {paso <= 2 && <p className="k-tip">Tip: usá las teclas 1–9</p>}
      <Pie clase="k-pie" />
    </div>
  )
}
