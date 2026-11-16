"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { PROFESIONES, type IdProfesion } from './profesiones'
import { hoyISO, sumarDias, desdeISO, aHora, aMin } from './fechas'
import type { Cliente, Db, EstadoTurno, Metodo, Movimiento, Negocio, Servicio, Turno } from './tipos'

// Clave propia del kit (la app original usaba 'agenda-rapida:v1'): no se pisa con la demo vieja.
const CLAVE = 'altoque:agenda-demo'
const uid = () => Math.random().toString(36).slice(2, 10)

const NOMBRES = ['Lucía Ferreyra', 'Martín Ledesma', 'Sofía Bustos', 'Joaquín Paz', 'Valentina Ríos', 'Tomás Agüero', 'Camila Oviedo', 'Facundo Vera', 'Julieta Moyano', 'Nicolás Brizuela', 'Agustina Peralta', 'Mateo Godoy', 'Florencia Luna', 'Santiago Cáceres', 'Micaela Sosa', 'Bruno Quiroga', 'Rocío Herrera', 'Gonzalo Pereyra', 'Abril Correa', 'Lautaro Funes', 'Milagros Díaz', 'Franco Romero', 'Paula Molina', 'Ignacio Toledo', 'Carla Arias', 'Emilia Navarro']
const METODOS: Metodo[] = ['efectivo', 'transferencia', 'mercadopago', 'tarjeta']

function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647) }

// base (opcional): { negocio, servicios } del usuario → se generan datos de ejemplo con SUS servicios y horarios.
export interface Base { negocio?: Partial<Negocio>; servicios?: Servicio[] }

export function semilla(profesion: IdProfesion = 'peluqueria', base: Base | null = null): Db {
  const r = rng(42)
  const p = PROFESIONES[profesion]
  const servicios: Servicio[] = base?.servicios?.length ? base.servicios : p.servicios.map(([nombre, duracion, precio], i) => ({ id: 's' + i, nombre, duracion, precio, activo: true }))
  const clientes: Cliente[] = NOMBRES.map((nombre, i) => ({ id: 'c' + i, nombre, tel: '351' + String(5000000 + Math.floor(r() * 4999999)), notas: i % 5 === 0 ? 'Prefiere horario de mañana.' : '' }))
  const negocio: Negocio = {
    nombre: p.demo, profesion, diseno: 'base', descripcion: 'Atención con turno previo. Elegí el servicio y el horario que te quede cómodo.',
    direccion: 'Bv. San Juan 450, Córdoba', whatsapp: '5493510000000', intervalo: 15, anticipacion: 60, sena: 0,
    horarios: { 0: [], 1: [['09:00', '13:00'], ['15:00', '20:00']], 2: [['09:00', '13:00'], ['15:00', '20:00']], 3: [['09:00', '13:00'], ['15:00', '20:00']], 4: [['09:00', '13:00'], ['15:00', '20:00']], 5: [['09:00', '13:00'], ['15:00', '20:00']], 6: [['09:00', '14:00']] },
    pin: '1234',
    ...(base?.negocio || {}),
  }
  const turnos: Turno[] = [], movimientos: Movimiento[] = [], cierres: Db['cierres'] = []
  const hoy = hoyISO()
  for (let d = -75; d <= 10; d++) {
    const fecha = sumarDias(hoy, d)
    const franjas = negocio.horarios[desdeISO(fecha).getDay()] || []
    if (!franjas.length) continue
    const cuantos = d > 0 ? Math.floor(r() * 4) + 1 : Math.floor(r() * 6) + 3
    const usados: [number, number][] = []
    for (let k = 0; k < cuantos; k++) {
      const [ini, fin] = franjas[Math.floor(r() * franjas.length)]!
      const activos = servicios.filter((x) => x.activo)
      if (!activos.length) break
      const s = activos[Math.floor(r() * activos.length)]!
      const slots = (aMin(fin) - aMin(ini) - s.duracion) / 15
      if (slots < 0) continue
      const m = aMin(ini) + Math.floor(r() * slots) * 15
      if (usados.some(([a, b]) => m < b && m + s.duracion > a)) continue
      usados.push([m, m + s.duracion])
      const pool = Math.min(clientes.length, 12 + Math.floor((d + 75) / 6))
      const c = clientes[Math.floor(Math.pow(r(), 1.6) * pool)]!
      const x = r()
      let estado: EstadoTurno = d > 0 ? (x < 0.6 ? 'confirmado' : 'pendiente') : x < 0.84 ? 'atendido' : x < 0.92 ? 'ausente' : 'cancelado'
      if (d === 0) estado = m < 13 * 60 ? 'atendido' : 'confirmado'
      const t: Turno = { id: uid(), servicioId: s.id, fecha, hora: aHora(m), duracion: s.duracion, precio: s.precio, clienteId: c.id, estado, origen: r() < 0.8 ? 'web' : 'manual', creado: fecha, pago: null, notas: '' }
      if (estado === 'atendido' && s.precio) {
        const metodo = METODOS[Math.floor(Math.pow(r(), 1.3) * 4)]!
        t.pago = { monto: s.precio, metodo }
        movimientos.push({ id: uid(), fecha, hora: aHora(m + s.duracion), tipo: 'ingreso', monto: s.precio, metodo, concepto: s.nombre + ' · ' + c.nombre, turnoId: t.id })
      }
      turnos.push(t)
    }
    if (d < 0 && desdeISO(fecha).getDay() === 1) movimientos.push({ id: uid(), fecha, hora: '10:00', tipo: 'egreso', monto: 18000 + Math.floor(r() * 9) * 1000, metodo: 'efectivo', concepto: 'Insumos' })
    if (d < 0 && desdeISO(fecha).getDate() === 5) movimientos.push({ id: uid(), fecha, hora: '09:00', tipo: 'egreso', monto: 180000, metodo: 'transferencia', concepto: 'Alquiler del local' })
    if (d < 0) {
      const esperado = movimientos.filter((m) => m.fecha === fecha && m.metodo === 'efectivo').reduce((a, m) => a + (m.tipo === 'ingreso' ? m.monto : -m.monto), 0)
      const dif = r() < 0.85 ? 0 : (r() < 0.5 ? -1 : 1) * 500
      cierres.push({ id: uid(), fecha, esperado, contado: esperado + dif, diferencia: dif, nota: '' })
    }
  }
  const espera = [{ id: uid(), nombre: 'Carla Arias', tel: '3515550101', servicioId: servicios[0]?.id, preferencia: 'Cualquier día a la tarde', creado: hoy }]
  return { negocio, servicios, clientes, turnos, movimientos, cierres, bloqueos: [], espera }
}

