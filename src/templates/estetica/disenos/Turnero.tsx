"use client";

import { useState } from "react";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import { CUANDO, MINUTOS, Mapa, consultaServicio, fondoTrabajo, useConsulta, useDatos, useHorario, useHoy, useMarca, useTrabajos, useWa, esTrabajo } from "../datos";

const LINKS = [['#hoy', 'Hoy'], ['#servicios', 'Lista'], ['#consulta', 'Consulta'], ['#trabajos', 'Trabajos'], ['#donde', 'Dónde']]

function Maquina() {
  const { abierto, detalle, info, nivel, hora, demo } = useHoy()
  const display = info ? MINUTOS[nivel] : abierto ? '??' : '--'
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      {/* la máquina expendedora */}
      <div className="relative z-10 rounded-[28px] bg-es-vino p-5 shadow-[inset_0_-8px_0_rgb(0_0_0/.18),0_24px_40px_-18px_rgb(0_0_0/.5)]">
        <div className="mb-3 flex items-center justify-between px-1 font-display text-[0.95rem] uppercase tracking-[0.08em] text-es-blanco">
          <span>Espera estimada</span>
          <span className="flex items-center gap-1.5 text-[0.75rem]"><span className={`h-2.5 w-2.5 rounded-full ${abierto ? 'bg-es-acento' : 'bg-es-blanco/30'}`} />{abierto ? 'Abierto' : 'Cerrado'}</span>
        </div>
        <div className="flex items-end justify-center gap-2 rounded-[12px] bg-[#140806] px-4 pb-3 pt-4">
          <span className="relative font-display text-[6.5rem] leading-[0.8] text-[#FF5A3C] tk-led">
            <span className="tk-led-off absolute inset-0 select-none" aria-hidden>88</span>
            <span className="relative">{display}</span>
          </span>
          {info && nivel < 5 && <span className="mb-2 font-display text-[1.4rem] uppercase text-[#FF5A3C] tk-led">min</span>}
        </div>
        <div className="mx-auto mt-4 h-3 w-[78%] rounded-full bg-[#140806]" />
      </div>
      {/* el ticket que sale */}
      <div className="tk-dientes relative z-0 mx-auto -mt-2 w-[74%] bg-es-carta px-5 pb-6 pt-6 text-center shadow-[0_10px_20px_-10px_rgb(0_0_0/.35)]">
        <p className="font-display text-[1.5rem] uppercase leading-none">{info ? info.corto : abierto ? 'Consultanos' : 'Cerrado'}</p>
        <p className="mt-2 text-[0.8rem] text-es-suave">{detalle}</p>
        {hora && <p className="mt-1 text-[0.7rem] text-es-suave">Actualizado {hora} hs{demo && ' · demo'}</p>}
      </div>
    </div>
  )
}

