"use client";

import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { useReserva, dur, precio, avatar, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { fechaCorta, fechaLarga, desdeISO, DIAS_C } from '../lib/fechas'
import { PROFESIONES } from '../lib/profesiones'

// Patrón tipo QR determinístico a partir del id (decorativo).
function Codigo({ id }: { id: string }) {
  const celdas: boolean[] = []
  for (let k = 0, s = [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7); k < 121; k++) {
    s = (s * 1103515245 + 12345) % 2147483648
    celdas.push(s / 2147483648 > 0.5)
  }
  const ojo = (i: number) => { const x = i % 11, y = Math.floor(i / 11); const en = (a: number, b: number) => x >= a && x < a + 3 && y >= b && y < b + 3; return en(0, 0) || en(8, 0) || en(0, 8) }
  return <div className="p-qr" aria-hidden="true">{celdas.map((v, i) => <i key={i} className={ojo(i) || v ? 'on' : ''} />)}</div>
}

export default function Pila() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const [datosOk, setDatosOk] = useState(false)
  const paso = hecho ? 5 : !servicio ? 0 : !fecha ? 1 : !hora ? 2 : !datosOk ? 3 : 4

  const apiladas = [
    servicio && { k: 'Servicio', v: servicio.nombre, d: dur(servicio.duracion), c: 'c0', ir: () => { r.setServicio(null); r.setFecha(null); r.setHora(null); setDatosOk(false) } },
    fecha && { k: 'Día', v: fechaLarga(fecha), c: 'c1', ir: () => { r.setFecha(null); r.setHora(null); setDatosOk(false) } },
    hora && { k: 'Hora', v: hora, c: 'c2', ir: () => { r.setHora(null); setDatosOk(false) } },
    datosOk && { k: 'A nombre de', v: f.nombre, c: 'c3', ir: () => setDatosOk(false) },
  ].filter((x): x is { k: string; v: string; d?: string; c: string; ir: () => void } => !!x)

  return (
    <div className="p-fondo">
      <header className="p-cab">
        <span className="p-av">{avatar(negocio)}</span>
        <div><h1>{negocio.nombre}</h1><p>{PROFESIONES[negocio.profesion].nombre}</p></div>
      </header>

      <div className="p-pila">
        {!hecho && apiladas.map((a, i) => (
          <button key={a.k} className={'p-stub ' + a.c} style={{ zIndex: i + 1 }} onClick={a.ir} title="Tocá para cambiar">
            <span><small>{a.k}</small><b>{a.v}</b></span>{a.d && <em>{a.d}</em>}<Check size={18} />
          </button>
        ))}

        {paso === 0 && (
          <section className="p-carta c0 abierta">
            <h2>¿Qué servicio?</h2>
            {r.servicios.map((s) => <button key={s.id} className="p-op" onClick={() => r.setServicio(s)}><b>{s.nombre}</b><span>{dur(s.duracion)}</span><span>{precio(s.precio)}</span></button>)}
          </section>
        )}
        {paso === 1 && (
          <section className="p-carta c1 abierta">
            <h2>¿Qué día?</h2>
            <div className="p-dias">{r.dias.slice(0, 12).map((d) => { const x = desdeISO(d); return <button key={d} disabled={!r.libres(d).length} onClick={() => r.setFecha(d)}><small>{DIAS_C[x.getDay()]}</small><b>{x.getDate()}</b></button> })}</div>
          </section>
        )}
        {paso === 2 && (
          <section className="p-carta c2 abierta">
            <h2>¿A qué hora?</h2>
            <div className="p-horas">{r.horas.map((h) => <button key={h} onClick={() => r.setHora(h)}>{h}</button>)}</div>
            <ListaEspera onEnviar={r.anotarEspera} clase="p-espera" />
          </section>
        )}
        {paso === 3 && (
          <form className="p-carta c3 abierta" onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) setDatosOk(true) }}>
            <h2>Tus datos</h2>
            <input placeholder="Nombre y apellido" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} autoFocus />
            <input placeholder="WhatsApp" inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} />
            <input placeholder={r.v.nota} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} />
            <button className="p-cta" disabled={!f.nombre.trim() || !telValido(f.tel)}>Guardar</button>
          </form>
        )}
        {paso === 4 && (
          <section className="p-carta c4 abierta p-final">
            <h2>Todo listo</h2>
            <p>Revisá la pila de arriba: tocá cualquier tarjeta para cambiarla.</p>
            <div className="p-total"><span>Total</span><b>{precio(servicio!.precio!)}</b></div>
            <button className="p-cta" onClick={() => r.confirmar(f)}>Confirmar {r.v.atencion}</button>
          </section>
        )}
        {hecho && (
          <section className="p-pase">
            <div className="p-pase-cab"><b>{negocio.nombre}</b><span>PASE</span></div>
            <div className="p-pase-cuerpo">
              <div><small>{r.v.persona}</small><b>{hecho.nombre}</b></div>
              <div><small>servicio</small><b>{hecho.servicio.nombre}</b></div>
              <div><small>día</small><b>{fechaCorta(hecho.fecha)}</b></div>
              <div><small>hora</small><b>{hecho.hora}</b></div>
            </div>
            <Codigo id={hecho.id} />
            <p className="p-nro">#{hecho.id.slice(0, 6).toUpperCase()}</p>
            <div className="p-acc">
              <button onClick={() => descargarICS(negocio, hecho, hecho.servicio)}>Agregar al calendario</button>
              <a href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            <button className="p-otra" onClick={() => { r.reiniciar(); setDatosOk(false); setF({ nombre: '', tel: '', notas: '' }) }}><RotateCcw size={14} /> Otra reserva</button>
          </section>
        )}
      </div>
      <Pie clase="p-pie" />
    </div>
  )
}
