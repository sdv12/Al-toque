"use client";

import { Fragment, useMemo, useState } from 'react'
import { useStore, clienteDe } from '../lib/store'
import { hoyISO, sumarDias, desdeISO, plata, aMin, DIAS_C } from '../lib/fechas'
import { voc, cap, pl, fem } from '../lib/profesiones'
import { Kpi, METODOS } from './ui'
import type { Db, Metodo } from '../lib/tipos'

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0)
const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : null)

function calcular(db: Db, desde: string, hasta: string) {
  const ts = db.turnos.filter((t) => t.fecha >= desde && t.fecha <= hasta)
  const ms = db.movimientos.filter((m) => m.fecha >= desde && m.fecha <= hasta)
  const ingresos = ms.filter((m) => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0)
  const egresos = ms.filter((m) => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0)
  const atendidos = ts.filter((t) => t.estado === 'atendido')
  const ausentes = ts.filter((t) => t.estado === 'ausente').length
  return { ts, ms, ingresos, egresos, atendidos, ausentes, ticket: atendidos.length ? ingresos / atendidos.length : 0 }
}

export default function Stats() {
  const { db } = useStore()
  const v = voc(db.negocio)
  const [dias, setDias] = useState(30)
  const hasta = hoyISO()
  const desde = sumarDias(hasta, -(dias - 1))
  const a = useMemo(() => calcular(db, desde, hasta), [db, desde, hasta])
  const b = useMemo(() => calcular(db, sumarDias(desde, -dias), sumarDias(desde, -1)), [db, desde, dias])

  // Ocupación: minutos reservados / minutos de agenda abierta
  let abiertos = 0
  for (let f = desde; f <= hasta; f = sumarDias(f, 1)) for (const [x, y] of db.negocio.horarios[desdeISO(f).getDay()] || []) abiertos += aMin(y) - aMin(x)
  const reservados = a.ts.filter((t) => t.estado !== 'cancelado').reduce((s, t) => s + t.duracion, 0)

  // Serie de ingresos (agrupa por semana si el período es largo)
  const paso = dias > 30 ? 7 : 1
  const serie: { f: string; v: number }[] = []
  for (let f = desde; f <= hasta; f = sumarDias(f, paso)) {
    const fin = sumarDias(f, paso - 1)
    serie.push({ f, v: a.ms.filter((m) => m.tipo === 'ingreso' && m.fecha >= f && m.fecha <= fin).reduce((s, m) => s + m.monto, 0) })
  }
  const max = Math.max(1, ...serie.map((x) => x.v))

  const porServ = db.servicios.map((s) => {
    const xs = a.atendidos.filter((t) => t.servicioId === s.id)
    return { n: s.nombre, c: xs.length, $: xs.reduce((k, t) => k + (t.pago?.monto || 0), 0) }
  }).sort((x, y) => y.$ - x.$)
  const maxServ = Math.max(1, ...porServ.map((x) => x.$))

  const porMetodo = (Object.keys(METODOS) as Metodo[]).map((k): [Metodo, number] => [k, a.ms.filter((m) => m.tipo === 'ingreso' && m.metodo === k).reduce((s, m) => s + m.monto, 0)])

  // Mapa de calor día x hora
  const horas = Array.from({ length: 12 }, (_, i) => 9 + i)
  const calor: Record<string, number> = {}
  a.ts.filter((t) => t.estado !== 'cancelado').forEach((t) => { const k = desdeISO(t.fecha).getDay() + '-' + Math.floor(aMin(t.hora) / 60); calor[k] = (calor[k] || 0) + 1 })
  const maxCalor = Math.max(1, ...Object.values(calor))

  // Clientes nuevos vs recurrentes
  const primera: Record<string, string> = {}
  db.turnos.filter((t) => t.estado === 'atendido').sort((x, y) => x.fecha.localeCompare(y.fecha)).forEach((t) => { primera[t.clienteId] ??= t.fecha })
  const enPeriodo = [...new Set(a.atendidos.map((t) => t.clienteId))]
  const nuevos = enPeriodo.filter((id) => (primera[id] ?? "") >= desde).length
  const top = enPeriodo.map((id) => ({ c: clienteDe(db, { clienteId: id }), n: a.atendidos.filter((t) => t.clienteId === id).length, $: a.atendidos.filter((t) => t.clienteId === id).reduce((s, t) => s + (t.pago?.monto || 0), 0) })).sort((x, y) => y.$ - x.$).slice(0, 5)
  const web = a.ts.filter((t) => t.origen === 'web').length

  const d = delta(a.ingresos, b.ingresos)

  return (
    <div className="vista">
      <div className="v-cab">
        <h1 className="v-tit">Números</h1>
        <div className="seg chico">{[7, 30, 90].map((n) => <button key={n} className={dias === n ? 'sel' : ''} onClick={() => setDias(n)}>{n} días</button>)}</div>
      </div>

      <div className="kpis">
        <Kpi titulo="Ingresos" valor={plata(a.ingresos)} sub={d === null ? '' : `${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}% vs período anterior`} tono="acento" />
        <Kpi titulo="Ganancia" valor={plata(a.ingresos - a.egresos)} sub={`Gastos ${plata(a.egresos)}`} />
        <Kpi titulo={`${cap(pl(v.atencion))} atendid${fem(v.atencion) ? 'as' : 'os'}`} valor={a.atendidos.length} sub={`Ticket promedio ${plata(a.ticket)}`} />
        <Kpi titulo="Ocupación" valor={pct(reservados, abiertos) + '%'} sub="de tus horas abiertas" />
        <Kpi titulo="No vinieron" valor={pct(a.ausentes, a.ausentes + a.atendidos.length) + '%'} sub={`${a.ausentes} ausencias`} />
        <Kpi titulo={`${cap(v.personas)} nuevos`} valor={nuevos} sub={`de ${enPeriodo.length} atendidos`} />
      </div>

      <section className="card grafico">
        <h2 className="s-tit">Ingresos por {paso === 7 ? 'semana' : 'día'}</h2>
        <div className="barras" role="img" aria-label="Gráfico de ingresos">
          {serie.map((x) => (
            <div key={x.f} className="bar-col" title={`${x.f}: ${plata(x.v)}`}>
              <i style={{ height: (x.v / max) * 100 + '%' }} />
              <small>{desdeISO(x.f).getDate()}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="dos-col">
        <section className="card">
          <h2 className="s-tit">Qué más se vende</h2>
          {porServ.map((s) => (
            <div key={s.n} className="metodo"><span>{s.n} <small className="muted">×{s.c}</small></span><div className="barra"><i style={{ width: (s.$ / maxServ) * 100 + '%' }} /></div><b>{plata(s.$)}</b></div>
          ))}
          <h2 className="s-tit">Cómo te pagan</h2>
          <div className="apilada">{porMetodo.map(([k, n], i) => n > 0 && <i key={k} className={'m' + i} style={{ flex: n }} title={METODOS[k]} />)}</div>
          <div className="leyenda">{porMetodo.map(([k, n], i) => <span key={k}><i className={'m' + i} />{METODOS[k]} {pct(n, a.ingresos)}%</span>)}</div>
          <p className="small muted">{pct(web, a.ts.length)}% de {fem(v.atencion) ? 'las' : 'los'} {pl(v.atencion)} se reservaron sol{fem(v.atencion) ? 'as' : 'os'} desde tu link.</p>
        </section>

        <section className="card">
          <h2 className="s-tit">Horarios más pedidos</h2>
          <div className="calor" style={{ gridTemplateColumns: `2.2rem repeat(${horas.length}, 1fr)` }}>
            <span />{horas.map((h) => <small key={h}>{h}</small>)}
            {[1, 2, 3, 4, 5, 6].map((dw) => (
              <Fragment key={dw}>
                <small>{DIAS_C[dw]}</small>
                {horas.map((h) => { const n = calor[dw + '-' + h] || 0; return <i key={dw + '-' + h} title={`${DIAS_C[dw]} ${h}h: ${n}`} style={{ opacity: n ? 0.15 + (n / maxCalor) * 0.85 : 0.06 }} /> })}
              </Fragment>
            ))}
          </div>
          <h2 className="s-tit">Mejores {v.personas}</h2>
          {top.map((x, i) => (
            <div key={x.c.id} className="fila-turno"><span className="rank">{i + 1}</span><div className="ft-info"><b>{x.c.nombre}</b><small>{x.n} visitas</small></div><b>{plata(x.$)}</b></div>
          ))}
        </section>
      </div>
    </div>
  )
}
