"use client";
/* eslint-disable @next/next/no-img-element -- los logos son data URL guardados en el navegador: next/image no los optimiza. */

import { useState, type InputHTMLAttributes } from 'react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../lib/store'
import { PROFESIONES, GRUPOS, type IdProfesion } from '../lib/profesiones'
import { DISENOS } from '../lib/disenos'
import { DIAS } from '../lib/fechas'
import { leerLogo } from '../reserva/comun'
import type { Franja } from '../lib/tipos'

export default function Ajustes() {
  const st = useStore()
  const n = st.db.negocio
  type CampoTexto = 'nombre' | 'descripcion' | 'direccion' | 'whatsapp' | 'pin'
  const campo = (k: CampoTexto, label: string, props: InputHTMLAttributes<HTMLInputElement> = {}) => <label>{label}<input className="input" value={n[k]} onChange={(e) => st.negocio({ [k]: e.target.value })} {...props} /></label>
  const setFranja = (d: number, i: number, j: number, val: string) => st.negocio({ horarios: { ...n.horarios, [d]: (n.horarios[d] ?? []).map((f, k): Franja => (k === i ? (j === 0 ? [val, f[1]] : [f[0], val]) : f)) } })
  const [prof, setProf] = useState<IdProfesion>(n.profesion)

  return (
    <div className="vista">
      <h1 className="v-tit">Ajustes</h1>

      <section className="card form-col">
        <h2 className="s-tit">Diseño de tu página</h2>
        <div className="disenos">
          {DISENOS.map((d) => (
            <button key={d.id} className={'diseno-op' + (n.diseno === d.id ? ' sel' : '')} onClick={() => { sessionStorage.removeItem('ar-diseno'); st.negocio({ diseno: d.id }) }}>
              <span className="muestras">{d.muestra.map((c) => <i key={c} style={{ background: c }} />)}</span>
              <b>{d.nombre}</b><small>{d.bajada}</small>
            </button>
          ))}
        </div>
        <p className="small muted">El panel también toma la tipografía y los colores del diseño elegido.</p>
      </section>

      <section className="card form-col">
        <h2 className="s-tit">Tu negocio</h2>
        {campo('nombre', 'Nombre')}
        <label>Profesión
          <select className="input" value={prof} onChange={(e) => { setProf(e.target.value as IdProfesion); st.negocio({ profesion: e.target.value as IdProfesion }) }}>
            {Object.entries(GRUPOS).map(([g, xs]) => <optgroup key={g} label={g}>{xs.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</optgroup>)}
          </select>
        </label>
        <p className="small muted">Cambia el vocabulario (“{PROFESIONES[prof].persona}”, “{PROFESIONES[prof].atencion}”). Tus servicios no se tocan.</p>
        <button type="button" className="btn sec" onClick={() => confirm(`Se agregan los servicios típicos de ${PROFESIONES[prof].nombre} y se ocultan los actuales (no se borran). ¿Seguimos?`) && st.cargarServiciosRubro(prof)}>Cargar servicios típicos del rubro</button>
        <div className="pr-logo">
          <span className="pr-logo-prev">{n.logo ? <img src={n.logo} alt="" /> : n.nombre.slice(0, 2).toUpperCase()}</span>
          <div><b>Logo o foto</b><small>Aparece en tu página y en el panel.</small>
            <div className="pr-logo-acc">
              <label className="btn sec chico">Subir<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) st.negocio({ logo: await leerLogo(f) }) }} /></label>
              {n.logo && <button className="btn sec chico" onClick={() => st.negocio({ logo: '' })}>Quitar</button>}
            </div>
          </div>
        </div>
        {campo('descripcion', 'Texto de bienvenida')}
        {campo('direccion', 'Dirección')}
        {campo('whatsapp', 'WhatsApp (con 549)', { inputMode: 'tel' })}
      </section>

      <section className="card form-col">
        <h2 className="s-tit">Horarios de atención</h2>
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <div key={d} className="horario-dia">
            <span>{DIAS[d]}</span>
            <div>
              {!n.horarios[d]!.length && <span className="muted small">Cerrado</span>}
              {n.horarios[d]!.map((f, i) => (
                <span key={i} className="franja">
                  <input className="input chico" type="time" step="900" value={f[0]} onChange={(e) => setFranja(d, i, 0, e.target.value)} />–
                  <input className="input chico" type="time" step="900" value={f[1]} onChange={(e) => setFranja(d, i, 1, e.target.value)} />
                  <button className="icon" aria-label="Quitar franja" onClick={() => st.negocio({ horarios: { ...n.horarios, [d]: n.horarios[d]!.filter((_, k) => k !== i) } })}><X size={16} /></button>
                </span>
              ))}
              {n.horarios[d]!.length < 3 && <button className="icon" aria-label="Agregar franja" onClick={() => st.negocio({ horarios: { ...n.horarios, [d]: [...(n.horarios[d] ?? []), ['09:00', '13:00']] } })}><Plus size={16} /></button>}
            </div>
          </div>
        ))}
        <div className="fila2">
          <label>Cada cuánto ofrecer horarios
            <select className="input" value={n.intervalo} onChange={(e) => st.negocio({ intervalo: Number(e.target.value) })}>{[10, 15, 20, 30, 60].map((x) => <option key={x} value={x}>{x} min</option>)}</select>
          </label>
          <label>Anticipación mínima
            <select className="input" value={n.anticipacion} onChange={(e) => st.negocio({ anticipacion: Number(e.target.value) })}>{[[0, 'Ninguna'], [60, '1 hora'], [120, '2 horas'], [720, '12 horas'], [1440, '1 día']].map(([x, t]) => <option key={x} value={x}>{t}</option>)}</select>
          </label>
        </div>
      </section>

      <section className="card form-col">
        <h2 className="s-tit">Seguridad y demo</h2>
        {campo('pin', 'PIN del panel', { inputMode: 'numeric', maxLength: 6 })}
        <button className="btn sec peligro" onClick={() => confirm('Se borran todos los datos y se cargan datos de ejemplo para el rubro elegido. ¿Seguro?') && st.reiniciar(n.profesion)}>Reiniciar datos de ejemplo</button>
      </section>
    </div>
  )
}
