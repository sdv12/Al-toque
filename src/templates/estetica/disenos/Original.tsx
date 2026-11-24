"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Clock, Heart, Menu, Play, Send, X } from "lucide-react";
import { CUANDO, Mapa, useDatos, useHorario, useHoy, useMarca, useWa, type TrabajoVista } from "../datos";


// Monograma con las iniciales de la marca. LogoGrande = versión del hero con
// el nombre cruzado y el rubro abajo.
function Monograma({ className = '' }: { className?: string }) {
  const MARCA = useMarca()
  return <span className={`font-display font-black leading-none tracking-[-0.06em] ${className}`}>{MARCA.iniciales}</span>
}

function LogoNav({ claro = false }: { claro?: boolean }) {
  const MARCA = useMarca()
  return (
    <span className="flex items-center gap-3">
      <Monograma className={`text-[1.75rem] ${claro ? 'text-es-blanco' : 'text-es-tinta'}`} />
      <span className={`hidden text-[0.68rem] font-medium uppercase tracking-[0.32em] @2xl:inline ${claro ? 'text-es-blanco/80' : 'text-es-tinta'}`}>
        {MARCA.nombre}
      </span>
    </span>
  )
}

function LogoGrande() {
  const MARCA = useMarca()
  return (
    <div className="relative mx-auto w-fit select-none text-center" aria-label={`${MARCA.nombre}, ${MARCA.rubro.toLowerCase()}`} role="img">
      <Monograma className="block text-[9rem] font-black text-es-acento @2xl:text-[13rem] @5xl:text-[15.5rem]" />
      <span className={`absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap py-1 text-[0.72rem] font-medium uppercase tracking-[0.4em] @2xl:tracking-[0.55em]
        ${MARCA.esDemo ? 'bg-es-tinta pl-[0.85em] pr-[0.45em] text-es-claro @2xl:text-[1rem]' : 'pl-[0.4em] text-es-tinta @2xl:text-[1.05rem]'}`}>
        {MARCA.nombre}
      </span>
      <span className="mt-3 block text-[0.7rem] font-medium uppercase tracking-[0.5em] text-es-blanco/60 @2xl:text-[0.78rem]">
        {MARCA.rubro}
      </span>
    </div>
  )
}


const LINKS = [
  ['#hoy', 'Hoy'], ['#servicios', 'Servicios'], ['#visita', 'Tu visita'], ['#trabajos', 'Trabajos'], ['#donde', 'Dónde'],
]

