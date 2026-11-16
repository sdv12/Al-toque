import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Globe, CalendarCheck, ArrowLeft } from 'lucide-react'
import { useReserva, dur, precio, avatar, telValido, descargarICS, avisoWa, ListaEspera, Pie } from './comun'
import { iso, hoyISO, desdeISO, fechaLarga, MESES, aMin, aHora } from '../lib/fechas'
import { PROFESIONES } from '../lib/profesiones'

const SEM = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

export default function Mes() {
  const r = useReserva()
  const { negocio, servicio, fecha, hora, hecho } = r
  const [off, setOff] = useState(0)
  const [form, setForm] = useState(false)
  const [f, setF] = useState({ nombre: '', tel: '', notas: '' })
  const hoy = desdeISO(hoyISO())
  const base = new Date(hoy.getFullYear(), hoy.getMonth() + off, 1)
  const vacios = (base.getDay() + 6) % 7
  const nDias = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
  const limite = iso(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 60))
  const celdas = [...Array(vacios).fill(null), ...Array.from({ length: nDias }, (_, i) => iso(new Date(base.getFullYear(), base.getMonth(), i + 1)))]

  return (
    <div className="m-fondo">
      <div className="m-caja">
        <aside className="m-perfil">
          <div className="m-av">{avatar(negocio)}</div>
          <p className="m-prof">{PROFESIONES[negocio.profesion].nombre}</p>
          <h1>{negocio.nombre}</h1>
          <ul className="m-datos">
            {servicio && <li><Clock size={16} /> {dur(servicio.duracion)}</li>}
            <li><MapPin size={16} /> {negocio.direccion}</li>
            <li><Globe size={16} /> Hora de Argentina</li>
          </ul>
          <p className="m-desc">{negocio.descripcion}</p>
          <p className="m-lbl">Servicio</p>
          <div className="m-servs" role="radiogroup">
            {r.servicios.map((s) => (
              <button key={s.id} role="radio" aria-checked={servicio?.id === s.id} className={servicio?.id === s.id ? 'sel' : ''} onClick={() => { r.setServicio(s); r.setHora(null); setForm(false) }} disabled={!!hecho}>
                <i /><span>{s.nombre}</span><small>{precio(s.precio)}</small>
              </button>
            ))}
          </div>
        </aside>

        {hecho ? (
          <section className="m-hecho">
            <CalendarCheck size={44} />
            <h2>¡Listo, quedó agendado!</h2>
            <p>Te mandamos los detalles. Si necesitás cambiarlo, escribinos por WhatsApp.</p>
            <dl>
              <dt>Qué</dt><dd>{hecho.servicio.nombre}</dd>
              <dt>Cuándo</dt><dd>{fechaLarga(hecho.fecha)}, {hecho.hora} – {aHora(aMin(hecho.hora) + hecho.servicio.duracion)}</dd>
              <dt>Dónde</dt><dd>{negocio.direccion}</dd>
            </dl>
            <div className="m-acc">
              <button className="m-btn" onClick={() => descargarICS(negocio, hecho, hecho.servicio)}>Agregar a mi calendario</button>
              <a className="m-btn sec" href={avisoWa(negocio, hecho, hecho.servicio, hecho.nombre)} target="_blank" rel="noreferrer">WhatsApp</a>
            </div>
            <button className="m-link" onClick={() => { r.reiniciar(); setForm(false) }}>Agendar otro</button>
          </section>
        ) : form ? (
          <section className="m-form">
            <button className="m-volver" onClick={() => setForm(false)}><ArrowLeft size={18} /></button>
            <h2>Completá tus datos</h2>
            <p className="m-cuando">{servicio!.nombre!} · {fechaLarga(fecha!)}, {hora}</p>
            <form onSubmit={(e) => { e.preventDefault(); if (f.nombre.trim() && telValido(f.tel)) r.confirmar(f) }}>
              <label>Nombre y apellido *<input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required autoFocus /></label>
              <label>WhatsApp *<input inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} required /></label>
              <label>{r.v.nota}<textarea rows={3} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></label>
              <p className="m-legal">Al confirmar aceptás los <a href="#/terminos">términos</a>.</p>
              <button className="m-btn" disabled={!f.nombre.trim() || !telValido(f.tel)}>Confirmar {r.v.atencion}</button>
            </form>
          </section>
        ) : (
          <>
            <section className="m-cal">
              <h2>Elegí día y horario</h2>
              <div className="m-mes">
                <b>{MESES[base.getMonth()]} {base.getFullYear()}</b>
                <div>
                  <button aria-label="Mes anterior" disabled={off === 0} onClick={() => setOff(off - 1)}><ChevronLeft size={18} /></button>
                  <button aria-label="Mes siguiente" disabled={off >= 2} onClick={() => setOff(off + 1)}><ChevronRight size={18} /></button>
                </div>
              </div>
              <div className="m-grilla">
                {SEM.map((d) => <span key={d} className="m-sem">{d}</span>)}
                {celdas.map((d, i) => {
                  if (!d) return <span key={'v' + i} />
                  const ok = servicio && d >= hoyISO() && d <= limite && r.libres(d).length > 0
                  return (
                    <button key={d} disabled={!ok} className={(fecha === d ? 'sel ' : '') + (d === hoyISO() ? 'hoy' : '')} onClick={() => { r.setFecha(d); r.setHora(null) }}>
                      {desdeISO(d).getDate()}
                    </button>
                  )
                })}
              </div>
              {!servicio && <p className="m-aviso">Primero elegí un servicio a la izquierda.</p>}
            </section>
            <section className={'m-horas' + (fecha && servicio ? ' abierta' : '')}>
              {fecha && servicio ? (
                <>
                  <p className="m-dia">{fechaLarga(fecha)}</p>
                  <div className="m-lista">
                    {r.horas.map((h) => (
                      <div key={h} className={'m-hora' + (hora === h ? ' sel' : '')}>
                        <button onClick={() => r.setHora(h)}>{h}</button>
                        {hora === h && <button className="m-sig" onClick={() => setForm(true)}>Siguiente</button>}
                      </div>
                    ))}
                  </div>
                  <ListaEspera onEnviar={r.anotarEspera} clase="m-espera" />
                </>
              ) : <p className="m-vacio">Los horarios aparecen al elegir un día.</p>}
            </section>
          </>
        )}
      </div>
      <Pie clase="m-pie" />
    </div>
  )
}
