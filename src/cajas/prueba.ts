import { cajaPorDefecto, validarCaja, type CajaConfig } from "./config";
import { RUBROS, RUBROS_CAJA, type RubroCaja } from "./rubros";

/** Dónde deja el configurador de /caja la configuración que muestra /c/prueba (mismo navegador). */
export const CLAVE_PRUEBA = "altoque:caja-prueba";

/**
 * Lo guardado por el configurador, listo para la prueba (siempre en modo demo). Si algo no valida
 * (ej. el nombre a medio escribir) se completa con lo del rubro en vez de cambiar de caja: la vista
 * previa no tiene que saltar a otro rubro mientras alguien tipea.
 */
export function configDePrueba(texto: string | null): CajaConfig {
  let valor: unknown = null;
  try {
    valor = texto ? JSON.parse(texto) : null;
  } catch {}
  if (!valor || typeof valor !== "object") return { ...cajaPorDefecto(), demo: true };
  const r = validarCaja(valor);
  if (r.ok) return { ...r.config, demo: true };

  const v = (valor ?? {}) as Partial<CajaConfig>;
  const rubro: RubroCaja = RUBROS_CAJA.includes(v.rubro as RubroCaja) ? (v.rubro as RubroCaja) : "verduleria";
  const base = cajaPorDefecto(rubro);
  const reparada = validarCaja({
    ...base,
    color: v.color ?? base.color,
    negocio: { nombre: v.negocio?.nombre?.trim() && v.negocio.nombre.trim().length >= 2 ? v.negocio.nombre.slice(0, 40) : "Tu negocio" },
    modulos: { fiado: v.modulos?.fiado ?? true, cajones: !!v.modulos?.cajones && RUBROS[rubro].cajones },
  });
  return { ...(reparada.ok ? reparada.config : base), demo: true };
}
