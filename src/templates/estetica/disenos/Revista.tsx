"use client";

import { useState } from "react";
import { CUANDO, Mapa, consultaServicio, fondoTrabajo, useConsulta, useDatos, useHorario, useHoy, useMarca, useTrabajos, useWa } from "../datos";

const MES = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

function Pegatina() {
  const { abierto, info } = useHoy()
  return (
    <a href="#hoy" className="absolute bottom-[96px] right-4 flex h-[118px] w-[118px] @2xl:bottom-auto @2xl:top-[38%] rotate-[10deg] flex-col items-center justify-center rounded-full bg-es-vino text-center text-es-blanco no-underline shadow-[0_10px_25px_-8px_rgb(0_0_0/.6)] @2xl:right-[8%] @2xl:h-[160px] @2xl:w-[160px]">
      <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em]">{abierto ? 'Hoy' : 'Ahora'}</span>
      <span className="font-display text-[1.7rem] font-black italic leading-[0.95] @2xl:text-[2rem]">{abierto ? (info?.corto.split(' ·')[0] || 'Abierto') : 'Cerrado'}</span>
      <span className="mt-1 max-w-[7rem] text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.08em]">{abierto ? (info ? 'de espera' : 'consultá la espera') : 'mirá los horarios'}</span>
    </a>
  )
}

function Tapa() {
  const { activa } = useDatos()
  const M = useMarca()
  const { destacado } = useTrabajos()
  const { servicios } = useDatos()
  return (
    <section id="top" className="relative min-h-[640px] overflow-hidden text-es-blanco @2xl:min-h-[760px]" style={destacado ? fondoTrabajo(destacado) : undefined}>
      <div className="absolute inset-0 bg-gradient-to-b from-es-negro/35 via-transparent to-es-negro/55" />
      <div className="relative mx-auto flex min-h-[640px] max-w-[1200px] flex-col px-5 pb-8 pt-6 @2xl:min-h-[760px]">
        <div className="flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.2em]">
          <span>{M.zona}</span><span className="hidden @2xl:inline">Edición {MES}</span><span>Gratis</span>
        </div>
        <h1 className="mt-2 text-center font-display text-[17cqi] font-black uppercase leading-[0.82] tracking-[-0.04em] @2xl:text-[10.5rem] @5xl:text-[13rem]">
          {M.nombre.split(' ').at(-1)}
        </h1>
        <p className="text-center text-[0.72rem] font-bold uppercase tracking-[0.5em]">{M.nombre} · {M.rubro}</p>

        <div className="mt-10 grid flex-1 grid-cols-1 gap-6 @2xl:mt-14 @2xl:grid-cols-2">
          <div className="max-w-[17rem] space-y-6">
            <a href="#servicios" className="block text-es-blanco no-underline">
              <span className="block text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-es-acento [text-shadow:0_1px_0_#fff3]">En portada</span>
              <span className="block font-display text-[2.2rem] font-black italic leading-[0.95]">{M.eslogan}</span>
              <span className="mt-1 block text-[0.9rem] text-es-blanco/85">Qué pedir y cuánto tiempo lleva cada servicio.</span>
            </a>
            <a href="#consulta" className="block text-es-blanco no-underline">
              <span className="block font-display text-[1.5rem] font-bold leading-tight">Cómo consultar antes de venir</span>
            </a>
          </div>
          <div className="flex flex-col items-start justify-end gap-2 @2xl:items-end @2xl:text-right">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em]">En este número</span>
            {servicios.slice(0, 5).map(s => <span key={s.id} className="font-display text-[1.25rem] italic leading-tight">{s.nombre}</span>)}
          </div>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.15em]">{M.horario}</span>
          <span className="bg-es-blanco p-2 pb-1 text-center text-[#111]">
            <span className="rv-barras block h-10 w-28" />
            <span className="block text-[0.55rem] font-semibold tracking-[0.3em]">7 798765 432106</span>
          </span>
        </div>
      </div>
      {activa("hoy") && <Pegatina />}
    </section>
  )
}

