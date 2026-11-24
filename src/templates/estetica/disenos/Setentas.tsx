"use client";

import { useState } from "react";
import { CUANDO, Mapa, consultaServicio, fondoTrabajo, useConsulta, useDatos, useHorario, useHoy, useMarca, useTrabajos, useWa, esTrabajo } from "../datos";

const FRANJAS = ['#E8A33D', '#D9742B', '#B84A1E', '#6E2C14']

function Franjas({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`flex flex-col ${className}`}>{FRANJAS.map(c => <span key={c} className="h-3 @2xl:h-4" style={{ background: c }} />)}</div>
}

// Medidor analógico: la aguja marca el nivel de espera (1 a 5).
function Medidor() {
  const { abierto, detalle, info, nivel, hora, demo, wa } = useHoy()
  const angulo = -90 + (nivel ? (nivel - 0.5) * 36 : 0)
  return (
    <div id="hoy" className="scroll-mt-20 rounded-[32px] border-4 border-es-tinta bg-es-carta p-6 text-center shadow-[8px_8px_0_rgb(var(--c-tinta))]">
      <p className="text-[0.8rem] font-bold uppercase tracking-[0.2em] text-es-vino">{abierto ? '¡Estamos abiertos!' : 'Ahora cerrado'}</p>
      <svg viewBox="0 0 220 128" className="mx-auto mt-2 w-full max-w-[300px]" role="img" aria-label={info ? `Espera: ${info.corto}` : 'Espera sin dato'}>
        {FRANJAS.concat('#3B1F12').map((c, i) => {
          const a0 = Math.PI + (i * Math.PI) / 5, a1 = Math.PI + ((i + 1) * Math.PI) / 5
          const p = (a: number, r: number) => `${(110 + r * Math.cos(a)).toFixed(2)} ${(116 + r * Math.sin(a)).toFixed(2)}`
          return <path key={i} d={`M ${p(a0, 100)} A 100 100 0 0 1 ${p(a1, 100)} L ${p(a1, 62)} A 62 62 0 0 0 ${p(a0, 62)} Z`} fill={['#7FA35B', '#E8A33D', '#D9742B', '#B84A1E', '#6E2C14'][i]} opacity={!nivel || i + 1 <= nivel ? 1 : 0.3} />
        })}
        <g style={{ transform: `rotate(${abierto ? angulo : -90}deg)`, transformOrigin: '110px 116px', transition: 'transform 1.2s cubic-bezier(.3,1.5,.5,1)' }}>
          <path d="M107 116 L110 26 L113 116 Z" fill="rgb(var(--c-tinta))" />
        </g>
        <circle cx="110" cy="116" r="10" fill="rgb(var(--c-tinta))" />
      </svg>
      <p className="font-display text-[2.1rem] leading-tight text-es-tinta">{abierto ? (info ? info.corto : 'Consultanos') : 'Cerrado'}</p>
      <p className="mt-1 text-[0.9rem] text-es-suave">{detalle}</p>
      {hora && <p className="text-[0.75rem] text-es-suave">Actualizado {hora} hs{demo && ' · demo'}</p>}
      <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-5 flex min-h-[52px] items-center justify-center rounded-full bg-es-tinta text-[0.9rem] font-bold uppercase tracking-[0.1em] text-es-claro no-underline hover:bg-es-vino">Consultar disponibilidad</a>
    </div>
  )
}