function Nav() {
  const waUrl = useWa()
  const [abierto, setAbierto] = useState(false)
  const MARCA = useMarca()
  useEffect(() => {
    if (!abierto) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto])

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-es-linea/70 bg-es-rosa/95 backdrop-blur">
      <nav className="mx-auto flex h-[62px] max-w-[1180px] items-center justify-between gap-4 px-5 @2xl:px-10">
        <a href="#top" className="no-underline" aria-label={`${MARCA.nombre} — inicio`}><LogoNav /></a>
        <ul className="hidden items-center gap-8 @5xl:flex">
          {LINKS.map(([href, txt]) => (
            <li key={href}>
              <a href={href} className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-es-suave no-underline transition-colors hover:text-es-tinta">{txt}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="es-btn es-btn-borde min-h-[40px] px-4 py-2 text-[0.7rem] @2xl:px-5">Escribinos</a>
          <button
            type="button" onClick={() => setAbierto(a => !a)} aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={abierto} aria-controls="menu-movil"
            className="flex h-11 w-11 items-center justify-center text-es-tinta @5xl:hidden"
          >
            {abierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>
    </header>
    {abierto && (
      <div id="menu-movil" className="sticky top-[62px] z-[45] flex min-h-[70cqi] flex-col overflow-y-auto bg-es-tinta @5xl:hidden">
        <nav aria-label="Secciones" className="px-6 pt-6">
          <ul>
            {LINKS.map(([href, txt]) => (
              <li key={href} className="border-b border-es-blanco/10">
                <a href={href} onClick={() => setAbierto(false)}
                  className="flex items-center justify-between py-[1.1rem] font-display text-[1.9rem] font-bold italic text-es-claro no-underline active:text-es-acento">
                  {txt}
                  <ArrowUpRight size={20} strokeWidth={1.5} className="text-es-acento" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto px-6 pb-10 pt-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-es-acento">{MARCA.zona}</p>
          <p className="mt-2 text-[0.9rem] text-es-blanco/60">{MARCA.direccion}</p>
          <a href={waUrl()} target="_blank" rel="noopener noreferrer" className="es-btn es-btn-acento mt-6 w-full">Escribinos por WhatsApp</a>
        </div>
      </div>
    )}
    </>
  )
}

function Encabezado({ num, titulo, children, claro = false }: { num: string; titulo: string; children?: ReactNode; claro?: boolean }) {
  return (
    <div className="max-w-[34rem]">
      <span className={`text-[0.7rem] font-semibold tracking-[0.3em] ${claro ? 'text-es-acento' : 'text-es-vino'}`}>{num}</span>
      <h2 className={`es-titulo mt-2 ${claro ? 'text-es-blanco' : ''}`}>{titulo}</h2>
      <div className="es-filete" />
      {children && <p className={`mt-5 text-[1.02rem] leading-relaxed ${claro ? 'text-es-blanco/70' : 'text-es-suave'}`}>{children}</p>}
    </div>
  )
}


function EstadoHoy() {
  const { abierto, detalle, grupos, nivel, info, hora, demo, wa } = useHoy()
  return (
    <div id="hoy" className="scroll-mt-24 rounded-[var(--radio)] border border-es-linea bg-es-carta px-5 py-6 shadow-[0_30px_60px_-20px_rgba(31,26,26,.35)] @2xl:px-6">
      <div className="flex items-center gap-3">
        <span className={`relative flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full ${abierto ? 'bg-es-verde/25' : 'bg-es-suave/20'}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${abierto ? 'bg-es-verde' : 'bg-es-suave/60'}`} />
          {abierto && <span className="absolute inset-0 animate-ping rounded-full bg-es-verde/20 motion-reduce:hidden" />}
        </span>
        <h2 className="text-[1.6rem] font-bold leading-tight @2xl:text-[1.75rem]">{abierto ? 'Abierto ahora' : 'Cerrado ahora'}</h2>
      </div>
      <p className="ml-[30px] mt-1 text-[0.85rem] text-es-suave">{detalle}</p>

      {abierto && (
        <div className="mt-5 border-t border-dashed border-es-linea pt-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-es-suave">Espera estimada</span>
            <span className="flex items-center gap-2">
              <span className="font-display text-[1.15rem] font-bold">{info ? info.corto : 'Consultanos'}</span>
              {demo && <span className="bg-es-tinta px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.15em] text-es-blanco">Demo</span>}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1.5" role="meter" aria-valuemin={0} aria-valuemax={5} aria-valuenow={info ? nivel : 0} aria-label="Nivel de espera">
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} className={`h-[7px] ${info && i <= nivel ? info.color : 'border border-es-tinta/80'}`} />
            ))}
          </div>
          {hora && <p className="mt-2 text-right text-[0.72rem] text-es-suave">Actualizado hoy a las {hora} hs</p>}
          {!info && <p className="mt-2 text-[0.78rem] text-es-suave">Escribinos y te contamos cómo viene la espera.</p>}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 border-t border-dashed border-es-linea pt-5 @2xl:grid-cols-3">
        {grupos.map((g, i) => (
          <div key={g.titulo} className={`py-2 text-center @2xl:py-1 ${i > 0 ? 'border-t border-es-linea @2xl:border-l @2xl:border-t-0' : ''}`}>
            <div className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-es-suave">{g.titulo}</div>
            <div className="mt-1.5 font-display text-[1.35rem] font-bold">{g.valor}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[0.78rem] text-es-suave">
        <Heart size={12} strokeWidth={1.5} className="flex-shrink-0" /> Recordá venir con el tiempo necesario para el servicio a realizar
      </p>
      <a
        href={wa}
        target="_blank" rel="noopener noreferrer" className="es-btn es-btn-negro mt-5 w-full"
      >
        Consultar disponibilidad
      </a>
    </div>
  )
}


function Hero() {
  const { activa } = useDatos()
  const MARCA = useMarca()
  return (
    <section id="top" className="relative">
      <div
        className="bg-es-tinta pb-44 pt-14 @2xl:pb-48 @2xl:pt-16"
        style={{ backgroundImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgb(var(--c-acento) / .10), transparent 70%)' }}
      >
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 @2xl:px-10 @5xl:grid-cols-[1fr_1.05fr] @5xl:gap-10">
          <LogoGrande />
          <div className="text-center @5xl:text-left">
            <p className="es-etiqueta mb-5 text-[0.66rem] text-es-acento @2xl:text-[0.72rem]">{MARCA.rubro} · {MARCA.zona}</p>
            <h1 className="text-[2.7rem] font-extrabold italic leading-[1.05] text-es-claro @2xl:text-[3.6rem]">
              {MARCA.eslogan}
            </h1>
            <p className="mx-auto mt-5 max-w-[30rem] text-[1.02rem] leading-relaxed text-es-blanco/75 @5xl:mx-0">
              Mirá si hay lugar antes de venir y escribinos: te contamos cómo viene el día.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 @5xl:justify-start">
              <a href="#hoy" className="es-btn es-btn-acento">¿Hay lugar hoy?</a>
              <a href="#servicios" className="es-btn es-btn-borde-claro">Ver servicios</a>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 mx-auto -mt-32 max-w-[800px] px-4 @2xl:-mt-36 @2xl:px-6">
        {activa("hoy") && <EstadoHoy />}
      </div>
    </section>
  )
}


const INFO_GRAD = 'linear-gradient(180deg, rgb(var(--c-vino)), rgb(var(--c-fondo)))'
const grad = (s: { color_a: string; color_b: string }) => `linear-gradient(180deg, ${s.color_a}, ${s.color_b})`

function Circulo({ activo, onClick, fondo, label, children }: { activo: boolean; onClick: () => void; fondo: string; label: string; children?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={activo} className="group flex w-[92px] flex-col items-center gap-3 @2xl:w-[100px]">
      <span
        className={`flex h-[84px] w-[84px] items-center justify-center rounded-full border-[3px] p-[4px] transition-transform group-hover:-translate-y-1 @2xl:h-[86px] @2xl:w-[86px]
          ${activo ? 'border-es-tinta' : 'border-es-acento/80'}`}
      >
        <span className="flex h-full w-full items-center justify-center rounded-full font-display text-[1.4rem] font-bold" style={{ background: fondo }}>
          {children}
        </span>
      </span>
      <span className={`text-center text-[0.62rem] font-bold uppercase leading-snug tracking-[0.18em] ${activo ? 'text-es-tinta underline underline-offset-4' : 'text-es-tinta'}`}>
        {label}
      </span>
    </button>
  )
}

function Servicios() {
  const waUrl = useWa()
  const { servicios, local } = useDatos()
  const [sel, setSel] = useState<string | null>(null)
  const s = servicios.find(x => x.id === sel)

  return (
    <section id="servicios" className="mx-auto max-w-[1180px] px-5 py-20 @2xl:px-10 @2xl:py-24">
      <Encabezado num="01" titulo="Servicios">
        Tocá un círculo para ver el detalle, la duración y el precio.
      </Encabezado>

      <div className="mt-10 flex flex-wrap gap-x-4 gap-y-7 @2xl:gap-x-6">
        {servicios.map(x => (
          <Circulo key={x.id} activo={sel === x.id} onClick={() => setSel(sel === x.id ? null : x.id)} fondo={grad(x)} label={x.nombre} />
        ))}
        <Circulo activo={sel === 'info'} onClick={() => setSel(sel === 'info' ? null : 'info')} fondo={INFO_GRAD} label="Info">
          i
        </Circulo>
      </div>

      {sel && (
        <div className="relative mt-10 grid max-w-[46rem] gap-6 rounded-[var(--radio)] border border-es-linea bg-es-carta p-6 @2xl:grid-cols-[120px_1fr] @2xl:p-7" aria-live="polite">
          <button type="button" onClick={() => setSel(null)} aria-label="Cerrar detalle" className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center text-es-suave hover:text-es-tinta">
            <X size={18} />
          </button>
          <div className="hidden h-[120px] w-[120px] rounded-full @2xl:block" style={{ background: s ? grad(s) : INFO_GRAD }} />
          <div>
            <h3 className="text-[1.8rem] font-bold">{s ? s.nombre : 'Antes de venir'}</h3>
            {s?.duracion && (
              <p className="mt-1 flex items-center gap-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-es-vino">
                <Clock size={13} /> {s.duracion} · {s.precio}
              </p>
            )}
            <p className="mt-3 leading-relaxed text-es-suave">{s ? s.descripcion : local.info}</p>
            {s && (
              <a href={waUrl(`Hola! Quería consultar por ${s.nombre.toLowerCase()}.`)} target="_blank" rel="noopener noreferrer" className="es-btn es-btn-negro mt-5">
                Consultar por {s.nombre.toLowerCase()}
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}



function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="mb-6">
      <legend className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-es-vino">{titulo}</legend>
      <div className="flex flex-wrap gap-2.5">{children}</div>
    </fieldset>
  )
}

function Visita() {
  const waUrl = useWa()
  const { servicios } = useDatos()
  const MARCA = useMarca()
  const [servicio, setServicio] = useState('')
  const [cuando, setCuando] = useState('')
  const [nota, setNota] = useState('')
  const [nombre, setNombre] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const partes = [
      `Hola!${nombre.trim() ? ` Soy ${nombre.trim()}.` : ''} Quería consultar disponibilidad.`,
      servicio && `Servicio: ${servicio}`,
      cuando && `Cuándo pienso ir: ${cuando.toLowerCase()}`,
      nota.trim() && `Te cuento: ${nota.trim()}`,
    ].filter(Boolean)
    window.open(waUrl(partes.join('\n')), '_blank', 'noopener')
  }

  return (
    <section id="visita" className="relative overflow-hidden bg-es-rosa-2">
      <span aria-hidden className="pointer-events-none absolute -left-6 top-6 select-none font-display text-[22rem] font-black leading-none tracking-[-0.06em] text-es-tinta/[0.05] @2xl:text-[30rem]">
        {MARCA.iniciales}
      </span>
      <div className="relative mx-auto grid max-w-[1180px] gap-12 px-5 py-20 @2xl:px-10 @2xl:py-24 @5xl:grid-cols-[1fr_1.05fr]">
        <div>
          <Encabezado num="02" titulo="Consultas">
            Contanos qué querés y cuándo pensás venir: se arma el mensaje de WhatsApp y te respondemos cómo viene el día.
          </Encabezado>
          <p className="mt-6 flex max-w-[26rem] gap-2.5 text-[0.86rem] leading-relaxed text-es-suave">
            <Heart size={13} strokeWidth={1.5} className="mt-1 flex-shrink-0" /> Recordá venir con tiempo para poder atenderte de la mejor manera posible.
          </p>
        </div>

        <form onSubmit={enviar} className="rounded-[var(--radio)] border border-es-linea bg-es-carta p-5 @2xl:p-6">
          <Grupo titulo="1 · Servicio">
            {servicios.map(s => (
              <button key={s.id} type="button" aria-pressed={servicio === s.nombre} onClick={() => setServicio(servicio === s.nombre ? '' : s.nombre)}
                className={`es-chip ${servicio === s.nombre ? 'es-chip-on' : ''}`}>{s.nombre}</button>
            ))}
          </Grupo>
          <Grupo titulo="2 · ¿Cuándo pensás venir?">
            {CUANDO.map(c => (
              <button key={c} type="button" aria-pressed={cuando === c} onClick={() => setCuando(cuando === c ? '' : c)}
                className={`es-chip ${cuando === c ? 'es-chip-on' : ''}`}>{c}</button>
            ))}
          </Grupo>
          <label className="mb-3 block text-[0.7rem] font-bold uppercase tracking-[0.22em] text-es-vino" htmlFor="nota">3 · Contanos qué querés (opcional)</label>
          <textarea id="nota" rows={4} value={nota} onChange={e => setNota(e.target.value)} className="es-campo resize-y"
            placeholder="Ej: lo que tenés hoy y lo que buscás..." />
          <label className="mb-3 mt-5 block text-[0.7rem] font-bold uppercase tracking-[0.22em] text-es-vino" htmlFor="nombre">4 · Tu nombre (opcional)</label>
          <input id="nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="es-campo" autoComplete="given-name" placeholder="Ej: Sofía" />
          <button type="submit" className="es-btn es-btn-negro mt-6 w-full"><Send size={15} /> Enviar consulta por WhatsApp</button>
          <p className="mt-3 text-center text-[0.74rem] text-es-suave">Se abre WhatsApp con el mensaje armado. No guardamos tus datos.</p>
        </form>
      </div>
    </section>
  )
}


function Pieza({ t, className = '', grande = false }: { t: TrabajoVista; className?: string; grande?: boolean }) {
  const tieneFoto = !!t.imagen
  const contenido = (
    <>
      {tieneFoto
        ? // eslint-disable-next-line @next/next/no-img-element -- fotos del cliente (URL https o ruta local)
        <img src={t.imagen} alt={t.alt || t.titulo || 'Trabajo del salón'} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        : <span className="es-mechones block h-full w-full" style={{ backgroundColor: t.color_a, backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px 7px), linear-gradient(180deg, ${t.color_a}, ${t.color_b})` }} />}
      {t.es_reel && <Play size={grande ? 22 : 13} fill="white" className="absolute right-2.5 top-2.5 text-es-blanco drop-shadow" />}
    </>
  )
  const cls = `group relative block overflow-hidden ${className}`
  return t.link
    ? <a href={t.link} target="_blank" rel="noopener noreferrer" className={cls} aria-label={t.titulo || 'Ver en Instagram'}>{contenido}</a>
    : <div className={cls}>{contenido}</div>
}

function Trabajos() {
  const M = useMarca()
  const { trabajos } = useDatos()
  const destacado = trabajos.find(t => t.destacado) || trabajos[0]
  const resto = trabajos.filter(t => t !== destacado).slice(0, 9)
  const hayDemo = trabajos.some(t => !t.imagen)

  return (
    <section id="trabajos" className="mx-auto max-w-[1180px] px-5 py-20 @2xl:px-10 @2xl:py-24">
      <Encabezado num="03" titulo="Trabajos">Un vistazo a los tonos del salón.</Encabezado>

      {destacado && (
        <div className="mt-12 grid items-center gap-8 @5xl:grid-cols-[1fr_1.15fr] @5xl:gap-16">
          <div className="relative">
            <Pieza t={destacado} grande className="aspect-[4/5] w-full" />
            {!destacado.imagen && (
              <span className="absolute left-3.5 top-3.5 bg-es-tinta/85 px-2.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.15em] text-es-blanco">
                Demo · acá va una foto real
              </span>
            )}
            <Monograma className="absolute -bottom-3 -right-2 text-[5.5rem] text-es-tinta @2xl:-right-4 @2xl:text-[8rem]" />
          </div>
          <div>
            <div className="grid grid-cols-3 gap-1">
              {resto.map(t => <Pieza key={t.id} t={t} className="aspect-square" />)}
            </div>
            {hayDemo
              ? <p className="mt-3 text-[0.74rem] italic text-es-suave">Demo: tonos ilustrativos. Se reemplazan por fotos y reels reales.</p>
              : M.instagramUrl && <a href={M.instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-es-vino underline underline-offset-4">Ver más en Instagram</a>}
          </div>
        </div>
      )}
    </section>
  )
}


function Donde() {
  const { MAPS_URL, direccionLineas } = useMarca()
  return (
    <section id="donde" className="bg-es-rosa-2">
      <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-20 @2xl:px-10 @2xl:py-24 @5xl:grid-cols-2">
        <div>
          <Encabezado num="04" titulo="Dónde estamos" />
          <p className="mt-6 font-display text-[1.35rem] font-medium leading-snug">
            {direccionLineas[0]}<br />{direccionLineas[1]}
          </p>
          <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="es-btn es-btn-borde mt-7">Cómo llegar</a>
        </div>
        <Mapa className="aspect-[4/3] w-full rounded-[var(--radio)] border border-es-linea" />
      </div>
    </section>
  )
}

function Redes() {
  const MARCA = useMarca()
  const horario = useHorario()
  return (
    <section className="bg-es-tinta text-es-blanco">
      <div className="mx-auto grid max-w-[1180px] gap-14 px-5 py-20 @2xl:px-10 @2xl:py-24 @5xl:grid-cols-2 @5xl:items-center">
        {MARCA.instagramUrl && (
          <div>
            <p className="es-etiqueta text-es-acento">Instagram</p>
            <p className="mt-7 font-display text-[2.6rem] font-black leading-none tracking-tight text-es-acento [overflow-wrap:anywhere] @2xl:text-[3.6rem]">@{MARCA.instagram}</p>
            <p className="mt-2 text-es-blanco/75">El día a día del salón, los trabajos y las novedades.</p>
            <a href={MARCA.instagramUrl} target="_blank" rel="noopener noreferrer" className="es-btn es-btn-acento mt-8">Ver el perfil</a>
          </div>
        )}
        <div>
          <p className="es-etiqueta text-es-acento">Horario</p>
          <ul className="mt-5 border-t border-es-blanco/15">
            {horario.map(p => (
              <li key={p} className="border-b border-es-blanco/15 py-4 font-display text-[1.6rem] font-bold italic @2xl:text-[1.75rem]">{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** El diseño original de la página de estilista: rosa, salvia, lila y arena cambian solo la paleta y la tipografía. */
export default function Original() {
  const { activa } = useDatos()
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {activa("servicios") && <Servicios />}
        {activa("consulta") && <Visita />}
        {activa("galeria") && <Trabajos />}
        {activa("ubicacion") && <Donde />}
        {activa("ubicacion") && <Redes />}
      </main>
    </>
  )
}
