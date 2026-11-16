// Presets por rubro: vocabulario, nombre de demo, pregunta extra al reservar y servicios de arranque.
// Cambiar de rubro en Ajustes no borra nada: cambia textos (y ofrece cargar los servicios del rubro).
export interface Profesion {
  nombre: string;
  grupo: string;
  /** Nombre del negocio de la demo. */
  demo: string;
  persona: string;
  personas: string;
  /** Cómo se llama lo que se reserva: turno, sesión, consulta, clase, reunión. */
  atencion: string;
  /** Pregunta extra al reservar. */
  nota: string;
  /** [nombre, minutos, precio]. */
  servicios: [string, number, number][];
}
const P = (nombre: string, grupo: string, demo: string, persona: string, personas: string, atencion: string, nota: string, servicios: [string, number, number][]): Profesion =>
  ({ nombre, grupo, demo, persona, personas, atencion, nota, servicios })

export const PROFESIONES = {
  // Salud
  psicologia: P('Psicología / Terapia', 'Salud', 'Lic. Demo · Psicóloga', 'paciente', 'pacientes', 'sesión', 'Motivo de consulta (opcional)',
    [['Sesión individual', 50, 25000], ['Primera entrevista', 60, 25000], ['Sesión de pareja', 75, 35000], ['Sesión online', 50, 22000]]),
  nutricion: P('Nutrición', 'Salud', 'Nutrición Demo', 'paciente', 'pacientes', 'consulta', 'Objetivo (bajar de peso, deporte…)',
    [['Primera consulta', 60, 30000], ['Control', 30, 18000], ['Plan deportivo', 45, 26000]]),
  kinesiologia: P('Kinesiología / Fisio', 'Salud', 'Kinesio Demo', 'paciente', 'pacientes', 'sesión', 'Zona o lesión a tratar',
    [['Sesión de rehabilitación', 45, 20000], ['Evaluación', 60, 24000], ['Drenaje linfático', 50, 22000]]),
  odontologia: P('Odontología', 'Salud', 'Consultorio Odontológico Demo', 'paciente', 'pacientes', 'turno', 'Obra social y motivo',
    [['Consulta y diagnóstico', 30, 25000], ['Limpieza', 45, 35000], ['Arreglo', 60, 48000], ['Urgencia', 30, 30000]]),
  consultorio: P('Consultorio médico', 'Salud', 'Consultorio Demo', 'paciente', 'pacientes', 'consulta', 'Obra social y motivo',
    [['Consulta', 20, 28000], ['Control', 15, 20000], ['Certificado', 10, 12000]]),
  podologia: P('Podología', 'Salud', 'Podología Demo', 'paciente', 'pacientes', 'turno', '¿Algo que debamos saber? (diabetes, etc.)',
    [['Podología completa', 45, 18000], ['Uña encarnada', 30, 15000], ['Control', 20, 10000]]),
  // Belleza y bienestar
  peluqueria: P('Peluquería / Barbería', 'Belleza', 'Barbería Demo', 'cliente', 'clientes', 'turno', 'Comentario (opcional)',
    [['Corte', 30, 9000], ['Corte + barba', 45, 12000], ['Color', 90, 28000], ['Peinado', 40, 10000]]),
  unas: P('Uñas / Estética', 'Belleza', 'Nails Demo', 'clienta', 'clientas', 'turno', '¿Tenés algo puesto para retirar?',
    [['Esmaltado semi', 60, 14000], ['Kapping', 90, 20000], ['Esculpidas', 120, 28000], ['Retiro', 30, 6000]]),
  depilacion: P('Depilación / Cosmetología', 'Belleza', 'Estética Demo', 'clienta', 'clientas', 'turno', 'Zonas (opcional)',
    [['Depilación láser zona chica', 20, 12000], ['Cuerpo completo', 60, 40000], ['Limpieza facial', 60, 22000]]),
  masajes: P('Masajes / Spa', 'Belleza', 'Spa Demo', 'cliente', 'clientes', 'sesión', '¿Alguna molestia o zona a evitar?',
    [['Descontracturante', 60, 26000], ['Relajante', 60, 24000], ['Piedras calientes', 75, 32000]]),
  tatuajes: P('Tatuajes / Piercing', 'Belleza', 'Tattoo Demo', 'cliente', 'clientes', 'sesión', 'Idea del diseño (tamaño y zona)',
    [['Consulta de diseño', 30, 0], ['Tattoo chico', 60, 45000], ['Media sesión', 180, 110000], ['Piercing', 30, 18000]]),
  // Clases y deporte
  clases: P('Clases particulares', 'Clases', 'Profe Demo', 'alumno', 'alumnos', 'clase', 'Materia y nivel',
    [['Clase individual', 60, 15000], ['Clase doble', 120, 27000], ['Clase de prueba', 30, 0]]),
  entrenamiento: P('Entrenamiento personal', 'Clases', 'Entrenador Demo', 'alumno', 'alumnos', 'clase', 'Objetivo o lesiones',
    [['Entrenamiento 1 a 1', 60, 16000], ['Evaluación física', 45, 12000], ['Dupla', 60, 24000]]),
  musica: P('Clases de música', 'Clases', 'Escuela de Música Demo', 'alumno', 'alumnos', 'clase', 'Instrumento y nivel',
    [['Clase de guitarra', 60, 14000], ['Clase de canto', 45, 13000], ['Clase de prueba', 30, 0]]),
  // Servicios y oficios
  veterinaria: P('Veterinaria / Peluquería canina', 'Servicios', 'Veterinaria Demo', 'cliente', 'clientes', 'turno', 'Nombre, especie y raza de la mascota',
    [['Consulta', 30, 18000], ['Vacunación', 15, 15000], ['Baño y corte', 90, 22000], ['Castración (evaluación)', 30, 16000]]),
  lavadero: P('Lavadero / Detailing de autos', 'Servicios', 'Lavadero Demo', 'cliente', 'clientes', 'turno', 'Modelo y patente del auto',
    [['Lavado exterior', 30, 12000], ['Lavado completo', 60, 22000], ['Tapizados', 180, 60000], ['Pulido', 240, 95000]]),
  taller: P('Taller mecánico / Service', 'Servicios', 'Taller Demo', 'cliente', 'clientes', 'turno', 'Modelo, patente y qué le pasa',
    [['Service completo', 120, 85000], ['Cambio de aceite', 45, 40000], ['Diagnóstico', 60, 25000], ['Alineación y balanceo', 60, 35000]]),
  asesoria: P('Contador / Abogado / Asesor', 'Servicios', 'Estudio Demo', 'cliente', 'clientes', 'reunión', 'Tema a tratar',
    [['Consulta inicial', 30, 20000], ['Reunión de seguimiento', 45, 25000], ['Consulta online', 30, 18000]]),
  fotografia: P('Fotografía / Estudio', 'Servicios', 'Estudio de Fotos Demo', 'cliente', 'clientes', 'sesión', 'Tipo de sesión y cantidad de personas',
    [['Sesión retrato', 60, 45000], ['Fotos carnet / DNI', 15, 6000], ['Sesión familiar', 90, 70000]]),
} satisfies Record<string, Profesion>;

export type IdProfesion = keyof typeof PROFESIONES;
export const ID_PROFESIONES = Object.keys(PROFESIONES) as IdProfesion[];
export const voc = (negocio: { profesion: string }): Profesion => PROFESIONES[negocio.profesion as IdProfesion] || PROFESIONES.peluqueria;
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// Para elegir agrupado en <select>
export const GRUPOS = Object.entries(PROFESIONES).reduce<Record<string, [IdProfesion, string][]>>(
  (g, [k, p]) => ((g[p.grupo] ||= []).push([k as IdProfesion, p.nombre]), g),
  {},
);
// Plural y género de la palabra de atención (turno/sesión/consulta/clase/reunión)
export const pl = (s: string) => (s.endsWith("ión") ? s.slice(0, -3) + "iones" : s + "s");
export const fem = (s: string) => s !== "turno";
