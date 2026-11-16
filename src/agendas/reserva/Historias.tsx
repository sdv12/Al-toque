import { useState } from 'react'
import { X, ChevronLeft, Heart, Send } from 'lucide-react'
import { useReserva, dur, precio, avatar, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { fechaCorta, fechaLarga } from '../lib/fechas'

const FONDOS = [
  'linear-gradient(160deg,#ff9a5a,#ff5f6d 45%,#c026d3)',
  'linear-gradient(160deg,#6366f1,#a855f7 50%,#ec4899)',
  'linear-gradient(160deg,#0ea5e9,#6366f1 55%,#8b5cf6)',
  'linear-gradient(160deg,#10b981,#0ea5e9 60%,#6366f1)',
  'linear-gradient(160deg,#f59e0b,#f97316 45%,#ef4444)',
  'linear-gradient(160deg,#ec4899,#8b5cf6 55%,#3b82f6)',
  'linear-gradient(160deg,#22c55e,#14b8a6 50%,#0ea5e9)',
]

export default function Historias() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [paso, setPaso] = useState(0)
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const N = 6
  const atras = () => paso > 0 && paso < 6 && setPaso(paso - 1)

  let cuerpo
  if (paso === 0) cuerpo = (
    <>
      <h1 className="h-tit">¿Qué te<br />reservamos?</h1>
      <div className="h-ops">{r.servicios.map((s) => <button key={s.id} onClick={() => { r.setServicio(s); r.setFecha(null); r.setHora(null); setPaso(1) }}><b>{s.nombre}</b><small>{dur(s.duracion)} · {precio(s.precio)}</small></button>)}</div>
    </>
  )
  else if (paso === 1) cuerpo = (
    <>
      <h1 className="h-tit">¿Qué día<br />te queda?</h1>
      <div className="h-ops h-dos">{r.dias.slice(0, 10).map((d) => <button key={d} disabled={!r.libres(d).length} onClick={() => { r.setFecha(d); r.setHora(null); setPaso(2) }}><b>{fechaCorta(d)}</b><small>{r.libres(d).length ? r.libres(d).length + ' lugares' : 'completo'}</small></button>)}</div>
    </>
  )
  else if (paso === 2) cuerpo = (
    <>
      <h1 className="h-tit">¿A qué<br />hora?</h1>
      <div className="h-ops h-tres">{r.horas.map((h) => <button key={h} onClick={() => { r.setHora(h); setPaso(3) }}><b>{h}</b></button>)}</div>
      <ListaEspera onEnviar={r.anotarEspera} clase="h-espera" />
    </>
  )
  else if (paso === 3) cuerpo = (
    <form className="h-form" onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) setPaso(4) }}>
      <h1 className="h-tit">¿Quién<br />viene?</h1>
      <input placeholder="Tu nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} autoFocus />
      <input placeholder="Tu WhatsApp" inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} />
      <button className="h-cta" disabled={!f.nombre.trim() || !telValido(f.tel)}>Seguir</button>
    </form>
  )
  else if (paso === 4) cuerpo = (
    <form className="h-form" onSubmit={(e) => { e.preventDefault(); setPaso(5) }}>
      <h1 className="h-tit h-chico">{r.v.nota.replace(/ \(opcional\)$/, '')}</h1>
      <textarea rows={3} placeholder="Opcional" value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} autoFocus />
      <button className="h-cta">{f.notas ? 'Seguir' : 'Saltear'}</button>
    </form>
  )
  else if (paso === 5) cuerpo = (
    <div className="h-res">
      <p className="h-sticker">TU {r.v.atencion.toUpperCase()}</p>
      <h1 className="h-tit">{servicio!.nombre!}</h1>
      <p className="h-grande">{fechaLarga(fecha!)}<br />{hora} h</p>
      <p>{f.nombre} · {precio(servicio!.precio!)}</p>
      <button className="h-cta" onClick={() => { r.confirmar(f); setPaso(6) }}>Confirmar ✨</button>
    </div>
  )
  else cuerpo = (
    <div className="h-res">
      <p className="h-emoji">🎉</p>
      <h1 className="h-tit">¡Te esperamos!</h1>
      <p className="h-grande">{fechaCorta(hecho!.fecha!)} · {hecho!.hora!}</p>
      <div className="h-ops">
        <button onClick={() => descargarICS(negocio, hecho!, hecho!.servicio!)}><b>📅 Guardar en el calendario</b></button>
        <a href={avisoWa(negocio, hecho!, hecho!.servicio!, hecho!.nombre!)} target="_blank" rel="noreferrer"><b>💬 Avisar por WhatsApp</b></a>
      </div>
    </div>
  )

  return (
    <div className="h-escena">
      <div className="h-story" style={{ background: FONDOS[paso] }}>
        <div className="h-barras">{Array.from({ length: N }, (_, i) => <i key={i} className={i < paso ? 'llena' : i === paso ? 'act' : ''} />)}</div>
        <header className="h-cab">
          <span className="h-av"><span>{avatar(negocio)}</span></span>
          <b>{negocio.nombre}</b><small>ahora</small>
          {paso > 0 && paso < 6 && <button aria-label="Atrás" onClick={atras}><ChevronLeft size={22} /></button>}
          <button aria-label="Empezar de nuevo" onClick={() => { r.reiniciar(); setF({ nombre: '', tel: '', notas: '' }); setPaso(0) }}><X size={22} /></button>
        </header>
        <div className="h-cuerpo" key={paso}>{cuerpo}</div>
        <footer className="h-resp">
          <span>{servicio ? `${servicio.nombre}${fecha ? ' · ' + fechaCorta(fecha) : ''}${hora ? ' · ' + hora : ''}` : 'Respondé a esta historia…'}</span>
          <Heart size={22} /><Send size={22} />
        </footer>
      </div>
      <Pie clase="h-pie" />
    </div>
  )
}