function Sumario() {
  const items = [['#hoy', 'Hoy en el salón', 'La espera de ahora y los horarios'], ['#servicios', 'Servicios', 'Qué hacemos y cuánto tarda'], ['#consulta', 'Consultanos', 'Te contamos cómo viene el día'], ['#trabajos', 'Trabajos', 'Los tonos del salón'], ['#donde', 'Datos útiles', 'Dirección, pagos e Instagram']]
  return (
    <nav aria-label="Sumario" className="sticky top-0 z-30 border-b border-es-tinta bg-es-rosa/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center gap-6 overflow-x-auto px-5 py-3">
        <span className="font-display text-[1.1rem] font-black italic">Sumario</span>
        {items.map(([h, t], i) => (
          <a key={h} href={h} className="flex flex-shrink-0 items-baseline gap-1.5 text-es-tinta no-underline hover:text-es-vino">
            <span className="text-[0.7rem] font-bold text-es-vino">p.{String((i + 1) * 4).padStart(2, '0')}</span>
            <span className="text-[0.82rem] font-semibold">{t}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}

function Hoy() {
  const { abierto, detalle, grupos, info, nivel, hora, demo, wa } = useHoy()
  return (
    <section id="hoy" className="mx-auto grid max-w-[1200px] scroll-mt-14 gap-10 border-b border-es-tinta px-5 py-14 @5xl:grid-cols-[1.3fr_1fr]">
      <div>
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em] text-es-vino">Actualidad · p.04</p>
        <h2 className="mt-2 font-display text-[3.4rem] font-black leading-[0.95] @2xl:text-[4.6rem]">{abierto ? 'Abierto, ' : 'Cerrado, '}<i className="font-normal">{abierto ? (info ? info.largo.toLowerCase() : 'consultá la espera') : 'por ahora'}.</i></h2>
        <p className="mt-4 text-[1.05rem] text-es-suave">{detalle}{hora && ` · Dato cargado por el salón a las ${hora} hs`}{demo && ' (demo)'}.</p>
        <div className="mt-6 flex items-center gap-1.5" aria-label={`Nivel de espera ${nivel} de 5`}>
          {[1, 2, 3, 4, 5].map(i => <span key={i} className={`h-3 flex-1 ${i <= nivel ? 'bg-es-vino' : 'border border-es-tinta'}`} />)}
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-7 inline-block border-b-2 border-es-tinta pb-0.5 text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-es-tinta no-underline hover:text-es-vino">Preguntar disponibilidad →</a>
      </div>
      <div className="border-l-0 border-es-tinta @5xl:border-l @5xl:pl-10">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em]">Horarios</p>
        <dl className="mt-3">
          {grupos.map(g => (
            <div key={g.titulo} className="flex items-baseline justify-between border-b border-es-linea py-3">
              <dt className="font-display text-[1.2rem] italic">{g.titulo}</dt><dd className="font-semibold">{g.valor}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[0.82rem] text-es-suave">Vení con el tiempo que necesita tu servicio.</p>
      </div>
    </section>
  )
}

function Servicios() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [abierto, setAbierto] = useState<string | null | undefined>(servicios[0]?.id)
  return (
    <section id="servicios" className="mx-auto max-w-[1200px] scroll-mt-14 border-b border-es-tinta px-5 py-14">
      <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em] text-es-vino">Guía · p.08</p>
      <h2 className="mt-2 font-display text-[3.4rem] font-black leading-[0.95] @2xl:text-[4.6rem]">Todo sobre <i className="font-normal">los servicios</i></h2>
      <p className="rv-capitular mt-6 max-w-[46rem] text-[1.05rem] leading-relaxed text-es-suave @2xl:columns-2 @2xl:gap-10">{local.info}</p>
      <div className="mt-10 grid gap-0 border-t border-es-tinta @2xl:grid-cols-2 @5xl:grid-cols-3">
        {servicios.map((s, i) => (
          <article key={s.id} className="border-b border-es-tinta py-6 @2xl:px-6 @2xl:[&:nth-child(2n+1)]:pl-0 @5xl:[&:nth-child(2n+1)]:pl-6 @5xl:[&:nth-child(3n+1)]:pl-0">
            <button type="button" onClick={() => setAbierto(abierto === s.id ? null : s.id)} aria-expanded={abierto === s.id} className="w-full text-left">
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-es-vino">Nota {i + 1} · {s.duracion} · {s.precio}</span>
              <span className="mt-1 block font-display text-[2rem] font-bold leading-tight">{s.nombre}</span>
            </button>
            {abierto === s.id && (
              <>
                <p className="mt-2 leading-relaxed text-es-suave">{s.descripcion}</p>
                <a href={waUrl(consultaServicio(s))} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[0.78rem] font-extrabold uppercase tracking-[0.15em] text-es-vino">Consultar →</a>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function Consulta() {
  const { servicios } = useDatos()
  const c = useConsulta()
  const opcion = (on: boolean) => `border-b-2 pb-1 text-[1.05rem] transition-colors ${on ? 'border-es-vino font-semibold text-es-vino' : 'border-transparent hover:border-es-tinta'}`
  return (
    <section id="consulta" className="scroll-mt-14 bg-es-tinta text-es-claro">
      <form onSubmit={c.enviar} className="mx-auto grid max-w-[1200px] gap-10 px-5 py-16 @5xl:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em] text-es-acento">Correo de lectoras · p.12</p>
          <h2 className="mt-2 font-display text-[3.2rem] font-black leading-[0.95] @2xl:text-[4.2rem]">Escribinos <i className="font-normal">antes de venir</i></h2>
          <p className="mt-4 max-w-[22rem] text-es-claro/70">Contanos qué querés y te decimos cómo viene el día.</p>
        </div>
        <div className="space-y-6">
          <fieldset><legend className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-es-claro/60">Servicio</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">{servicios.map(s => <button key={s.id} type="button" aria-pressed={c.servicio === s.nombre} onClick={() => c.elegirServicio(s.nombre)} className={opcion(c.servicio === s.nombre)}>{s.nombre}</button>)}</div></fieldset>
          <fieldset><legend className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-es-claro/60">Cuándo</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">{CUANDO.map(x => <button key={x} type="button" aria-pressed={c.cuando === x} onClick={() => c.elegirCuando(x)} className={opcion(c.cuando === x)}>{x}</button>)}</div></fieldset>
          <label className="block"><span className="mb-1 block text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-es-claro/60">Te cuento…</span>
            <textarea rows={3} value={c.nota} onChange={e => c.setNota(e.target.value)} placeholder="lo que quieras contarnos" className="w-full border-b border-es-claro/40 bg-transparent py-2 font-display text-[1.3rem] italic outline-none placeholder:text-es-claro/30 focus:border-es-acento" /></label>
          <label className="block"><span className="mb-1 block text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-es-claro/60">Firma (opcional)</span>
            <input value={c.nombre} onChange={e => c.setNombre(e.target.value)} className="w-full border-b border-es-claro/40 bg-transparent py-2 font-display text-[1.3rem] italic outline-none focus:border-es-acento" /></label>
          <button className="min-h-[52px] bg-es-vino px-8 text-[0.8rem] font-extrabold uppercase tracking-[0.2em] text-es-blanco hover:bg-es-acento-2">Enviar por WhatsApp</button>
        </div>
      </form>
    </section>
  )
}

export default function Revista() {
  const horario = useHorario()
  const waUrl = useWa()
  const M = useMarca()
  const { activa } = useDatos()
  const { resto, hayDemo } = useTrabajos()
  return (
    <div className="bg-es-rosa text-es-tinta">
      <Tapa />
      <Sumario />
      {activa("hoy") && <Hoy />}
      {activa("servicios") && <Servicios />}
      {activa("consulta") && <Consulta />}
      {activa("galeria") && <section id="trabajos" className="mx-auto max-w-[1200px] scroll-mt-14 px-5 py-14">
        <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em] text-es-vino">Producción · p.16</p>
        <h2 className="mt-2 font-display text-[3.4rem] font-black leading-[0.95] @2xl:text-[4.6rem]">Los tonos <i className="font-normal">de la temporada</i></h2>
        <div className="mt-8 grid grid-cols-2 gap-4 @2xl:grid-cols-6">
          {resto.slice(0, 6).map((t, i) => (
            <figure key={t.id} className={i === 0 ? 'col-span-2 row-span-2 @2xl:col-span-3' : i < 3 ? '@2xl:col-span-3' : '@2xl:col-span-2'}>
              <a href={t.link || undefined} target={t.link ? '_blank' : undefined} rel="noopener noreferrer" className={`block ${i === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`} style={fondoTrabajo(t)} aria-label={t.titulo || 'Trabajo'} />
              <figcaption className="mt-1.5 text-[0.72rem] text-es-suave"><b className="text-es-tinta">Fig. {i + 1}</b> {t.titulo || (t.es_reel ? 'Reel en Instagram' : 'Trabajo del salón')}</figcaption>
            </figure>
          ))}
        </div>
        {hayDemo && <p className="mt-4 text-[0.75rem] italic text-es-suave">Demo: tonos ilustrativos, se reemplazan por fotos reales.</p>}
      </section>}
      {activa("ubicacion") && <section id="donde" className="scroll-mt-14 border-t border-es-tinta">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 @5xl:grid-cols-3">
          <div className="@5xl:col-span-2">
            <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.25em] text-es-vino">Datos útiles · p.20</p>
            <p className="mt-2 font-display text-[2.4rem] font-bold leading-tight">{M.direccion}</p>
            <Mapa className="mt-5 h-[260px] w-full grayscale" />
            <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-[0.78rem] font-extrabold uppercase tracking-[0.15em] text-es-tinta">Cómo llegar →</a>
          </div>
          <aside className="border-2 border-es-tinta p-6">
            <p className="text-center font-display text-[1.6rem] font-black italic">Staff</p>
            <dl className="mt-4 space-y-3 text-[0.9rem]">
              <div><dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-es-vino">Dirección de arte</dt><dd>{M.nombre}</dd></div>
              <div><dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-es-vino">Lectoras</dt><dd>{M.instagramUrl ? <a href={M.instagramUrl} target="_blank" rel="noopener noreferrer" className="underline">Ver el perfil</a> : "Pronto en Instagram"}</dd></div>
              <div><dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-es-vino">Horario</dt><dd>{horario.join(' · ')}</dd></div>
              <div><dt className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-es-vino">Redacción</dt><dd><a href={waUrl()} target="_blank" rel="noopener noreferrer" className="underline">Escribinos por WhatsApp</a></dd></div>
            </dl>
          </aside>
        </div>
      </section>}
    </div>
  )
}
