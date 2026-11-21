import Link from 'next/link'
import { useStore } from './lib/store'
import { Pie } from './reserva/comun'

/**
 * Condiciones para quien reserva un turno en la página de un negocio. El negocio es el responsable
 * de la atención y de los datos de sus clientes; la plataforma los procesa por su cuenta.
 */
export default function Terminos() {
  const { db } = useStore()
  const n = db.negocio.nombre
  return (
    <div className="terminos">
      <a href="#/">← Volver</a>
      <h1>Términos del turno</h1>
      <p>Al reservar un turno en {n} aceptás estas condiciones.</p>
      <h2>Tu reserva</h2>
      <p>La reserva queda a nombre de quien la hace. {n} puede confirmarla o reprogramarla por WhatsApp. Si no podés asistir, avisá con anticipación para liberar el horario: las ausencias sin aviso pueden limitar futuras reservas online.</p>
      <h2>Precios y servicios</h2>
      <p>Los precios y las duraciones publicados son orientativos y los fija {n}; pueden variar según el servicio que finalmente se realice. Las condiciones de pago, seña y cancelación las informa {n}.</p>
      <h2>Tus datos</h2>
      <p>Tu nombre, tu WhatsApp y lo que escribas se usan solo para gestionar tu turno y mandarte recordatorios. El responsable de esos datos es {n}; la plataforma de turnos los procesa por su cuenta. Podés pedirle a {n} que los corrija o los borre. Más información en la <Link href="/privacidad">Política de privacidad</Link> de la plataforma.</p>
      <p className="small muted">La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</p>
      <h2>Demostración</h2>
      <p>Si estás en la demo de turnos, el negocio y los datos son de ejemplo y lo que cargues se guarda solo en tu navegador.</p>
      <Pie />
    </div>
  )
}
