"use client";

import { useState, type CSSProperties } from "react";
import { CUANDO, Mapa, consultaServicio, fondoTrabajo, useConsulta, useDatos, useHorario, useHoy, useMarca, useTrabajos, useWa, esTrabajo } from "../datos";

// Códigos tipo carta de tinturas (nivel.reflejo), solo decorativos.
const CODIGOS = ['7.31', '9.03', '6.46', '8.34', '10.1', '5.62', '4.0', '9.13']

type PropsMechon = { tono: string; codigo?: string; alto?: string; ancho?: string; etiqueta?: string; onClick?: () => void; activo?: boolean };

function Mechon({ tono, codigo, alto = 'h-[300px]', ancho = 'w-[64px]', etiqueta, onClick, activo }: PropsMechon) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo} className={`ms-colgado group flex flex-shrink-0 flex-col items-center ${onClick ? '' : 'pointer-events-none'}`}>
      <span className={`relative z-10 flex h-[52px] ${ancho} flex-col items-center justify-start border bg-es-carta pt-1.5 ${activo ? 'border-es-tinta' : 'border-es-linea'}`}>
        <span className="ms-agujero h-2.5 w-2.5 rounded-full bg-es-rosa" />
        <span className="mt-1 text-[0.72rem] font-semibold tabular-nums">{codigo}</span>
      </span>
      <span className={`ms-mechon -mt-px block ${alto} ${ancho === 'w-[64px]' ? 'w-[46px]' : 'w-[58%]'}`} style={{ '--tono': tono } as CSSProperties} />
      {etiqueta && <span className={`mt-3 max-w-[7rem] text-center text-[0.82rem] leading-tight ${activo ? 'font-semibold' : 'text-es-suave'}`}>{etiqueta}</span>}
    </button>
  )
}

function EtiquetaHoy() {
  const { abierto, detalle, grupos, info, nivel, hora, demo, wa } = useHoy()
  return (
    <div id="hoy" className="relative min-w-0 self-start scroll-mt-20 border border-es-linea bg-es-carta p-6 @2xl:p-8">
      <span className="ms-agujero absolute left-1/2 top-3 h-3 w-3 -translate-x-1/2 rounded-full bg-es-rosa" />
      <div className="flex items-start justify-between gap-4 pt-3">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-es-suave">Hoy en el salón</p>
          <p className="mt-1 font-display text-[2.6rem] leading-none">{abierto ? 'Abierto' : 'Cerrado'}</p>
          <p className="mt-1 text-[0.88rem] text-es-suave">{detalle}</p>
        </div>
        <span className={`mt-2 h-4 w-4 flex-shrink-0 rounded-full ${abierto ? 'bg-es-verde' : 'bg-es-linea'}`} />
      </div>
      {abierto && (
        <div className="mt-6">
          <div className="flex items-baseline justify-between text-[0.8rem]"><span className="text-es-suave">Espera</span><span className="font-semibold">{info ? info.corto : 'Consultanos'}{demo && ' · demo'}</span></div>
          {/* la espera como escala de tonos: de claro (sin espera) a oscuro (completo) */}
          <div className="mt-2 grid grid-cols-5 gap-1">
            {['#EEDFC0', '#D8B985', '#B98A56', '#7E5531', '#3E2716'].map((c, i) => (
              <span key={c} className={`h-8 ${i + 1 === nivel ? 'outline outline-2 outline-offset-2 outline-es-tinta' : ''}`} style={{ background: c, opacity: nivel && i + 1 > nivel ? 0.35 : 1 }} />
            ))}
          </div>
          {hora && <p className="mt-2 text-right text-[0.72rem] text-es-suave">Actualizado {hora} hs</p>}
        </div>
      )}
      <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-es-linea pt-4 text-center">
        {grupos.map(g => <div key={g.titulo}><dt className="text-[0.66rem] uppercase tracking-[0.12em] text-es-suave">{g.titulo}</dt><dd className="mt-1 font-display text-[1.3rem] leading-tight">{g.valor}</dd></div>)}
      </dl>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-[50px] items-center justify-center bg-es-tinta text-[0.85rem] font-semibold text-es-claro no-underline hover:bg-es-acento">Consultar disponibilidad</a>
    </div>
  )
}

