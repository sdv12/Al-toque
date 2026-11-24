"use client";

import { useState, type ReactNode } from "react";
import { CUANDO, Mapa, consultaServicio, fondoTrabajo, useConsulta, useDatos, useHorario, useHoy, useMarca, useTrabajos, useWa } from "../datos";

const GIROS = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1']
const mano = 'font-display'

function Dymo({ children, rojo = false, className = '' }: { children: ReactNode; rojo?: boolean; className?: string }) {
  return <span className={`cc-dymo ${rojo ? 'cc-dymo-rojo' : ''} inline-block rounded-[3px] px-3 py-1 font-cuerpo text-[0.78rem] font-bold uppercase ${className}`}>{children}</span>
}

function Cinta({ className = '' }: { className?: string }) {
  return <span aria-hidden className={`cc-cinta absolute h-6 w-20 ${className}`} />
}

function Polaroid({ t, giro = '', pie, className = '' }: { t: Parameters<typeof fondoTrabajo>[0]; giro?: string; pie: string; className?: string }) {
  return (
    <figure className={`cc-sombra relative bg-es-blanco p-3 pb-12 ${giro} ${className}`}>
      <Cinta className="-top-3 left-1/2 -translate-x-1/2 rotate-[-4deg]" />
      <span className="block aspect-square" style={fondoTrabajo(t)} />
      <figcaption className={`${mano} absolute inset-x-3 bottom-2 text-center text-[1.35rem] leading-tight text-es-tinta`}>{pie}</figcaption>
    </figure>
  )
}

function PostIt() {
  const { abierto, detalle, info, hora, demo, wa } = useHoy()
  return (
    <div id="hoy" className="cc-sombra relative w-[260px] rotate-2 scroll-mt-24 bg-es-acento p-5 @2xl:w-[280px]">
      <span aria-hidden className="absolute -top-2 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-es-vino shadow-[inset_-2px_-3px_0_rgb(0_0_0/.25)]" />
      <p className={`${mano} text-[1.4rem] leading-none text-es-tinta/70`}>¿Hay lugar hoy?</p>
      <p className={`${mano} mt-2 text-[2.3rem] font-bold leading-[0.95] text-es-tinta`}>{abierto ? (info ? `Sí! ${info.corto}` : 'Abierto ✓') : 'Hoy no :('}</p>
      <p className="mt-3 text-[0.85rem] text-es-tinta/80">{detalle}</p>
      {hora && <p className={`${mano} mt-1 text-[1.1rem] text-es-tinta/60`}>anotado {hora} hs{demo && ' (demo)'}</p>}
      <a href={wa} target="_blank" rel="noopener noreferrer" className={`${mano} mt-3 inline-block text-[1.4rem] font-bold text-es-vino underline decoration-wavy underline-offset-4`}>preguntanos →</a>
    </div>
  )
}

