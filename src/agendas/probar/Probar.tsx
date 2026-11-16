"use client";
/* eslint-disable @next/next/no-img-element -- los logos son data URL guardados en el navegador: next/image no los optimiza. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, Upload, Smartphone, Monitor, Eye, X, Check, Copy, LayoutDashboard, ExternalLink, MessageCircle } from 'lucide-react'
import { useStore } from '../lib/store'
import type { Franja, Horarios, Negocio, Servicio } from '../lib/tipos'
import { PROFESIONES, GRUPOS, type IdProfesion } from '../lib/profesiones'
import { DISENOS } from '../lib/disenos'
import { DIAS } from '../lib/fechas'
import { leerLogo, iniciales } from '../reserva/comun'
import { WHATSAPP_VENTAS } from '../lib/ventas'
import { enviarPedido, type ResultadoPedido } from '@/app/(sitio)/(kit)/pedido'
import { formatearPesos } from '@/core/lib/mensajes'
import { planAgenda } from '@/core/lib/precios'

const PASOS = ['Tu negocio', 'Servicios', 'Horarios', 'Contacto', 'Diseño']
const uid = () => Math.random().toString(36).slice(2, 10)
const F = (a: string, b: string): Franja => [a, b]
const ATAJOS: [string, Horarios][] = [
  ['Lun a Vie · 9 a 18', { 1: [F('09:00', '18:00')], 2: [F('09:00', '18:00')], 3: [F('09:00', '18:00')], 4: [F('09:00', '18:00')], 5: [F('09:00', '18:00')], 6: [], 0: [] }],
  ['Lun a Vie cortado + Sáb', { 1: [F('09:00', '13:00'), F('16:00', '20:00')], 2: [F('09:00', '13:00'), F('16:00', '20:00')], 3: [F('09:00', '13:00'), F('16:00', '20:00')], 4: [F('09:00', '13:00'), F('16:00', '20:00')], 5: [F('09:00', '13:00'), F('16:00', '20:00')], 6: [F('09:00', '13:00')], 0: [] }],
  ['Solo tardes', { 1: [F('14:00', '21:00')], 2: [F('14:00', '21:00')], 3: [F('14:00', '21:00')], 4: [F('14:00', '21:00')], 5: [F('14:00', '21:00')], 6: [], 0: [] }],
  ['Mar a Sáb · 10 a 20', { 1: [], 2: [F('10:00', '20:00')], 3: [F('10:00', '20:00')], 4: [F('10:00', '20:00')], 5: [F('10:00', '20:00')], 6: [F('10:00', '20:00')], 0: [] }],
]

import { codificarDemo } from '../lib/demo'
export { codificarDemo, decodificarDemo } from '../lib/demo'

export default function Probar() {
  const st = useStore()
  const { db } = st
  const n = db.negocio
  const [paso, setPaso] = useState(0)
  const [fin, setFin] = useState(false)
  const [disp, setDisp] = useState<'cel' | 'pc'>('cel')
  const [verPrev, setVerPrev] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const tocoServicios = useRef(false)
  const neg = (patch: Partial<Negocio>) => st.negocio(patch)
  const servs = (fn: (xs: Servicio[]) => Servicio[]) => { tocoServicios.current = true; st.set((d) => ({ servicios: fn(d.servicios) })) }
  const src = useMemo(() => `${location.pathname}?d=${n.diseno}&embed=1#/`, [n.diseno])
  useEffect(() => { document.documentElement.dataset.d = 'base' })

  function cambiarRubro(k: IdProfesion) {
    const p = PROFESIONES[k]
    const patch: Partial<Negocio> = { profesion: k }
    if (!n.nombre || Object.values(PROFESIONES).some((x) => x.demo === n.nombre)) patch.nombre = p.demo
    neg(patch)
    if (!tocoServicios.current) st.set(() => ({ servicios: p.servicios.map(([nombre, duracion, precio]) => ({ id: uid(), nombre, duracion, precio, activo: true })) }))
  }
  const franja = (d: number, i: number, j: number, v: string) => neg({ horarios: { ...n.horarios, [d]: (n.horarios[d] ?? []).map((f, k): Franja => (k === i ? (j === 0 ? [v, f[1]] : [f[0], v]) : f)) } })
  const link = `${location.origin}${location.pathname}?demo=${codificarDemo(db)}#/`
  const completo = n.nombre.trim() && db.servicios.some((s) => s.activo && s.nombre.trim()) && Object.values(n.horarios).some((x) => x.length)

  function terminar() { st.regenerar(); setFin(true) }

  const pasos = [
    // 1 · negocio
    <div className="pr-campos" key="0">
      <label>¿Cómo se llama tu negocio?<input className="input" value={n.nombre} onChange={(e) => neg({ nombre: e.target.value })} placeholder="Ej: Lic. Laura Pérez" autoFocus /></label>
      <label>¿A qué te dedicás?
        <select className="input" value={n.profesion} onChange={(e) => cambiarRubro(e.target.value as IdProfesion)}>
          {Object.entries(GRUPOS).map(([g, xs]) => <optgroup key={g} label={g}>{xs.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</optgroup>)}
        </select>
      </label>
      <p className="pr-ayuda">Cambia las palabras de tu página: “{PROFESIONES[n.profesion].persona}”, “{PROFESIONES[n.profesion].atencion}”.</p>
      <label>Frase de bienvenida<textarea className="input" rows={2} value={n.descripcion} onChange={(e) => neg({ descripcion: e.target.value })} /></label>
      <div className="pr-logo">
        <span className="pr-logo-prev">{n.logo ? <img src={n.logo} alt="" /> : iniciales(n.nombre || 'Tu negocio')}</span>
        <div>
          <b>Logo o foto</b><small>Opcional. Si no subís nada, usamos tus iniciales.</small>
          <div className="pr-logo-acc">
            <label className="btn sec chico"><Upload size={16} /> Subir<input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) neg({ logo: await leerLogo(f) }) }} /></label>
            {n.logo && <button className="btn sec chico" onClick={() => neg({ logo: '' })}>Quitar</button>}
          </div>
        </div>
      </div>
    </div>,
    // 2 · servicios
    <div className="pr-campos" key="1">
      <p className="pr-ayuda">Cargamos los típicos de {PROFESIONES[n.profesion].nombre.toLowerCase()}. Cambiá nombres, precios y duración, o agregá los tuyos.</p>
      <div className="pr-servs">
        <div className="pr-serv pr-serv-cab"><span>Servicio</span><span>Minutos</span><span>Precio $</span><span /></div>
        {db.servicios.map((s) => (
          <div key={s.id} className={'pr-serv' + (s.activo ? '' : ' off')}>
            <input className="input" value={s.nombre} onChange={(e) => servs((xs) => xs.map((x) => (x.id === s.id ? { ...x, nombre: e.target.value } : x)))} aria-label="Nombre del servicio" />
            <input className="input" type="number" min="5" step="5" value={s.duracion} onChange={(e) => servs((xs) => xs.map((x) => (x.id === s.id ? { ...x, duracion: Math.max(5, Number(e.target.value) || 5) } : x)))} aria-label="Duración en minutos" />
            <input className="input" type="number" min="0" step="500" value={s.precio} onChange={(e) => servs((xs) => xs.map((x) => (x.id === s.id ? { ...x, precio: Number(e.target.value) || 0 } : x)))} aria-label="Precio" />
            <button className="icon" aria-label="Quitar servicio" onClick={() => servs((xs) => xs.filter((x) => x.id !== s.id))}><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      {db.servicios.length < 15 && <button className="btn sec" onClick={() => servs((xs) => [...xs, { id: uid(), nombre: 'Nuevo servicio', duracion: 30, precio: 0, activo: true }])}><Plus size={16} /> Agregar servicio</button>}
    </div>,
    // 3 · horarios
    <div className="pr-campos" key="2">
      <p className="lbl">Atajos</p>
      <div className="chips">{ATAJOS.map(([t, h]) => <button key={t} className={'chip' + (JSON.stringify(h) === JSON.stringify(n.horarios) ? ' sel' : '')} onClick={() => neg({ horarios: h })}>{t}</button>)}</div>
      <p className="lbl" style={{ marginTop: '.6rem' }}>Día por día</p>
      <div className="pr-dias">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => (
          <div key={d} className="pr-dia">
            <label className="switch"><input type="checkbox" checked={n.horarios[d]!.length > 0} onChange={() => neg({ horarios: { ...n.horarios, [d]: n.horarios[d]!.length ? [] : [F('09:00', '18:00')] } })} aria-label={'Abre ' + DIAS[d]} /><i /></label>
            <span className="pr-dia-n">{DIAS[d]}</span>
            <div className="pr-franjas">
              {!n.horarios[d]!.length && <span className="muted small">Cerrado</span>}
              {n.horarios[d]!.map((f, i) => (
                <span key={i} className="franja">
                  <input className="input chico" type="time" step="900" value={f[0]} onChange={(e) => franja(d, i, 0, e.target.value)} />–
                  <input className="input chico" type="time" step="900" value={f[1]} onChange={(e) => franja(d, i, 1, e.target.value)} />
                  {i > 0 && <button className="icon" aria-label="Quitar franja" onClick={() => neg({ horarios: { ...n.horarios, [d]: n.horarios[d]!.filter((_, k) => k !== i) } })}><X size={14} /></button>}
                </span>
              ))}
              {n.horarios[d]!.length === 1 && <button className="pr-mas" onClick={() => neg({ horarios: { ...n.horarios, [d]: [...(n.horarios[d] ?? []), F('16:00', '20:00')] } })}>+ cortado</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="fila2">
        <label>Ofrecer turnos cada<select className="input" value={n.intervalo} onChange={(e) => neg({ intervalo: Number(e.target.value) })}>{[10, 15, 20, 30, 45, 60].map((x) => <option key={x} value={x}>{x} min</option>)}</select></label>
        <label>Reservar con al menos<select className="input" value={n.anticipacion} onChange={(e) => neg({ anticipacion: Number(e.target.value) })}>{[[0, 'Sin mínimo'], [60, '1 hora'], [180, '3 h'], [720, '12 h'], [1440, '1 día']].map(([x, t]) => <option key={x} value={x}>{t}</option>)}</select></label>
      </div>
    </div>,
    // 4 · contacto
    <div className="pr-campos" key="3">
      <label>Dirección<input className="input" value={n.direccion} onChange={(e) => neg({ direccion: e.target.value })} placeholder="Calle 123, Barrio, Ciudad" /></label>
      <p className="pr-ayuda">Si atendés online o a domicilio, escribilo acá (“Online por Meet”, “A domicilio en zona norte”).</p>
      <label>WhatsApp del negocio<input className="input" inputMode="tel" value={n.whatsapp} onChange={(e) => neg({ whatsapp: e.target.value.replace(/[^\d]/g, '') })} placeholder="5493511234567" /></label>
      <p className="pr-ayuda">Tus {PROFESIONES[n.profesion].personas} te escriben acá después de reservar.</p>
    </div>,
    // 5 · diseño
    <div className="pr-campos" key="4">
      <p className="pr-ayuda">Tocá uno y mirá cómo queda tu página al costado.</p>
      <div className="pr-disenos">
        {DISENOS.map((d) => (
          <button key={d.id} className={'diseno-op' + (n.diseno === d.id ? ' sel' : '')} onClick={() => neg({ diseno: d.id })}>
            <span className="muestras">{d.muestra.map((c) => <i key={c} style={{ background: c }} />)}</span>
            <b>{d.nombre}</b><small>{d.bajada}</small>
          </button>
        ))}
      </div>
    </div>,
  ]

  return (
    <div className="pr">
      <section className="pr-izq">
        <header className="pr-cab">
          <a href="#/" className="pr-volver"><ArrowLeft size={18} /> Volver a la demo</a>
          <h1>Probalo con tus datos</h1>
          <p className="muted">En 2 minutos ves tu página de reservas y tu panel. No hace falta cuenta.</p>
        </header>

        {fin ? (
          <div className="pr-fin card">
            <div className="pr-fin-ico"><Check size={28} /></div>
            <h2>¡Tu página está lista!</h2>
            <p className="muted">Cargamos turnos de ejemplo con tus servicios para que veas cómo quedarían tu caja y tus números.</p>
            <a className="btn grande" href="#/"><ExternalLink size={18} /> Ver mi página de reservas</a>
            <a className="btn grande sec" href="#/admin/hoy" onClick={() => sessionStorage.setItem('ar-admin', '1')}><LayoutDashboard size={18} /> Ver mi panel (caja, agenda, números)</a>
            <div className="pr-link">
              <p className="lbl">Link de tu demo para compartir</p>
              <div><input className="input" readOnly value={link} onFocus={(e) => e.target.select()} /><button className="btn sec" onClick={() => { navigator.clipboard?.writeText(link); setCopiado(true); setTimeout(() => setCopiado(false), 1500) }}><Copy size={16} /> {copiado ? '¡Copiado!' : 'Copiar'}</button></div>
              <p className="small muted">Cualquiera que lo abra ve tu página con tus servicios y horarios (sin el logo).</p>
            </div>
            <LoQuiero link={link} />
            <button className="pr-link-btn" onClick={() => { setFin(false); setPaso(0) }}>Seguir editando</button>
          </div>
        ) : (
          <>
            <ol className="pr-pasos">
              {PASOS.map((t, i) => <li key={t}><button className={i === paso ? 'act' : i < paso ? 'ok' : ''} onClick={() => setPaso(i)}><span>{i < paso ? <Check size={13} /> : i + 1}</span>{t}</button></li>)}
            </ol>
            <div className="card pr-card">
              <h2>{PASOS[paso]}</h2>
              {pasos[paso]}
            </div>
            <div className="pr-nav">
              <button className="btn sec" disabled={paso === 0} onClick={() => setPaso(paso - 1)}><ArrowLeft size={18} /> Atrás</button>
              <button className="btn sec pr-ver" onClick={() => setVerPrev(true)}><Eye size={18} /> Ver</button>
              {paso < PASOS.length - 1
                ? <button className="btn" onClick={() => setPaso(paso + 1)}>Siguiente <ArrowRight size={18} /></button>
                : <button className="btn" disabled={!completo} onClick={terminar}>Ver resultado <Check size={18} /></button>}
            </div>
            {!completo && paso === PASOS.length - 1 && <p className="small error">Falta el nombre, al menos un servicio o al menos un día abierto.</p>}
          </>
        )}
      </section>

      <section className={'pr-der' + (verPrev ? ' abierta' : '')}>
        <div className="pr-der-barra">
          <span>Vista previa en vivo</span>
          <div className="seg chico">
            <button className={disp === 'cel' ? 'sel' : ''} onClick={() => setDisp('cel')}><Smartphone size={15} /> Celular</button>
            <button className={disp === 'pc' ? 'sel' : ''} onClick={() => setDisp('pc')}><Monitor size={15} /> Compu</button>
          </div>
          <button className="icon pr-cerrar" aria-label="Cerrar vista previa" onClick={() => setVerPrev(false)}><X size={20} /></button>
        </div>
        <div className={'pr-marco ' + disp}>
          <iframe key={src} src={src} title="Vista previa de tu página" />
        </div>
      </section>
    </div>
  )
}

/**
 * "Lo quiero": pide un número de pedido, abre WhatsApp con un mensaje corto y deja la configuración
 * completa (y el link de la demo) de respaldo por mail, como los pedidos de landings y cajas.
 */