function Carta() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [sel, setSel] = useState<string | null | undefined>(servicios[0]?.id)
  const s = servicios.find(x => x.id === sel)
  return (
    <section id="servicios" className="scroll-mt-16 border-y border-es-linea bg-es-rosa-2">
      <div className="mx-auto max-w-[1200px] px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[3.4rem] leading-none @2xl:text-[4.4rem]">Carta de <i>servicios</i></h2>
          <p className="max-w-[22rem] text-[0.92rem] text-es-suave">Tocá un mechón. El valor se define en la consulta, según largo y base.</p>
        </div>
        <div className="mt-10 grid items-start gap-10 @5xl:grid-cols-[minmax(0,1.4fr)_1fr]">
          <div className="flex min-w-0 gap-4 overflow-x-auto pb-4 @2xl:gap-7">
            {servicios.map((x, i) => (
              <Mechon key={x.id} tono={`linear-gradient(180deg, ${x.color_a}, ${x.color_b})`} codigo={CODIGOS[i % CODIGOS.length]} alto="h-[230px]" etiqueta={x.nombre} activo={sel === x.id} onClick={() => setSel(x.id)} />
            ))}
          </div>
          <div className="border border-es-linea bg-es-carta p-6" aria-live="polite">
            {s ? (
              <>
                <p className="text-[0.72rem] uppercase tracking-[0.2em] text-es-suave">Ref. {CODIGOS[servicios.indexOf(s) % CODIGOS.length]} · {s.duracion} · {s.precio}</p>
                <h3 className="mt-1 font-display text-[2.4rem] leading-none">{s.nombre}</h3>
                <p className="mt-3 leading-relaxed text-es-suave">{s.descripcion}</p>
                <a href={waUrl(consultaServicio(s))} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block border-b border-es-tinta text-[0.88rem] font-semibold text-es-tinta no-underline hover:text-es-acento">Consultar por {s.nombre.toLowerCase()}</a>
              </>
            ) : <p className="text-es-suave">{local.info}</p>}
            {s && <p className="mt-5 border-t border-es-linea pt-4 text-[0.8rem] leading-relaxed text-es-suave">{local.info}</p>}
          </div>
        </div>
      </div>
    </section>
  )
}

function Consulta() {
  const { servicios } = useDatos()
  const c = useConsulta()
  const chip = (on: boolean) => `flex min-h-[42px] items-center gap-2 border px-3 text-[0.88rem] transition-colors ${on ? 'border-es-tinta bg-es-tinta text-es-claro' : 'border-es-linea bg-es-carta hover:border-es-tinta'}`
  return (
    <section id="consulta" className="mx-auto grid max-w-[1200px] scroll-mt-16 gap-10 px-5 py-16 @5xl:grid-cols-[1fr_1.3fr]">
      <div>
        <h2 className="font-display text-[3.2rem] leading-none @2xl:text-[4rem]">Ficha de <i>consulta</i></h2>
        <p className="mt-4 max-w-[24rem] text-es-suave">Completá la ficha y te respondemos por WhatsApp cómo viene el día.</p>
      </div>
      <form onSubmit={c.enviar} className="divide-y divide-es-linea border border-es-linea bg-es-carta">
        <div className="p-5"><p className="mb-3 text-[0.72rem] uppercase tracking-[0.18em] text-es-suave">Servicio</p>
          <div className="flex flex-wrap gap-2">{servicios.map(s => <button key={s.id} type="button" aria-pressed={c.servicio === s.nombre} onClick={() => c.elegirServicio(s.nombre)} className={chip(c.servicio === s.nombre)}><span className="h-4 w-4 rounded-full" style={{ background: `linear-gradient(180deg, ${s.color_a}, ${s.color_b})` }} />{s.nombre}</button>)}</div></div>
        <div className="p-5"><p className="mb-3 text-[0.72rem] uppercase tracking-[0.18em] text-es-suave">Cuándo</p>
          <div className="flex flex-wrap gap-2">{CUANDO.map(x => <button key={x} type="button" aria-pressed={c.cuando === x} onClick={() => c.elegirCuando(x)} className={chip(c.cuando === x)}>{x}</button>)}</div></div>
        <label className="block p-5"><span className="mb-2 block text-[0.72rem] uppercase tracking-[0.18em] text-es-suave">Base actual y tono buscado</span>
          <textarea rows={3} value={c.nota} onChange={e => c.setNota(e.target.value)} placeholder="Ej: lo que tenés hoy y lo que buscás" className="w-full bg-transparent outline-none" /></label>
        <label className="block p-5"><span className="mb-2 block text-[0.72rem] uppercase tracking-[0.18em] text-es-suave">Nombre</span>
          <input value={c.nombre} onChange={e => c.setNombre(e.target.value)} className="w-full bg-transparent outline-none" placeholder="Opcional" /></label>
        <button className="min-h-[54px] w-full bg-es-tinta text-[0.9rem] font-semibold text-es-claro hover:bg-es-acento">Enviar por WhatsApp</button>
      </form>
    </section>
  )
}

