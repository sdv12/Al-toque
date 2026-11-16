"use client";

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { plata } from '../lib/fechas'
import { Modal } from './ui'

export default function Servicios() {
  const st = useStore()
  // Se edita como texto (los inputs numéricos devuelven string) y se convierte al guardar.
  const [ed, setEd] = useState<{ id?: string; nombre: string; duracion: number | string; precio: number | string; activo?: boolean } | null>(null)
  return (
    <div className="vista">
      <div className="v-cab"><h1 className="v-tit">Servicios</h1><button className="btn" onClick={() => setEd({ nombre: '', duracion: 30, precio: 0 })}><Plus size={18} /> Agregar</button></div>
      <div className="card lista">
        {st.db.servicios.map((s) => (
          <div key={s.id} className={'fila-turno' + (s.activo ? '' : ' hecho')} onClick={() => setEd(s!)}>
            <div className="ft-info"><b>{s.nombre}</b><small>{s.duracion} min</small></div>
            <b>{s.precio ? plata(s.precio) : 'Sin cargo'}</b>
            <label className="switch" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={s.activo} onChange={() => st.servicio({ id: s.id, activo: !s.activo })} aria-label="Visible en la web" /><i />
            </label>
          </div>
        ))}
      </div>
      <p className="small muted">El interruptor muestra u oculta el servicio en tu página de reservas.</p>
      {ed && (
        <Modal titulo={ed.id ? 'Editar servicio' : 'Nuevo servicio'} onCerrar={() => setEd(null)}>
          <form className="form-col" onSubmit={(e) => { e.preventDefault(); st.servicio({ ...ed, duracion: Number(ed.duracion), precio: Number(ed.precio) }); setEd(null) }}>
            <label>Nombre<input className="input" value={ed.nombre} onChange={(e) => setEd({ ...ed, nombre: e.target.value })} required autoFocus /></label>
            <div className="fila2">
              <label>Duración (min)<input className="input" type="number" min="5" step="5" value={ed.duracion} onChange={(e) => setEd({ ...ed, duracion: e.target.value })} /></label>
              <label>Precio<input className="input" type="number" min="0" step="500" value={ed.precio} onChange={(e) => setEd({ ...ed, precio: e.target.value })} /></label>
            </div>
            <button className="btn grande">Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
