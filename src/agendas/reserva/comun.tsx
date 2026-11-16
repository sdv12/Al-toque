"use client";
/* eslint-disable @next/next/no-img-element -- los logos son data URL guardados en el navegador: next/image no los optimiza. */

import { useMemo, useState } from 'react'
import { useStore, waLink } from '../lib/store'
import type { Negocio, Servicio, Turno } from '../lib/tipos'
import { horariosLibres, proximosDias, fechaLarga, plata, aMin, aHora } from '../lib/fechas'
import { voc } from '../lib/profesiones'

/** Turno recién reservado, con el servicio y el nombre a mano para la pantalla final. */
export type Hecho = Turno & { servicio: Servicio; nombre: string }

// Lógica compartida por los diseños de reserva: cada diseño solo pone la cara.
export function useReserva() {
  const st = useStore()
  const { db } = st
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [fecha, setFecha] = useState<string | null>(null)
  const [hora, setHora] = useState<string | null>(null)
  const [hecho, setHecho] = useState<Hecho | null>(null)
  const servicios = db.servicios.filter((s) => s.activo)
  const dias = useMemo(() => proximosDias(db.negocio, 21), [db.negocio])
  const libres = (f: string, s: Servicio | null = servicio): string[] => (s ? horariosLibres(db.negocio, db.turnos, db.bloqueos, f, s.duracion) : [])
  const horas = fecha ? libres(fecha) : []
  const v = voc(db.negocio)

  function confirmar({ nombre, tel, notas }: { nombre: string; tel: string; notas?: string }): Turno {
    if (!servicio || !fecha || !hora) throw new Error('Falta elegir servicio, día u hora')
    const t = st.reservar({ servicioId: servicio.id, fecha, hora, nombre: nombre.trim(), tel, notas })
    setHecho({ ...t, servicio, nombre })
    return t
  }
  function anotarEspera({ nombre, tel, preferencia }: { nombre: string; tel: string; preferencia: string }) {
    st.esperar({ nombre, tel, servicioId: servicio?.id, preferencia })
  }
  function reiniciar() { setServicio(null); setFecha(null); setHora(null); setHecho(null) }

  return { db, negocio: db.negocio, v, servicios, dias, libres, horas, servicio, setServicio, fecha, setFecha, hora, setHora, hecho, confirmar, anotarEspera, reiniciar }
}

export const dur = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`)
export const precio = (p: number) => (p ? plata(p) : 'Sin cargo')
export const iniciales = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0] ?? '').join('').toUpperCase()
export const telValido = (t: string) => String(t).replace(/\D/g, '').length >= 8
export const separarFranjas = (horas: string[]) => ({ manana: horas.filter((h) => aMin(h) < 13 * 60), tarde: horas.filter((h) => aMin(h) >= 13 * 60) })

export function descargarICS(negocio: Negocio, t: Turno, servicio: Pick<Servicio, 'nombre' | 'duracion'>) {
  const f = t.fecha.replace(/-/g, '')
  const ini = t.hora.replace(':', '') + '00'
  const fin = aHora(aMin(t.hora) + servicio.duracion).replace(':', '') + '00'
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Agenda//ES', 'BEGIN:VEVENT', `UID:${t.id}@agenda`, `DTSTART:${f}T${ini}`, `DTEND:${f}T${fin}`, `SUMMARY:${servicio.nombre} · ${negocio.nombre}`, `LOCATION:${negocio.direccion}`, 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Recordatorio', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  a.download = 'turno.ics'
  a.click()
}

export const avisoWa = (negocio: Negocio, t: Turno, servicio: Pick<Servicio, 'nombre'>, nombre: string) =>
  waLink(negocio.whatsapp, `Hola! Soy ${nombre}. Reservé ${servicio.nombre} el ${fechaLarga(t.fecha)} a las ${t.hora}.`)

// Mini formulario de lista de espera, reutilizable con clases propias de cada diseño.
export function ListaEspera({ onEnviar, clase = '' }: { onEnviar: (f: { nombre: string; tel: string; preferencia: string }) => void; clase?: string }) {
  const [abierto, setAbierto] = useState(false)
  const [ok, setOk] = useState(false)
  const [f, setF] = useState({ nombre: '', tel: '', preferencia: '' })
  if (ok) return <p className={'espera-ok ' + clase}>Listo, te avisamos si se libera un lugar.</p>
  if (!abierto) return <button type="button" className={'link-espera ' + clase} onClick={() => setAbierto(true)}>¿No te sirve ningún horario? Sumate a la lista de espera</button>
  return (
    <form className={'form-espera ' + clase} onSubmit={(e) => { e.preventDefault(); if (!f.nombre || !telValido(f.tel)) return; onEnviar(f); setOk(true) }}>
      <input placeholder="Tu nombre" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required />
      <input placeholder="WhatsApp" inputMode="tel" value={f.tel} onChange={(e) => setF({ ...f, tel: e.target.value })} required />
      <input placeholder="¿Qué días u horarios te sirven?" value={f.preferencia} onChange={(e) => setF({ ...f, preferencia: e.target.value })} />
      <button type="submit">Anotarme</button>
    </form>
  )
}

export function Pie({ clase = '' }: { clase?: string }) {
  return (
    <footer className={'pie ' + clase}>
      <div className="pie-fila">
        <a href="#/terminos">Términos y condiciones</a>
        <span>Producto cordobés 🧉</span>
        <a href="#/admin">Soy el profesional</a>
      </div>
      <div className="pie-fila">
        <span>v{process.env.NEXT_PUBLIC_VERSION}</span>
        <span className="pie-sdv">
          Hecho por sdv12 <img src="/credito/sdv12-logo.png" alt="" width="24" height="18" />
        </span>
      </div>
    </footer>
  )
}

// Logo del negocio si lo cargó; si no, sus iniciales.
export const avatar = (negocio: Pick<Negocio, 'logo' | 'nombre'>) => (negocio.logo ? <img className="logo-img" src={negocio.logo} alt="" /> : iniciales(negocio.nombre))

// Achica la imagen subida a un cuadrado de 192px (para que entre cómoda en localStorage).
export function leerLogo(file: File): Promise<string> {
  return new Promise((ok, mal) => {
    const img = new Image()
    img.onload = () => {
      const t = 192, c = document.createElement('canvas'); c.width = c.height = t
      const lado = Math.min(img.width, img.height)
      c.getContext('2d')?.drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, t, t)
      URL.revokeObjectURL(img.src); ok(c.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = mal
    img.src = URL.createObjectURL(file)
  })
}
