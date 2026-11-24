"use client";

import { useState, type ReactNode } from "react";
import { CUANDO, Mapa, consultaServicio, fondoTrabajo, useConsulta, useDatos, useHorario, useHoy, useMarca, useTrabajos, useWa, esTrabajo } from "../datos";

function Neon({ encendido, children, className = '' }: { encendido: boolean; children: ReactNode; className?: string }) {
  return <span className={`${encendido ? 'vd-neon' : 'vd-neon-off'} ${className}`}>{children}</span>
}

function Vidrio() {
  const M = useMarca()
  const { activa } = useDatos()
  const { abierto, detalle, info, hora, demo, wa, grupos } = useHoy()
  return (
    <section id="top" className="relative overflow-hidden bg-es-rosa text-es-claro">
      <div className="vd-vidrio absolute inset-0" />
      {/* marco de la vidriera */}
      <div className="relative mx-auto max-w-[1200px] px-5 pb-16 pt-10 @2xl:pt-14">
        <div className="border-[10px] border-[#2A1D12] bg-es-negro/20 px-4 py-10 shadow-[inset_0_0_0_2px_rgb(226_186_98/.35),inset_0_30px_80px_rgb(0_0_0/.5)] @2xl:px-12 @2xl:py-14">
          <div className="grid items-center gap-10 @5xl:grid-cols-[1.4fr_1fr]">
            <div className="text-center @5xl:text-left">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-es-acento @2xl:text-[0.78rem] @2xl:tracking-[0.4em]">{M.rubro} · {M.zona}</p>
              <h1 className="vd-oro mt-4 font-display text-[2.9rem] leading-[0.95] @2xl:text-[5.6rem]">{M.nombre}</h1>
              <p className="mx-auto mt-5 max-w-[30rem] text-[1.08rem] leading-relaxed text-es-claro/75 @5xl:mx-0">Si el cartel está prendido, estamos atendiendo. Escribinos y te contamos cómo viene la espera.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 @5xl:justify-start">
                <a href="#servicios" className="inline-flex min-h-[50px] items-center bg-es-acento px-6 text-[0.85rem] font-bold uppercase tracking-[0.18em] text-es-tinta no-underline hover:bg-es-acento-2">Ver servicios</a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[50px] items-center border border-es-acento/70 px-6 text-[0.85rem] font-bold uppercase tracking-[0.18em] text-es-acento no-underline hover:bg-es-acento/10">Preguntar espera</a>
              </div>
            </div>
            {/* el cartel de neón que refleja el estado real */}
            {activa("hoy") && <div id="hoy" className="scroll-mt-20 text-center">
              <div className="inline-block rounded-[18px] border border-es-blanco/10 bg-es-negro/40 px-8 py-6">
                <Neon encendido={abierto} className="block text-[4.2rem] leading-none @2xl:text-[5.2rem]">{abierto ? 'ABIERTO' : 'CERRADO'}</Neon>
              </div>
              <p className="mt-4 text-[0.95rem] text-es-claro/80">{detalle}</p>
              {abierto && <p className="mt-1 text-[1.15rem] font-semibold text-es-acento">{info ? `Espera: ${info.corto}` : 'Escribinos para saber la espera'}</p>}
              {hora && <p className="text-[0.75rem] text-es-claro/50">Actualizado {hora} hs{demo && ' · demo'}</p>}
            </div>}
          </div>
        </div>
        {/* el horario pintado en el vidrio de la puerta */}
        <div className="mx-auto mt-8 max-w-[720px] text-center">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.45em] text-es-acento">Horario</p>
          <div className="mt-3 grid gap-3 @2xl:grid-cols-3">
            {grupos.map(g => (
              <div key={g.titulo} className="border-t border-es-acento/40 pt-3">
                <p className="text-[0.78rem] uppercase tracking-[0.15em] text-es-claro/60">{g.titulo}</p>
                <p className="vd-oro font-display text-[1.7rem] leading-tight">{g.valor}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Pizarra de letras de fieltro (letterboard) con la lista de servicios.
function Letrero() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [sel, setSel] = useState<string | null>(null)
  const s = servicios.find(x => x.id === sel)
  return (
    <section id="servicios" className="scroll-mt-16 bg-es-rosa-2 py-16">
      <div className="mx-auto max-w-[900px] px-5">
        <div className="rounded-[6px] border-[14px] border-[#6B4A2B] shadow-[0_30px_60px_-20px_rgb(0_0_0/.7),inset_0_0_0_2px_#000]">
          <div className="vd-pizarra px-5 py-8 text-center @2xl:px-10">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.5em] text-es-blanco/60">— Servicios —</p>
            <ul className="mt-5 space-y-1">
              {servicios.map(x => (
                <li key={x.id}>
                  <button type="button" onClick={() => setSel(sel === x.id ? null : x.id)} aria-expanded={sel === x.id}
                    className={`w-full py-1.5 text-[1.1rem] font-semibold uppercase tracking-[0.14em] transition-colors @2xl:text-[1.7rem] @2xl:tracking-[0.22em] ${sel === x.id ? 'text-es-acento' : 'text-[#F3F1EA] hover:text-es-acento'}`}>
                    {x.nombre}
                  </button>
                  {sel === x.id && s && (
                    <div className="mx-auto max-w-[34rem] pb-4 text-[0.98rem] normal-case leading-relaxed tracking-normal text-es-blanco/70">
                      <p>{s.descripcion}</p>
                      <p className="mt-1 text-[0.85rem] uppercase tracking-[0.2em] text-es-blanco/50">{s.duracion} · {s.precio}</p>
                      <a href={waUrl(consultaServicio(s))} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[0.85rem] font-semibold uppercase tracking-[0.18em] text-es-acento underline underline-offset-4">Consultar</a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.8rem] uppercase tracking-[0.3em] text-es-blanco/45">Duración aproximada y precio</p>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-[40rem] text-center text-[0.92rem] leading-relaxed text-es-suave">{local.info}</p>
      </div>
    </section>
  )
}

function Consulta() {
  const { servicios } = useDatos()
  const c = useConsulta()
  const chip = (on: boolean) => `min-h-[44px] border px-4 text-[0.9rem] transition-colors ${on ? 'border-es-acento bg-es-acento text-es-tinta' : 'border-es-blanco/25 text-es-claro hover:border-es-acento'}`
  return (
    <section id="consulta" className="scroll-mt-16 bg-es-rosa">
      <form onSubmit={c.enviar} className="mx-auto grid max-w-[1100px] gap-10 px-5 py-16 text-es-claro @5xl:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="vd-oro font-display text-[3rem] leading-none @2xl:text-[3.8rem]">Golpeá el vidrio</h2>
          <p className="mt-4 max-w-[22rem] text-es-claro/70">O mejor, mandanos un mensaje: te contamos cómo viene la espera antes de que salgas de tu casa.</p>
        </div>
        <div className="space-y-6">
          <div><p className="mb-2 text-[0.75rem] uppercase tracking-[0.25em] text-es-acento">Servicio</p><div className="flex flex-wrap gap-2">{servicios.map(s => <button key={s.id} type="button" aria-pressed={c.servicio === s.nombre} onClick={() => c.elegirServicio(s.nombre)} className={chip(c.servicio === s.nombre)}>{s.nombre}</button>)}</div></div>
          <div><p className="mb-2 text-[0.75rem] uppercase tracking-[0.25em] text-es-acento">Cuándo</p><div className="flex flex-wrap gap-2">{CUANDO.map(x => <button key={x} type="button" aria-pressed={c.cuando === x} onClick={() => c.elegirCuando(x)} className={chip(c.cuando === x)}>{x}</button>)}</div></div>
          <label className="block"><span className="mb-2 block text-[0.75rem] uppercase tracking-[0.25em] text-es-acento">Contanos</span><textarea rows={3} value={c.nota} onChange={e => c.setNota(e.target.value)} placeholder="Opcional" className="w-full border border-es-blanco/25 bg-es-blanco/5 p-3 outline-none placeholder:text-es-blanco/30 focus:border-es-acento" /></label>
          <label className="block"><span className="mb-2 block text-[0.75rem] uppercase tracking-[0.25em] text-es-acento">Tu nombre</span><input value={c.nombre} onChange={e => c.setNombre(e.target.value)} placeholder="Opcional" className="w-full border border-es-blanco/25 bg-es-blanco/5 p-3 outline-none placeholder:text-es-blanco/30 focus:border-es-acento" /></label>
          <button className="min-h-[52px] w-full bg-es-acento text-[0.85rem] font-bold uppercase tracking-[0.2em] text-es-tinta hover:bg-es-acento-2">Enviar por WhatsApp</button>
        </div>
      </form>
    </section>
  )
}

export default function Vidriera() {
  const horario = useHorario()
  const waUrl = useWa()
  const M = useMarca()
  const { activa } = useDatos()
  const { destacado, resto, hayDemo } = useTrabajos()
  const fotos = [destacado, ...resto].filter(esTrabajo).slice(0, 6)
  return (
    <div className="bg-es-rosa">
      <header className="sticky top-0 z-30 border-b border-es-acento/20 bg-es-tinta/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-5">
          <a href="#top" className="vd-oro font-display text-[1.5rem] no-underline">{M.nombre}</a>
          <nav className="hidden gap-7 @3xl:flex">{[['#hoy', 'Hoy'], ['#servicios', 'Servicios'], ['#consulta', 'Consulta'], ['#trabajos', 'Trabajos'], ['#donde', 'Dónde']].map(([h, t]) => <a key={h} href={h} className="text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-es-claro/70 no-underline hover:text-es-acento">{t}</a>)}</nav>
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="border border-es-acento/60 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-es-acento no-underline">Escribinos</a>
        </div>
      </header>
      <Vidrio />
      {activa("servicios") && <Letrero />}
      {activa("consulta") && <Consulta />}
      {/* pared con cuadros */}
      {activa("galeria") && <section id="trabajos" className="scroll-mt-16 bg-[#E9E1D2] py-16">
        <div className="mx-auto max-w-[1200px] px-5">
          <h2 className="font-display text-[3rem] leading-none text-[#2A1D12] @2xl:text-[3.8rem]">En la pared del salón</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 @2xl:grid-cols-3 @2xl:gap-10">
            {fotos.map((t, i) => (
              <a key={t.id} href={t.link || undefined} target={t.link ? '_blank' : undefined} rel="noopener noreferrer" className={`block self-start border-[10px] border-[#2A1D12] bg-es-blanco p-3 shadow-[0_18px_30px_-14px_rgb(0_0_0/.5)] ${i % 2 ? '@2xl:mt-8' : ''}`}>
                <span className="block aspect-[4/5]" style={fondoTrabajo(t)} />
              </a>
            ))}
          </div>
          {hayDemo && <p className="mt-6 text-[0.8rem] text-[#5a4a3a]">Demo: tonos ilustrativos, se reemplazan por fotos reales.</p>}
        </div>
      </section>}
      {activa("ubicacion") && <section id="donde" className="scroll-mt-16 text-es-claro">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 @5xl:grid-cols-2">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.4em] text-es-acento">La puerta está en</p>
            <p className="vd-oro mt-2 font-display text-[2.4rem] leading-tight">{M.direccion}</p>
            <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[0.82rem] font-bold uppercase tracking-[0.2em] text-es-acento underline underline-offset-4">Cómo llegar</a>
            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-es-blanco/10 pt-6">
              <div><p className="text-[0.72rem] uppercase tracking-[0.25em] text-es-claro/50">Instagram</p><p className="vd-oro font-display text-[2.6rem] leading-none"><span className="text-[0.6em] [overflow-wrap:anywhere]">{M.instagram ? `@${M.instagram}` : "—"}</span></p><a href={M.instagramUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-[0.88rem] text-es-claro/80">Ver el perfil</a></div>
              <div><p className="text-[0.72rem] uppercase tracking-[0.25em] text-es-claro/50">Horario</p><ul className="mt-1 space-y-0.5 text-es-claro/85">{horario.map(p => <li key={p}>{p}</li>)}</ul></div>
            </div>
          </div>
          <Mapa className="aspect-[4/3] w-full opacity-80 grayscale invert-[0.9] hue-rotate-180" />
        </div>
      </section>}
    </div>
  )
}