function Pizarra() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [abierto, setAbierto] = useState<string | null>(null)
  return (
    <div className="bg-es-tinta px-5 py-8 text-es-claro @2xl:px-10 @2xl:py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-es-acento pb-4">
        <h2 className="font-display text-[2.6rem] uppercase leading-none text-es-acento @2xl:text-[3.4rem]">Lista de servicios</h2>
        <span className="text-[0.8rem] text-es-claro/60">Precio y duración aproximada</span>
      </div>
      <ul>
        {servicios.map(s => {
          const on = abierto === s.id
          return (
            <li key={s.id} className="border-b border-es-claro/15">
              <button type="button" onClick={() => setAbierto(on ? null : s.id)} aria-expanded={on} className="flex w-full items-center gap-3 py-4 text-left">
                <span className="h-7 w-7 flex-shrink-0 rounded-full" style={{ background: `linear-gradient(180deg, ${s.color_a}, ${s.color_b})` }} />
                <span className="font-display text-[1.6rem] uppercase leading-none @2xl:text-[2rem]">{s.nombre}</span>
                <span className="tk-puntos mx-2 hidden h-4 flex-1 self-center text-es-claro/40 @2xl:block" />
                <span className="ml-auto text-right text-[0.85rem] text-es-claro/70 @2xl:ml-0">{s.duracion} · {s.precio}</span>
                {on ? <Minus size={18} className="text-es-acento" /> : <Plus size={18} className="text-es-acento" />}
              </button>
              {on && (
                <div className="pb-5 pl-10 pr-2">
                  <p className="max-w-[40rem] leading-relaxed text-es-claro/80">{s.descripcion}</p>
                  <a href={waUrl(consultaServicio(s))} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[0.85rem] font-semibold text-es-acento underline underline-offset-4">Consultar por {s.nombre.toLowerCase()} <ArrowUpRight size={14} /></a>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-5 max-w-[42rem] text-[0.85rem] leading-relaxed text-es-claro/60">{local.info}</p>
    </div>
  )
}

function Consulta() {
  const { servicios } = useDatos()
  const c = useConsulta()
  const chip = (on: boolean) => `min-h-[44px] border-2 border-es-tinta px-3.5 font-display text-[1rem] uppercase tracking-[0.03em] transition-colors ${on ? 'bg-es-tinta text-es-acento' : 'hover:bg-es-acento'}`
  return (
    <form onSubmit={c.enviar} className="tk-ticket bg-es-carta px-7 py-8 @2xl:px-12">
      <div className="flex items-baseline justify-between border-b-2 border-dashed border-es-tinta/40 pb-3">
        <span className="font-display text-[1.7rem] uppercase">Consulta</span>
        <span className="font-display text-[1.1rem] text-es-vino">N° 0042</span>
      </div>
      <p className="mb-2 mt-5 text-[0.75rem] font-bold uppercase tracking-[0.15em]">Servicio</p>
      <div className="flex flex-wrap gap-2">{servicios.map(s => <button key={s.id} type="button" aria-pressed={c.servicio === s.nombre} onClick={() => c.elegirServicio(s.nombre)} className={chip(c.servicio === s.nombre)}>{s.nombre}</button>)}</div>
      <p className="mb-2 mt-5 text-[0.75rem] font-bold uppercase tracking-[0.15em]">¿Cuándo venís?</p>
      <div className="flex flex-wrap gap-2">{CUANDO.map(x => <button key={x} type="button" aria-pressed={c.cuando === x} onClick={() => c.elegirCuando(x)} className={chip(c.cuando === x)}>{x}</button>)}</div>
      <label htmlFor="tk-nota" className="mb-2 mt-5 block text-[0.75rem] font-bold uppercase tracking-[0.15em]">Contanos (opcional)</label>
      <textarea id="tk-nota" rows={3} value={c.nota} onChange={e => c.setNota(e.target.value)} placeholder="Ej: quiero aclarar dos tonos…" className="w-full border-2 border-es-tinta bg-transparent p-3 outline-none focus:bg-es-blanco" />
      <label htmlFor="tk-nom" className="mb-2 mt-4 block text-[0.75rem] font-bold uppercase tracking-[0.15em]">Tu nombre (opcional)</label>
      <input id="tk-nom" value={c.nombre} onChange={e => c.setNombre(e.target.value)} className="w-full border-2 border-es-tinta bg-transparent p-3 outline-none focus:bg-es-blanco" />
      <button className="mt-6 min-h-[56px] w-full bg-es-vino font-display text-[1.3rem] uppercase tracking-[0.05em] text-es-blanco hover:bg-es-tinta">Mandar por WhatsApp</button>
    </form>
  )
}

export default function Turnero() {
  const horario = useHorario()
  const waUrl = useWa()
  const M = useMarca()
  const { activa } = useDatos()
  const { grupos } = useHoy()
  const { destacado, resto, hayDemo } = useTrabajos()
  const fotos = [destacado, ...resto].filter(esTrabajo).slice(0, 9)

  return (
    <div className="bg-es-rosa text-es-tinta">
      <header className="sticky top-0 z-30 bg-es-tinta text-es-claro">
        <div className="mx-auto flex h-[58px] max-w-[1200px] items-center justify-between gap-4 px-5">
          <a href="#top" className="font-display text-[1.45rem] uppercase leading-none text-es-acento no-underline">{M.nombre}</a>
          <nav className="hidden gap-6 @5xl:flex">{LINKS.map(([h, t]) => <a key={h} href={h} className="font-display text-[0.95rem] uppercase tracking-[0.06em] text-es-claro/80 no-underline hover:text-es-acento">{t}</a>)}</nav>
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="bg-es-acento px-4 py-2 font-display text-[0.95rem] uppercase text-es-tinta no-underline">Escribinos</a>
        </div>
      </header>

      <section id="top" className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 @5xl:grid-cols-[1.15fr_1fr] @5xl:py-20">
        <div>
          <p className="mb-4 inline-block bg-es-tinta px-2.5 py-1 font-display text-[0.9rem] uppercase tracking-[0.08em] text-es-acento">{M.rubro} · {M.zona}</p>
          <h1 className="font-display text-[3.6rem] uppercase leading-[0.88] @2xl:text-[5.6rem] @5xl:text-[6.4rem]">
            {M.eslogan}
          </h1>
          <p className="mt-6 max-w-[30rem] text-[1.05rem] leading-relaxed text-es-suave">
            Mirá en la maquinita cómo viene el día y escribinos antes de venir: te contamos la espera.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#servicios" className="inline-flex min-h-[52px] items-center border-2 border-es-tinta px-6 font-display text-[1.1rem] uppercase no-underline hover:bg-es-tinta hover:text-es-claro">Ver la lista</a>
            <a href="#consulta" className="inline-flex min-h-[52px] items-center bg-es-tinta px-6 font-display text-[1.1rem] uppercase text-es-acento no-underline">Hacer una consulta</a>
          </div>
        </div>
        {activa("hoy") && <div id="hoy" className="scroll-mt-20"><Maquina /></div>}
      </section>

      {/* horarios: talones troquelados */}
      <section className="border-y-2 border-es-tinta bg-es-acento">
        <div className="mx-auto grid max-w-[1200px] @2xl:grid-cols-3">
          {grupos.map((g, i) => (
            <div key={g.titulo} className={`px-5 py-5 text-center ${i ? 'border-t-2 border-dashed border-es-tinta @2xl:border-l-2 @2xl:border-t-0' : ''}`}>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em]">{g.titulo}</p>
              <p className="mt-1 font-display text-[2rem] uppercase leading-none">{g.valor}</p>
            </div>
          ))}
        </div>
      </section>

      {activa("servicios") && <section id="servicios" className="mx-auto max-w-[1200px] scroll-mt-16 px-0 py-14 @2xl:px-5 @2xl:py-20"><Pizarra /></section>}

      {activa("consulta") && <section id="consulta" className="bg-es-rosa-2">
        <div className="mx-auto grid max-w-[1200px] items-start gap-10 px-5 py-14 @2xl:py-20 @5xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-display text-[3rem] uppercase leading-[0.9] @2xl:text-[4rem]">¿Querés saber<br />antes de venir?</h2>
            <p className="mt-5 max-w-[24rem] leading-relaxed text-es-suave">Completá el ticket y se arma el mensaje de WhatsApp: te contamos cómo viene el día.</p>
          </div>
          <Consulta />
        </div>
      </section>}

      {activa("galeria") && <section id="trabajos" className="mx-auto max-w-[1200px] scroll-mt-16 px-5 py-14 @2xl:py-20">
        <h2 className="mb-8 font-display text-[3rem] uppercase leading-none @2xl:text-[4rem]">Trabajos</h2>
        <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
          {fotos.map((t, i) => (
            <a key={t.id} href={t.link || undefined} target={t.link ? '_blank' : undefined} rel="noopener noreferrer" className={`relative block aspect-[3/4] ${i === 0 ? 'col-span-2 row-span-2 aspect-auto' : ''}`} style={fondoTrabajo(t)} aria-label={t.titulo || 'Trabajo del salón'}>
              <span className="absolute left-2 top-2 bg-es-acento px-1.5 font-display text-[0.85rem] text-es-tinta">N° {String(i + 1).padStart(2, '0')}</span>
            </a>
          ))}
        </div>
        {hayDemo && <p className="mt-3 text-[0.78rem] text-es-suave">Demo: tonos ilustrativos, se reemplazan por fotos reales.</p>}
      </section>}

      {activa("ubicacion") && <section id="donde" className="scroll-mt-16 bg-es-tinta py-14 @2xl:py-20">
        <div className="mx-auto grid max-w-[1200px] gap-6 px-5 @5xl:grid-cols-3">
          <div className="tk-ticket bg-es-carta px-8 py-7 @5xl:col-span-2">
            <p className="font-display text-[1rem] uppercase text-es-vino">Dónde</p>
            <p className="mt-1 font-display text-[2rem] uppercase leading-none">{M.direccion}</p>
            <Mapa className="mt-5 h-[230px] w-full grayscale" />
            <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 font-display text-[1.05rem] uppercase text-es-tinta underline underline-offset-4">Cómo llegar <ArrowUpRight size={16} /></a>
          </div>
          <div className="flex flex-col gap-6">
            {M.instagramUrl && <div className="tk-ticket bg-es-acento px-8 py-7">
              <p className="font-display text-[1rem] uppercase">Instagram</p>
              <p className="font-display text-[2.2rem] leading-none [overflow-wrap:anywhere]">@{M.instagram}</p>
              <a href={M.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">Ver el perfil</a>
            </div>}
            <div className="tk-ticket flex-1 bg-es-carta px-8 py-7">
              <p className="font-display text-[1rem] uppercase text-es-vino">Horario</p>
              <ul className="mt-2 space-y-1">{horario.map(p => <li key={p} className="font-display text-[1.5rem] uppercase leading-tight">{p}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>}
    </div>
  )
}
