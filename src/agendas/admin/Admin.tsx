"use client";

import { useState } from 'react'
import { Sun, CalendarDays, Wallet, BarChart3, Users, Tag, Settings, ExternalLink, LogOut, MoreHorizontal, Lock, type LucideIcon } from 'lucide-react'
import { useStore } from '../lib/store'
import { voc, cap } from '../lib/profesiones'
import { avatar } from '../reserva/comun'
import Hoy from './Hoy'
import AgendaAdmin from './AgendaAdmin'
import Caja from './Caja'
import Stats from './Stats'
import Clientes from './Clientes'
import Servicios from './Servicios'
import Ajustes from './Ajustes'

export default function Admin({ seccion = 'hoy' }: { seccion?: string }) {
  const { db } = useStore()
  const [ok, setOk] = useState(() => sessionStorage.getItem('ar-admin') === '1')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)
  const v = voc(db.negocio)

  if (!ok) {
    return (
      <div className="login">
        <form className="card login-card" onSubmit={(e) => { e.preventDefault(); if (pin === db.negocio.pin) { sessionStorage.setItem('ar-admin', '1'); setOk(true) } else setErr(true) }}>
          <div className="login-ico"><Lock size={22} /></div>
          <h1>{db.negocio.nombre}</h1>
          <p className="muted">Ingresá tu PIN para ver la agenda</p>
          <input className="input pin" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => { setPin(e.target.value); setErr(false) }} autoFocus aria-label="PIN" />
          {err && <p className="error">PIN incorrecto</p>}
          <button className="btn grande">Entrar</button>
          <p className="small muted">Demo: PIN <b>1234</b></p>
          <a className="small" href="#/">← Volver a la página de reservas</a>
        </form>
      </div>
    )
  }

  const nav: [string, string, LucideIcon][] = [
    ['hoy', 'Hoy', Sun], ['agenda', 'Agenda', CalendarDays], ['caja', 'Caja', Wallet], ['numeros', 'Números', BarChart3],
    ['clientes', cap(v.personas), Users], ['servicios', 'Servicios', Tag], ['ajustes', 'Ajustes', Settings],
  ]
  const Vista = { hoy: Hoy, agenda: AgendaAdmin, caja: Caja, numeros: Stats, clientes: Clientes, servicios: Servicios, ajustes: Ajustes, mas: Mas }[seccion] || Hoy
  const pendientes = db.turnos.filter((t) => t.estado === 'pendiente').length

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-marca"><span className="adm-av">{avatar(db.negocio)}</span><div><b>{db.negocio.nombre}</b><small>Panel</small></div></div>
        <nav>
          {nav.map(([k, t, I]) => (
            <a key={k} href={'#/admin/' + k} className={seccion === k ? 'act' : ''}><I size={19} />{t}{k === 'hoy' && pendientes > 0 && <em>{pendientes}</em>}</a>
          ))}
        </nav>
        <div className="adm-side-pie">
          <a href="#/" target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ver mi página</a>
          <button onClick={() => { sessionStorage.removeItem('ar-admin'); setOk(false) }}><LogOut size={16} /> Salir</button>
          <small>v{process.env.NEXT_PUBLIC_VERSION} · Producto cordobés 🧉</small>
        </div>
      </aside>
      <main className="adm-main"><Vista /></main>
      <nav className="adm-tabs">
        {[...nav.slice(0, 4), ['mas', 'Más', MoreHorizontal] as [string, string, LucideIcon]].map(([k, t, I]) => (
          <a key={k} href={'#/admin/' + k} className={seccion === k || (k === 'mas' && ['clientes', 'servicios', 'ajustes'].includes(seccion)) ? 'act' : ''}><I size={21} /><span>{t}</span></a>
        ))}
      </nav>
    </div>
  )
}

function Mas() {
  const { db } = useStore()
  const v = voc(db.negocio)
  return (
    <div className="vista">
      <h1 className="v-tit">Más</h1>
      <div className="mas-lista">
        <a className="card" href="#/admin/clientes"><Users size={20} /> {cap(v.personas)}</a>
        <a className="card" href="#/admin/servicios"><Tag size={20} /> Servicios y precios</a>
        <a className="card" href="#/admin/ajustes"><Settings size={20} /> Ajustes, horarios y diseño</a>
        <a className="card" href="#/" target="_blank" rel="noreferrer"><ExternalLink size={20} /> Ver mi página de reservas</a>
        <button className="card" onClick={() => { sessionStorage.removeItem('ar-admin'); location.reload() }}><LogOut size={20} /> Salir</button>
      </div>
      <p className="small muted centro">v{process.env.NEXT_PUBLIC_VERSION} · Términos · Producto cordobés 🧉 · Hecho por sdv12</p>
    </div>
  )
}