function Ficha() {
  const { grupos } = useHoy()
  return (
    <div className="cc-sombra relative w-[280px] -rotate-2 bg-es-carta">
      <Cinta className="-top-3 left-6 rotate-[-8deg]" /><Cinta className="-top-3 right-6 rotate-[6deg]" />
      <p className="border-b-2 border-es-vino/60 px-5 pb-1 pt-4 text-[0.72rem] font-bold uppercase tracking-[0.2em] text-es-vino">Horario</p>
      <div className="cc-renglones px-5 pb-3">
        {grupos.map(g => (
          <div key={g.titulo} className="flex h-8 items-end justify-between gap-2">
            <span className="text-[0.82rem]">{g.titulo}</span><span className={`${mano} text-[1.35rem] font-bold leading-none`}>{g.valor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Servicios() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [sel, setSel] = useState<string | null>(null)
  return (
    <section id="servicios" className="scroll-mt-16 px-5 py-16">
      <div className="mx-auto max-w-[1200px]">
        <Dymo rojo>Servicios</Dymo>
        <h2 className={`${mano} mt-3 text-[3.4rem] font-bold leading-none @2xl:text-[4.2rem]`}>Lo que hacemos <span className="text-es-vino">(tocá una foto)</span></h2>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 @2xl:grid-cols-3 @5xl:grid-cols-5">
          {servicios.map((s, i) => (
            <button key={s.id} type="button" onClick={() => setSel(sel === s.id ? null : s.id)} aria-expanded={sel === s.id} className="text-left transition-transform hover:-translate-y-1">
              <Polaroid t={{ color_a: s.color_a, color_b: s.color_b }} giro={GIROS[i % GIROS.length]} pie={s.nombre} className={sel === s.id ? 'ring-4 ring-es-vino' : ''} />
            </button>
          ))}
        </div>
        {(() => {
          const s = servicios.find(x => x.id === sel)
          return (
            <div className="cc-sombra relative mx-auto mt-14 max-w-[640px] rotate-[-0.6deg] bg-es-carta">
              <Cinta className="-top-3 left-1/2 -translate-x-1/2" />
              <div className="cc-renglones px-7 pb-6 pt-6">
                <p className={`${mano} text-[2rem] font-bold leading-8`}>{s ? s.nombre : 'Antes de venir…'}</p>
                {s?.duracion && <p className="text-[0.8rem] leading-8 text-es-vino">⏱ {s.duracion} · {s.precio}</p>}
                <p className="text-[0.95rem] leading-8">{s ? s.descripcion : local.info}</p>
                {s && <a href={waUrl(consultaServicio(s))} target="_blank" rel="noopener noreferrer" className={`${mano} text-[1.4rem] font-bold leading-8 text-es-vino underline`}>consultar por esto →</a>}
              </div>
            </div>
          )
        })()}
      </div>
    </section>
  )
}

function Consulta() {
  const { servicios } = useDatos()
  const c = useConsulta()
  const chip = (on: boolean) => `${mano} min-h-[42px] rounded-full border-2 px-4 text-[1.25rem] font-bold leading-none transition-colors ${on ? 'border-es-vino bg-es-vino text-es-blanco' : 'border-es-tinta/60 hover:border-es-vino'}`
  return (
    <section id="consulta" className="cc-corcho scroll-mt-16 px-5 py-16">
      <form onSubmit={c.enviar} className="cc-sombra relative mx-auto max-w-[720px] rotate-[0.5deg] bg-es-carta">
        <Cinta className="-top-3 left-10 rotate-[-6deg]" /><Cinta className="-top-3 right-10 rotate-[5deg]" />
        <div className="border-l-[3px] border-es-vino/50 px-6 py-7 @2xl:ml-10 @2xl:px-8">
          <Dymo>Dejanos una nota</Dymo>
          <p className="mt-4 text-[0.95rem] text-es-suave">Escribinos y te contamos cómo viene el día.</p>
          <p className={`${mano} mt-5 text-[1.5rem] font-bold`}>Quiero…</p>
          <div className="mt-2 flex flex-wrap gap-2">{servicios.map(s => <button key={s.id} type="button" aria-pressed={c.servicio === s.nombre} onClick={() => c.elegirServicio(s.nombre)} className={chip(c.servicio === s.nombre)}>{s.nombre}</button>)}</div>
          <p className={`${mano} mt-5 text-[1.5rem] font-bold`}>Paso…</p>
          <div className="mt-2 flex flex-wrap gap-2">{CUANDO.map(x => <button key={x} type="button" aria-pressed={c.cuando === x} onClick={() => c.elegirCuando(x)} className={chip(c.cuando === x)}>{x.toLowerCase()}</button>)}</div>
          <label className="mt-5 block"><span className={`${mano} text-[1.5rem] font-bold`}>Te cuento:</span>
            <textarea rows={3} value={c.nota} onChange={e => c.setNota(e.target.value)} className={`cc-renglones ${mano} mt-1 w-full resize-none bg-transparent text-[1.4rem] leading-8 outline-none`} /></label>
          <label className="mt-3 block"><span className={`${mano} text-[1.5rem] font-bold`}>Firma:</span>
            <input value={c.nombre} onChange={e => c.setNombre(e.target.value)} className={`${mano} ml-2 border-b-2 border-dotted border-es-tinta/40 bg-transparent text-[1.4rem] outline-none`} /></label>
          <button className="mt-7 flex min-h-[52px] w-full items-center justify-center bg-es-tinta text-[0.9rem] font-bold uppercase tracking-[0.15em] text-es-claro hover:bg-es-vino">Mandar por WhatsApp</button>
        </div>
      </form>
    </section>
  )
}

export default function Corcho() {
  const horario = useHorario()
  const waUrl = useWa()
  const M = useMarca()
  const { activa } = useDatos()
  const { destacado, resto, hayDemo } = useTrabajos()
  return (
    <div className="bg-es-rosa text-es-tinta">
      <header className="sticky top-0 z-30 border-b border-es-linea bg-es-rosa/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-5">
          <a href="#top" className="no-underline"><Dymo>{M.nombre}</Dymo></a>
          <nav className="hidden gap-6 @3xl:flex">{[['#hoy', 'hoy'], ['#servicios', 'servicios'], ['#consulta', 'nota'], ['#trabajos', 'fotos'], ['#donde', 'dónde']].map(([h, t]) => <a key={h} href={h} className={`${mano} text-[1.45rem] font-bold text-es-tinta no-underline hover:text-es-vino`}>{t}</a>)}</nav>
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="bg-es-tinta px-4 py-2 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-es-claro no-underline">Escribinos</a>
        </div>
      </header>

      {/* el corcho del salón */}
      <section id="top" className="cc-corcho overflow-hidden px-5 pb-20 pt-12">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 @5xl:grid-cols-[1fr_1.1fr]">
          <div className="cc-sombra relative -rotate-1 bg-es-carta p-7 @2xl:p-9">
            <Cinta className="-top-3 left-8 rotate-[-10deg]" /><Cinta className="-top-3 right-8 rotate-[8deg]" />
            <Dymo rojo>{M.rubro} · {M.zona}</Dymo>
            <h1 className={`${mano} mt-4 text-[3.8rem] font-bold leading-[0.9] @2xl:text-[5rem]`}>{M.eslogan}</h1>
            <p className="mt-5 max-w-[28rem] text-[1rem] leading-relaxed text-es-suave">Mirá el post-it: ahí anotamos cómo viene el día. Escribinos antes de venir.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#servicios" className="inline-flex min-h-[48px] items-center bg-es-tinta px-5 text-[0.82rem] font-bold uppercase tracking-[0.12em] text-es-claro no-underline">Ver servicios</a>
              <a href="#consulta" className={`${mano} inline-flex min-h-[48px] items-center px-3 text-[1.5rem] font-bold text-es-vino`}>o dejanos una nota →</a>
            </div>
          </div>
          <div className="relative flex min-h-[540px] flex-wrap items-start justify-center gap-6 @2xl:block">
            {destacado && <Polaroid t={destacado} giro="rotate-3" pie="el de la semana ♥" className="w-[250px] @2xl:absolute @2xl:left-0 @2xl:top-[3%] @2xl:w-[290px]" />}
            {activa("hoy") && <div className="@2xl:absolute @2xl:right-0 @2xl:top-0"><PostIt /></div>}
            <div className="@2xl:absolute @2xl:bottom-0 @2xl:right-[6%]"><Ficha /></div>
          </div>
        </div>
      </section>

      {activa("servicios") && <Servicios />}
      {activa("consulta") && <Consulta />}

      {activa("galeria") && <section id="trabajos" className="scroll-mt-16 px-5 py-16">
        <div className="mx-auto max-w-[1200px]">
          <Dymo rojo>Trabajos</Dymo>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 @2xl:grid-cols-4">
            {resto.slice(0, 8).map((t, i) => (
              <a key={t.id} href={t.link || undefined} target={t.link ? '_blank' : undefined} rel="noopener noreferrer" className="block text-es-tinta no-underline">
                <Polaroid t={t} giro={GIROS[(i + 2) % GIROS.length]} pie={t.titulo || (t.es_reel ? 'reel ▶' : ['¡quedó divino!', 'antes/después', 'el de la semana', 'quedó genial'][i % 4] ?? '')} />
              </a>
            ))}
          </div>
          {hayDemo && <p className="mt-6 text-[0.8rem] text-es-suave">Demo: tonos ilustrativos, se reemplazan por fotos reales.</p>}
        </div>
      </section>}

      {activa("ubicacion") && <section id="donde" className="cc-corcho scroll-mt-16 px-5 py-16">
        <div className="mx-auto grid max-w-[1100px] items-start gap-10 @5xl:grid-cols-[1.2fr_1fr]">
          <div className="cc-sombra relative rotate-[0.8deg] bg-es-blanco p-3">
            <Cinta className="-top-3 left-1/2 -translate-x-1/2" />
            <Mapa className="aspect-[4/3] w-full" />
          </div>
          <div className="space-y-8">
            <div className="cc-sombra relative -rotate-1 bg-es-carta p-6">
              <Cinta className="-top-3 left-6 rotate-[-6deg]" />
              <Dymo>Dónde</Dymo>
              <p className={`${mano} mt-3 text-[2rem] font-bold leading-tight`}>{M.direccion}</p>
              <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className={`${mano} text-[1.4rem] font-bold text-es-vino underline`}>cómo llegar →</a>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="cc-sombra rotate-2 bg-es-acento p-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.15em]">Instagram</p>
                <p className={`${mano} text-[2.8rem] font-bold leading-none`}><span className="text-[0.6em] [overflow-wrap:anywhere]">{M.instagram ? `@${M.instagram}` : "—"}</span></p>
                <a href={M.instagramUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-[0.85rem] text-es-tinta">Ver el perfil</a>
              </div>
              <div className="cc-sombra -rotate-2 bg-[#BFE3D9] p-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.15em]">Horario</p>
                <ul className={`${mano} text-[1.4rem] font-bold leading-tight`}>{horario.map(p => <li key={p}>{p}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </section>}
    </div>
  )
}
