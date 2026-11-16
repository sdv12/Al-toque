"use client";

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useStore } from './lib/store'
import { DISENOS, esDiseno, type IdDiseno } from './lib/disenos'
import type { IdProfesion } from './lib/profesiones'
import { GRUPOS } from './lib/profesiones'
import Base from './reserva/Base'
import Ticket from './reserva/Ticket'
import Bruto from './reserva/Bruto'
import Agenda from './reserva/Agenda'
import Kiosco from './reserva/Kiosco'
import Mes from './reserva/Mes'
import Historias from './reserva/Historias'
import Reloj from './reserva/Reloj'
import Pila from './reserva/Pila'
import Admin from './admin/Admin'
import Terminos from './Terminos'
import Probar, { decodificarDemo } from './probar/Probar'
import { Sparkles } from 'lucide-react'

const RESERVA = { base: Base, ticket: Ticket, bruto: Bruto, agenda: Agenda, kiosco: Kiosco, mes: Mes, historias: Historias, reloj: Reloj, pila: Pila }
const ruta = () => location.hash.replace(/^#\/?/, '').split('/')

export default function App() {
  const st = useStore()
  const { db } = st
  const [r, setR] = useState(ruta)
  const embed = new URLSearchParams(location.search).has('embed')
  // Con un link de demo compartido manda el diseño de esa demo, no el que se estaba previsualizando.
  const [vista, setVista] = useState<string | null>(() => {
    const q = new URLSearchParams(location.search)
    return q.has('demo') ? null : q.get('d') || sessionStorage.getItem('ar-diseno')
  })
  // ?demo=… → carga la demo que armó alguien con sus datos (link compartido)
  useEffect(() => {
    const q = new URLSearchParams(location.search), demo = q.get('demo')
    if (!demo) return
    try { st.cargar(decodificarDemo(demo)); sessionStorage.removeItem('ar-diseno') } catch {}
    q.delete('demo'); history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash)
    // Solo al abrir la página: el link compartido se lee una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [panel, setPanel] = useState(false)
  useEffect(() => {
    const fn = () => {
      const nueva = ruta()
      setR(nueva)
      // En el asistente manda el diseño que elija el usuario, no el que estaba previsualizando.
      if (nueva[0] === 'probar') { setVista(null); sessionStorage.removeItem('ar-diseno') }
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  const pantalla = r[0]
  const esAdmin = pantalla === 'admin'
  const esProbar = pantalla === 'probar'
  // En el panel manda el diseño guardado; en la página pública se puede previsualizar otro.
  const diseno: IdDiseno = (!esAdmin && esDiseno(vista) && vista) || (esDiseno(db.negocio.diseno) ? db.negocio.diseno : 'base')
  useEffect(() => { if (!esProbar) document.documentElement.dataset.d = diseno }, [diseno, esProbar])
  useEffect(() => { document.title = `${db.negocio.nombre} · ${esAdmin ? 'Panel' : 'Reservá tu turno'}` }, [db.negocio.nombre, esAdmin])

  const [alzar, setAlzar] = useState(0)
  useEffect(() => {
    if (esAdmin) return
    const fn = () => { const pie = document.querySelector('.pie'); setAlzar(pie ? Math.max(0, window.innerHeight - pie.getBoundingClientRect().top) : 0) }
    const t = setTimeout(fn, 100)
    window.addEventListener('scroll', fn, { passive: true }); window.addEventListener('resize', fn)
    document.addEventListener('scroll', fn, { passive: true, capture: true })
    return () => { clearTimeout(t); window.removeEventListener('scroll', fn); window.removeEventListener('resize', fn); document.removeEventListener('scroll', fn, { capture: true }) }
  }, [diseno, pantalla, esAdmin])

  const Reserva = RESERVA[diseno]
  const elegir = (id: IdDiseno) => { setVista(id); sessionStorage.setItem('ar-diseno', id) }
  const idx = DISENOS.findIndex((d) => d.id === diseno)
  const mover = (n: number) => elegir(DISENOS[(idx + n + DISENOS.length) % DISENOS.length]!.id)

  return (
    <>
      {esAdmin ? <Admin seccion={r[1]} /> : esProbar ? <Probar /> : r[0] === 'terminos' ? <Terminos /> : <Reserva key={diseno + db.negocio.profesion} />}
      {!esAdmin && !esProbar && !embed && (
        <div className="disenos-flot" style={alzar ? { transform: `translateY(-${Math.min(alzar, 160)}px)` } : undefined}>
          {panel && (
            <div className="disenos-pop" role="dialog" aria-label="Elegir diseño">
              <header><b>Probá la demo</b><button onClick={() => setPanel(false)} aria-label="Cerrar"><X size={16} /></button></header>
              <label className="dp-rubro">Rubro
                <select value={db.negocio.profesion} onChange={(e) => st.reiniciar(e.target.value as IdProfesion)}>
                  {Object.entries(GRUPOS).map(([g, xs]) => <optgroup key={g} label={g}>{xs.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</optgroup>)}
                </select>
              </label>
              <a className="dp-probar" href="#/probar" onClick={() => setPanel(false)}><Sparkles size={16} /> Probalo con tus datos</a>
              <p className="dp-tit">Diseño</p>
              {DISENOS.map((d, i) => (
                <button key={d.id} className={diseno === d.id ? 'sel' : ''} onClick={() => elegir(d.id)}>
                  <span className="muestras">{d.muestra.map((c) => <i key={c} style={{ background: c }} />)}</span>
                  <span><b>{i + 1}. {d.nombre}</b><small>{d.bajada}</small></span>
                </button>
              ))}
              <a className="dp-admin" href="#/admin">Ver el panel del profesional →</a>
            </div>
          )}
          {!panel && <a className="probar-flot" href="#/probar"><Sparkles size={16} /> Probalo con tus datos</a>}
          <div className="disenos-btn">
            <button aria-label="Diseño anterior" onClick={() => mover(-1)}><ChevronLeft size={18} /></button>
            <button className="db-nombre" onClick={() => setPanel(!panel)}>
              <small>Diseño {idx + 1}/{DISENOS.length}</small>{DISENOS[idx]!.nombre}
            </button>
            <button aria-label="Diseño siguiente" onClick={() => mover(1)}><ChevronRight size={18} /></button>
          </div>
        </div>
      )}
    </>
  )
}
