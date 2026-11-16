import { useStore } from './lib/store'
import { Pie } from './reserva/comun'

export default function Terminos() {
  const { db } = useStore()
  return (
    <div className="terminos">
      <a href="#/">← Volver</a>
      <h1>Términos y condiciones</h1>
      <p>Al reservar un turno en {db.negocio.nombre} aceptás que tus datos (nombre y WhatsApp) se usen solo para gestionar tu reserva y enviarte recordatorios.</p>
      <p>Si no podés asistir, avisá con anticipación por WhatsApp para liberar el horario. Las ausencias sin aviso pueden limitar futuras reservas online.</p>
      <p>Los precios publicados son orientativos y pueden variar según el servicio final realizado.</p>
      <p>Esta es una versión de demostración: los datos se guardan únicamente en tu navegador.</p>
      <Pie />
    </div>
  )
}