function Servicios() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [sel, setSel] = useState<string | null>(null)
  return (
    <section id="servicios" className="scroll-mt-16 bg-es-rosa-2 py-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <h2 className="text-center font-display text-[3.2rem] leading-none text-es-vino @2xl:text-[4.4rem]">El menú</h2>
        <p className="mx-auto mt-3 max-w-[30rem] text-center text-es-suave">Tocá un servicio para ver el detalle, la duración y el precio.</p>
        <div className="mt-10 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {servicios.map(s => {
            const on = sel === s.id
            return (
              <div key={s.id} className={`overflow-hidden rounded-[28px] border-4 border-es-tinta bg-es-carta transition-transform ${on ? 'shadow-[6px_6px_0_rgb(var(--c-vino))]' : 'hover:-translate-y-1'}`}>
                <button type="button" onClick={() => setSel(on ? null : s.id)} aria-expanded={on} className="flex w-full items-center gap-4 p-4 text-left">
                  <span className="h-16 w-16 flex-shrink-0 rounded-full border-4 border-es-tinta" style={{ background: `linear-gradient(180deg, ${s.color_a}, ${s.color_b})` }} />
                  <span><span className="block font-display text-[1.6rem] leading-none text-es-tinta">{s.nombre}</span><span className="mt-1 block text-[0.82rem] text-es-suave">{s.duracion} · {s.precio}</span></span>
                </button>
                {on && (
                  <div className="border-t-4 border-es-tinta px-5 py-4">
                    <p className="leading-relaxed text-es-suave">{s.descripcion}</p>
                    <a href={waUrl(consultaServicio(s))} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-full bg-es-vino px-4 py-2 text-[0.8rem] font-bold uppercase tracking-[0.1em] text-es-blanco no-underline">Consultar</a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <p className="mx-auto mt-8 max-w-[40rem] text-center text-[0.9rem] leading-relaxed text-es-suave">{local.info}</p>
      </div>
    </section>
  )
}

function Consulta() {
  const { servicios } = useDatos()
  const c = useConsulta()
  const chip = (on: boolean) => `min-h-[44px] rounded-full border-[3px] border-es-tinta px-4 text-[0.9rem] font-semibold transition-colors ${on ? 'bg-es-tinta text-es-acento' : 'bg-es-carta hover:bg-es-acento'}`
  return (
    <section id="consulta" className="scroll-mt-16">
      <Franjas />
      <div className="bg-es-tinta py-16 text-es-claro">
        <form onSubmit={c.enviar} className="mx-auto grid max-w-[1100px] gap-10 px-5 @5xl:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-[3rem] leading-none text-es-acento @2xl:text-[3.8rem]">¿Pasás hoy?</h2>
            <p className="mt-4 max-w-[22rem] text-es-claro/75">Mandanos un mensaje y te decimos cómo viene la cosa.</p>
          </div>
          <div className="space-y-5 rounded-[28px] bg-es-carta p-6 text-es-tinta">
            <div><p className="mb-2 font-display text-[1.3rem]">Servicio</p><div className="flex flex-wrap gap-2">{servicios.map(s => <button key={s.id} type="button" aria-pressed={c.servicio === s.nombre} onClick={() => c.elegirServicio(s.nombre)} className={chip(c.servicio === s.nombre)}>{s.nombre}</button>)}</div></div>
            <div><p className="mb-2 font-display text-[1.3rem]">Cuándo</p><div className="flex flex-wrap gap-2">{CUANDO.map(x => <button key={x} type="button" aria-pressed={c.cuando === x} onClick={() => c.elegirCuando(x)} className={chip(c.cuando === x)}>{x}</button>)}</div></div>
            <textarea rows={3} value={c.nota} onChange={e => c.setNota(e.target.value)} placeholder="Contanos qué querés (opcional)" aria-label="Contanos qué querés" className="w-full rounded-[18px] border-[3px] border-es-tinta bg-es-blanco p-3 outline-none focus:border-es-vino" />
            <input value={c.nombre} onChange={e => c.setNombre(e.target.value)} placeholder="Tu nombre (opcional)" aria-label="Tu nombre" className="w-full rounded-full border-[3px] border-es-tinta bg-es-blanco px-4 py-3 outline-none focus:border-es-vino" />
            <button className="min-h-[54px] w-full rounded-full bg-es-vino text-[0.95rem] font-bold uppercase tracking-[0.1em] text-es-blanco hover:bg-es-tinta">Mandar por WhatsApp</button>
          </div>
        </form>
      </div>
      <Franjas className="rotate-180" />
    </section>
  )
}

export default function Setentas() {
  const horario = useHorario()
  const waUrl = useWa()
  const M = useMarca()
  const { activa } = useDatos()
  const { grupos } = useHoy()
  const { destacado, resto, hayDemo } = useTrabajos()
  const fotos = [destacado, ...resto].filter(esTrabajo).slice(0, 6)
  return (
    <div className="bg-es-rosa text-es-tinta">
      <header className="sticky top-0 z-30 bg-es-rosa/95 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-5">
          <a href="#top" className="font-display text-[1.7rem] leading-none text-es-vino no-underline">{M.nombre}</a>
          <nav className="hidden gap-6 @3xl:flex">{[['#hoy', 'Hoy'], ['#servicios', 'Menú'], ['#consulta', 'Consulta'], ['#trabajos', 'Trabajos'], ['#donde', 'Dónde']].map(([h, t]) => <a key={h} href={h} className="text-[0.92rem] font-semibold text-es-tinta no-underline hover:text-es-vino">{t}</a>)}</nav>
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="rounded-full bg-es-tinta px-5 py-2 text-[0.82rem] font-bold text-es-acento no-underline">Escribinos</a>
        </div>
        <Franjas className="[&>span]:h-1.5 @2xl:[&>span]:h-1.5" />
      </header>

      <section id="top" className="relative overflow-hidden">
        <div aria-hidden className="st-sol absolute inset-x-0 bottom-0 h-[70%] opacity-60" />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 @5xl:grid-cols-[1.3fr_1fr] @5xl:py-20">
          <div>
            <p className="inline-block rounded-full border-[3px] border-es-tinta bg-es-carta px-4 py-1 text-[0.82rem] font-bold">{M.rubro} · {M.zona}</p>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,12cqi,3.8rem)] [overflow-wrap:break-word] leading-[0.95] text-es-tinta @2xl:text-[5.6rem]">{M.eslogan}</h1>
            <p className="mt-5 max-w-[30rem] text-[1.08rem] leading-relaxed text-es-suave">Fijate en el medidor cómo viene la espera y escribinos antes de venir.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#servicios" className="inline-flex min-h-[54px] items-center rounded-full border-4 border-es-tinta bg-es-acento px-7 text-[0.95rem] font-bold text-es-tinta no-underline shadow-[4px_4px_0_rgb(var(--c-tinta))] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgb(var(--c-tinta))]">Ver el menú</a>
              <a href="#consulta" className="inline-flex min-h-[54px] items-center rounded-full border-4 border-es-tinta bg-es-carta px-7 text-[0.95rem] font-bold text-es-tinta no-underline">Consultar</a>
            </div>
          </div>
          {activa("hoy") && <Medidor />}
        </div>
        <div className="relative mx-auto grid max-w-[1200px] gap-3 px-5 pb-14 @2xl:grid-cols-3">
          {grupos.map((g, i) => (
            <div key={g.titulo} className="rounded-full border-[3px] border-es-tinta px-6 py-3 text-center" style={{ background: ['#FFF6E6', '#E8A33D', '#D9742B'][i] || '#FFF6E6' }}>
              <span className="block text-[0.75rem] font-bold uppercase tracking-[0.12em]">{g.titulo}</span>
              <span className="font-display text-[1.6rem] leading-tight">{g.valor}</span>
            </div>
          ))}
        </div>
      </section>

      {activa("servicios") && <Servicios />}
      {activa("consulta") && <Consulta />}

      {activa("galeria") && <section id="trabajos" className="scroll-mt-16 py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="text-center font-display text-[3.2rem] leading-none text-es-vino @2xl:text-[4.4rem]">Trabajos</h2>
          <div className="mt-10 grid grid-cols-2 gap-5 @2xl:grid-cols-3">
            {fotos.map((t, i) => (
              <a key={t.id} href={t.link || undefined} target={t.link ? '_blank' : undefined} rel="noopener noreferrer" aria-label={t.titulo || 'Trabajo'}
                className={`block aspect-[4/5] border-4 border-es-tinta shadow-[6px_6px_0_rgb(var(--c-tinta))] ${['rounded-t-full', 'rounded-[40px]', 'rounded-b-full', 'rounded-[40px]', 'rounded-t-full', 'rounded-[40px]'][i]}`} style={fondoTrabajo(t)} />
            ))}
          </div>
          {hayDemo && <p className="mt-6 text-center text-[0.8rem] text-es-suave">Demo: tonos ilustrativos, se reemplazan por fotos reales.</p>}
        </div>
      </section>}

      {activa("ubicacion") && <section id="donde" className="scroll-mt-16 bg-es-rosa-2 py-16">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-5 @5xl:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] border-4 border-es-tinta"><Mapa className="aspect-[4/3] w-full sepia-[0.5]" /></div>
          <div>
            <h2 className="font-display text-[3rem] leading-none text-es-vino">Vení a vernos</h2>
            <p className="mt-3 text-[1.2rem] font-semibold">{M.direccion}</p>
            <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-[48px] items-center rounded-full border-[3px] border-es-tinta bg-es-carta px-6 font-bold text-es-tinta no-underline">Cómo llegar</a>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-[24px] bg-es-tinta p-5 text-es-claro"><p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-es-acento">Instagram</p><p className="font-display text-[2.4rem] leading-none text-es-acento"><span className="text-[0.6em] [overflow-wrap:anywhere]">{M.instagram ? `@${M.instagram}` : "—"}</span></p><a href={M.instagramUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-[0.85rem] text-es-claro/80">Ver el perfil</a></div>
              <div className="rounded-[24px] border-[3px] border-es-tinta bg-es-carta p-5"><p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-es-vino">Horario</p><ul className="mt-1 font-semibold">{horario.map(p => <li key={p}>{p}</li>)}</ul></div>
            </div>
          </div>
        </div>
      </section>}
    </div>
  )
}