function LoQuiero({ link }: { link: string }) {
  const { db } = useStore()
  const n = db.negocio
  const [enviando, setEnviando] = useState(false)
  const [r, setR] = useState<ResultadoPedido | null>(null)
  const plan = planAgenda()
  const estimado = `${formatearPesos(plan.unico)} + ${formatearPesos(plan.mensual)}/mes`
  const servicios = db.servicios.filter((s) => s.activo)

  async function pedir() {
    setEnviando(true)
    const negocio: Partial<Negocio> = { ...n }
    delete negocio.logo
    delete negocio.pin
    setR(await enviarPedido({
      tipo: 'Agenda',
      negocio: n.nombre,
      detalle: `${PROFESIONES[n.profesion].nombre} · diseño ${n.diseno} · ${servicios.length} servicios`,
      estimado,
      slug: n.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      saludo: `¡Hola! Quiero la agenda de turnos para ${n.nombre}.`,
      resumen: [`Rubro: ${PROFESIONES[n.profesion].nombre}`, `Servicios: ${servicios.map((s) => s.nombre).join(', ')}`, `Estimado: ${estimado}`, `Mi demo: ${link}`],
      configuracion: { negocio, servicios: db.servicios },
      codigo: link,
    }, WHATSAPP_VENTAS || undefined))
    setEnviando(false)
  }

  if (r) return (
    <div className="pr-link" role="status">
      <p className="lbl">{r.numero ? `¡Listo! Tu pedido es el ${r.numero}` : '¡Listo! Recibimos tu pedido'}</p>
      <p className="small muted">{r.porWhatsapp ? 'Se abrió WhatsApp con el resumen: mandalo y te escribimos.' : 'Te escribimos al WhatsApp que nos dejes.'}</p>
      {r.link && !r.porWhatsapp && <a className="btn grande pr-quiero" href={r.link} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Abrir WhatsApp</a>}
    </div>
  )
  return (
    <>
      <button className="btn grande pr-quiero" disabled={enviando} onClick={pedir}><MessageCircle size={18} /> {enviando ? 'Enviando…' : 'Lo quiero para mi negocio'}</button>
      <p className="small muted centro">Desde {estimado}. Te confirmamos el precio final por WhatsApp.</p>
    </>
  )
}
