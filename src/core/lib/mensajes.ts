import type { Negocio } from "../schema/comun";
import type { Profesional, Servicio } from "../schema/contenido";
import { enCordoba, etiquetaDia, fechaISO, horaDe } from "./fechas";

const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function formatearPesos(monto: number): string {
  return `$${numero.format(monto)}`;
}

export function formatearPrecio(servicio: Pick<Servicio, "precio" | "precioDesde">): string {
  if (servicio.precio === null) return "A consultar";
  if (servicio.precio === 0) return "Sin cargo";
  const monto = formatearPesos(servicio.precio);
  return servicio.precioDesde ? `desde ${monto}` : monto;
}

export function formatearDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function linkWhatsApp(numeroDestino: string, texto?: string): string {
  const base = `https://wa.me/${numeroDestino}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

/** "martes 30 de septiembre a las 17:15" */
export function fechaHoraLegible(instanteIso: string): string {
  return `${etiquetaDia(fechaISO(enCordoba(instanteIso))).larga} a las ${horaDe(instanteIso)}`;
}

export function mensajeTurno(datos: {
  negocio: Pick<Negocio, "nombre">;
  servicio: Servicio;
  profesional?: Pick<Profesional, "nombre">;
  inicio: string;
  cliente: { nombre: string };
  nota?: string;
  /** Líneas adicionales (ej.: "Cobertura: OSDE"). */
  extras?: string[];
}): string {
  const lineas = [
    `Hola ${datos.negocio.nombre}! Quiero reservar un turno:`,
    ``,
    `• ${datos.servicio.nombre} (${formatearPrecio(datos.servicio)}, ${formatearDuracion(datos.servicio.duracionMin)})`,
  ];
  if (datos.profesional) lineas.push(`• Con ${datos.profesional.nombre}`);
  lineas.push(`• ${capitalizar(fechaHoraLegible(datos.inicio))}`);
  for (const extra of datos.extras ?? []) lineas.push(`• ${extra}`);
  lineas.push(`• A nombre de ${datos.cliente.nombre.trim()}`);
  if (datos.nota?.trim()) lineas.push(``, `Nota: ${datos.nota.trim()}`);
  lineas.push(``, `¿Me lo confirman? Gracias.`);
  return lineas.join("\n");
}

/** Mensaje del formulario corto de contacto (pedido de presupuesto o consulta). */
export function mensajeContacto(datos: {
  negocio: Pick<Negocio, "nombre">;
  nombre: string;
  tema?: string;
  mensaje: string;
  zona?: string;
}): string {
  const lineas = [`Hola ${datos.negocio.nombre}! Soy ${datos.nombre.trim()}.`];
  if (datos.tema?.trim()) lineas.push(`Te escribo por: ${datos.tema.trim()}.`);
  lineas.push(``, datos.mensaje.trim());
  if (datos.zona?.trim()) lineas.push(``, `Zona: ${datos.zona.trim()}`);
  return lineas.join("\n");
}

/** "del jueves 15 al domingo 18 de octubre" (o con ambos meses si cambian). */
export function rangoLegible(desde: string, hasta: string): string {
  const a = etiquetaDia(desde);
  const b = etiquetaDia(hasta);
  const mismoMes = desde.slice(0, 7) === hasta.slice(0, 7);
  const inicio = mismoMes ? a.larga.replace(/ de .+$/, "") : a.larga;
  return `del ${inicio} al ${b.larga}`;
}

export function mensajeConsulta(datos: {
  negocio: Pick<Negocio, "nombre">;
  propiedad: { nombre: string; reglas: { senaPorcentaje: number } };
  desde: string;
  hasta: string;
  noches: number;
  huespedes: number;
  estimado: { total: number; sena: number } | null;
  cliente: { nombre: string };
  nota?: string;
}): string {
  const lineas = [
    `Hola ${datos.negocio.nombre}! Quería consultar disponibilidad:`,
    ``,
    `• ${datos.propiedad.nombre}`,
    `• ${capitalizar(rangoLegible(datos.desde, datos.hasta))} (${datos.noches} ${datos.noches === 1 ? "noche" : "noches"})`,
    `• ${datos.huespedes} ${datos.huespedes === 1 ? "huésped" : "huéspedes"}`,
  ];
  if (datos.estimado) {
    lineas.push(
      `• Estimado web: ${formatearPesos(datos.estimado.total)} (seña ${datos.propiedad.reglas.senaPorcentaje} %: ${formatearPesos(datos.estimado.sena)})`,
    );
  }
  if (datos.cliente.nombre.trim()) lineas.push(`• A nombre de ${datos.cliente.nombre.trim()}`);
  if (datos.nota?.trim()) lineas.push(``, `Nota: ${datos.nota.trim()}`);
  lineas.push(``, `¿Está libre? Gracias.`);
  return lineas.join("\n");
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