export default function Muestrario() {
  const horario = useHorario()
  const waUrl = useWa()
  const M = useMarca()
  const { activa } = useDatos()
  const { destacado, resto, hayDemo } = useTrabajos()
  const fan = [destacado, ...resto].filter(esTrabajo).slice(0, 8)

  return (
    <div className="bg-es-rosa text-es-tinta">
      <header className="sticky top-0 z-30 border-b border-es-linea bg-es-rosa/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-5">
          <a href="#top" className="font-display text-[1.6rem] leading-none text-es-tinta no-underline">{M.nombre}</a>
          <nav className="hidden gap-7 text-[0.85rem] text-es-suave @3xl:flex">{[['#hoy', 'Hoy'], ['#servicios', 'Carta'], ['#consulta', 'Consulta'], ['#trabajos', 'Trabajos'], ['#donde', 'Dónde']].map(([h, t]) => <a key={h} href={h} className="text-es-suave no-underline hover:text-es-tinta">{t}</a>)}</nav>
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="border border-es-tinta px-4 py-2 text-[0.82rem] font-semibold text-es-tinta no-underline hover:bg-es-tinta hover:text-es-claro">Escribinos</a>
        </div>
      </header>

      <section id="top" className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-16 pt-12 @5xl:grid-cols-[minmax(0,1.3fr)_1fr]">
        <div className="min-w-0">
          <p className="text-[0.8rem] text-es-suave">{M.rubro} · {M.zona}</p>
          <h1 className="mt-3 font-display text-[3.8rem] leading-[0.95] @2xl:text-[5.4rem]">{M.eslogan}</h1>
          <p className="mt-5 max-w-[30rem] text-[1.02rem] leading-relaxed text-es-suave">Elegimos el tono con vos, mechón por mechón. Escribinos y te contamos cómo viene el día.</p>
          {/* el muestrario: abanico de mechones de los trabajos */}
          <div className="mt-10 flex gap-2.5 overflow-x-auto pb-2 @2xl:gap-3.5">
            {fan.map((t, i) => (
              <Mechon key={t.id} tono={t.imagen ? `url(${t.imagen}) center/cover` : `linear-gradient(180deg, ${t.color_a}, ${t.color_b})`} codigo={CODIGOS[i]} alto={i % 2 ? 'h-[230px]' : 'h-[260px]'} />
            ))}
          </div>
        </div>
        {activa("hoy") && <EtiquetaHoy />}
      </section>

      {activa("servicios") && <Carta />}
      {activa("consulta") && <Consulta />}

      {activa("galeria") && <section id="trabajos" className="scroll-mt-16 border-t border-es-linea bg-es-carta">
        <div className="mx-auto max-w-[1200px] px-5 py-16">
          <h2 className="font-display text-[3.2rem] leading-none @2xl:text-[4rem]">Resultados</h2>
          <div className="mt-8 grid grid-cols-2 gap-px bg-es-linea @2xl:grid-cols-4">
            {[destacado, ...resto].filter(esTrabajo).slice(0, 8).map((t, i) => (
              <a key={t.id} href={t.link || undefined} target={t.link ? '_blank' : undefined} rel="noopener noreferrer" className="group block bg-es-carta p-3 no-underline">
                <span className="block aspect-square" style={fondoTrabajo(t)} />
                <span className="mt-2 flex justify-between text-[0.75rem] text-es-suave"><span>Ref. {CODIGOS[i]}</span><span>{t.es_reel ? 'Reel' : 'Foto'}</span></span>
              </a>
            ))}
          </div>
          {hayDemo && <p className="mt-3 text-[0.78rem] text-es-suave">Demo: tonos ilustrativos, se reemplazan por fotos reales.</p>}
        </div>
      </section>}

      {activa("ubicacion") && <section id="donde" className="mx-auto grid max-w-[1200px] scroll-mt-16 gap-10 px-5 py-16 @5xl:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="font-display text-[3.2rem] leading-none">Dónde</h2>
          <p className="mt-3 text-[1.1rem]">{M.direccion}</p>
          <a href={M.MAPS_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block border-b border-es-tinta text-[0.88rem] font-semibold text-es-tinta no-underline">Cómo llegar</a>
          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-es-linea pt-6">
            <div><p className="text-[0.72rem] uppercase tracking-[0.18em] text-es-suave">Instagram</p><p className="font-display text-[2.6rem] leading-none"><span className="text-[0.6em] [overflow-wrap:anywhere]">{M.instagram ? `@${M.instagram}` : "—"}</span></p><a href={M.instagramUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-[0.88rem] text-es-tinta">Ver el perfil</a></div>
            <div><p className="text-[0.72rem] uppercase tracking-[0.18em] text-es-suave">Horario</p><ul className="mt-1 space-y-0.5">{horario.map(p => <li key={p}>{p}</li>)}</ul></div>
          </div>
        </div>
        <Mapa className="aspect-[4/3] w-full border border-es-linea grayscale-[0.6]" />
      </section>}
    </div>
  )
}