type Acciones = ReturnType<typeof crearAcciones>
export type Store = { db: Db } & Acciones
const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(() => {
    try { const s = localStorage.getItem(CLAVE); if (s) return JSON.parse(s) as Db } catch {}
    return semilla()
  })
  useEffect(() => { try { localStorage.setItem(CLAVE, JSON.stringify(db)) } catch {} }, [db])
  // Sincroniza entre pestañas e iframes (la vista previa del asistente se actualiza en vivo)
  useEffect(() => {
    const fn = (e: StorageEvent) => { if (e.key === CLAVE && e.newValue) try { setDb(JSON.parse(e.newValue) as Db) } catch {} }
    window.addEventListener('storage', fn)
    return () => window.removeEventListener('storage', fn)
  }, [])
  const set = useCallback((fn: (d: Db) => Partial<Db>) => setDb((d) => ({ ...d, ...fn(d) })), [])
  const acciones = crearAcciones(set, setDb)
  return <Ctx.Provider value={{ db, ...acciones }}>{children}</Ctx.Provider>
}

function crearAcciones(set: (fn: (d: Db) => Partial<Db>) => void, setDb: (fn: (d: Db) => Db) => void) {
  return {
    set,
    negocio: (patch: Partial<Negocio>) => set((d) => ({ negocio: { ...d.negocio, ...patch } })),
    reservar({ servicioId, fecha, hora, nombre, tel, notas = '', origen = 'web', estado = 'pendiente' }: { servicioId: string; fecha: string; hora: string; nombre: string; tel: string; notas?: string; origen?: Turno['origen']; estado?: EstadoTurno }): Turno {
      const t = { id: uid(), servicioId, fecha, hora, estado, origen, creado: hoyISO(), pago: null, notas } as Turno
      set((d) => {
        const s = d.servicios.find((x) => x.id === servicioId)!
        const telN = String(tel).replace(/\D/g, '')
        let c = d.clientes.find((x) => x.tel.replace(/\D/g, '') === telN && telN)
        const clientes = c ? d.clientes : [...d.clientes, (c = { id: uid(), nombre, tel: telN, notas: '' })]
        Object.assign(t, { duracion: s.duracion, precio: s.precio, clienteId: c.id })
        return { clientes, turnos: [...d.turnos, t] }
      })
      return t
    },
    turno: (id: string, patch: Partial<Turno>) => set((d) => ({ turnos: d.turnos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    cobrar(turnoId: string, monto: number, metodo: Metodo) {
      set((d) => {
        const t = d.turnos.find((x) => x.id === turnoId)
        const s = d.servicios.find((x) => x.id === t?.servicioId)
        const c = d.clientes.find((x) => x.id === t?.clienteId)
        const ahora = new Date()
        return {
          turnos: d.turnos.map((x): Turno => (x.id === turnoId ? { ...x, estado: 'atendido', pago: { monto, metodo } } : x)),
          movimientos: [...d.movimientos, { id: uid(), fecha: hoyISO(), hora: aHora(ahora.getHours() * 60 + ahora.getMinutes()), tipo: 'ingreso', monto, metodo, concepto: (s?.nombre || 'Servicio') + ' · ' + (c?.nombre || ''), turnoId }],
        }
      })
    },
    movimiento(m: Omit<Movimiento, 'id' | 'fecha' | 'hora'> & Partial<Pick<Movimiento, 'fecha' | 'hora'>>) {
      const ahora = new Date()
      set((d) => ({ movimientos: [...d.movimientos, { id: uid(), fecha: hoyISO(), hora: aHora(ahora.getHours() * 60 + ahora.getMinutes()), ...m }] }))
    },
    borrarMovimiento: (id: string) => set((d) => ({ movimientos: d.movimientos.filter((m) => m.id !== id) })),
    cerrarCaja: (c: Omit<Db['cierres'][number], 'id'>) => set((d) => ({ cierres: [...d.cierres.filter((x) => x.fecha !== c.fecha), { id: uid(), ...c }] })),
    /** Edita un servicio existente (por id) o crea uno nuevo con lo que venga. */
    servicio(s: Partial<Servicio>) {
      set((d) => ({ servicios: s.id && d.servicios.some((x) => x.id === s.id) ? d.servicios.map((x) => (x.id === s.id ? { ...x, ...s } : x)) : [...d.servicios, { activo: true, nombre: '', duracion: 30, precio: 0, ...s, id: uid() }] }))
    },
    cliente: (id: string, patch: Partial<Cliente>) => set((d) => ({ clientes: d.clientes.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    bloquear: (b: Omit<Db['bloqueos'][number], 'id'>) => set((d) => ({ bloqueos: [...d.bloqueos, { id: uid(), ...b }] })),
    desbloquear: (id: string) => set((d) => ({ bloqueos: d.bloqueos.filter((b) => b.id !== id) })),
    esperar: (e: Omit<Db['espera'][number], 'id' | 'creado'>) => set((d) => ({ espera: [...d.espera, { id: uid(), creado: hoyISO(), ...e }] })),
    quitarEspera: (id: string) => set((d) => ({ espera: d.espera.filter((e) => e.id !== id) })),
    reiniciar: (profesion: IdProfesion) => setDb((d) => { const s = semilla(profesion); return { ...s, negocio: { ...s.negocio, diseno: d.negocio.diseno } } }),
    regenerar: () => setDb((d) => semilla(d.negocio.profesion, { negocio: d.negocio, servicios: d.servicios })),
    cargar: (base: Base) => setDb(() => semilla(base.negocio?.profesion ?? 'peluqueria', base)),
    cargarServiciosRubro: (profesion: IdProfesion) => set((d) => ({ servicios: [...d.servicios.map((s) => ({ ...s, activo: false })), ...PROFESIONES[profesion].servicios.map(([nombre, duracion, precio]) => ({ id: uid(), nombre, duracion, precio, activo: true }))] })),
  }
}

export const useStore = (): Store => {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore va dentro de StoreProvider')
  return s
}

// Helpers de lectura
export const servicioDe = (db: Db, t: Turno): Pick<Servicio, 'nombre' | 'duracion' | 'precio'> & Partial<Servicio> => db.servicios.find((s) => s.id === t.servicioId) || { nombre: '—', duracion: t.duracion, precio: t.precio }
export const clienteDe = (db: Db, t: Pick<Turno, 'clienteId'>): Pick<Cliente, 'nombre' | 'tel'> & Partial<Cliente> => db.clientes.find((c) => c.id === t.clienteId) || { nombre: '—', tel: '' }
export const waLink = (tel: string, texto: string) => `https://wa.me/${String(tel).replace(/\D/g, '').replace(/^(?!54)/, '549')}?text=${encodeURIComponent(texto)}`
