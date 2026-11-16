// Contacto para el botón "Lo quiero" del asistente. Si queda vacío, el botón no se muestra.
// Formato: 549 + característica sin 0 + número sin 15 (ej. 5493511234567).
export const WHATSAPP_VENTAS: string = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? ""
