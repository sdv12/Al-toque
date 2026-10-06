# Cambios

Versionado semántico: PATCH = arreglos y ajustes; MINOR = funcionalidad nueva visible;
MAJOR = cambios que rompen algo existente (formato de configs, flujo, backend).
La versión se muestra en el footer de la home y en el configurador.

## 1.3.0 · 2026-10-06
- Nueva opción **A tu medida**: hoja en blanco (solo encabezado y pie) que se arma sumando bloques desde el configurador; los bloques toman el estilo elegido y se reordenan.
- Componentes **con sistema** (agenda real, calendario, consultas guardadas, seña online) marcados con advertencia de costo; en la beta confirman por WhatsApp.
- **Calculadora de precio** en el configurador (total siempre visible, detalle y funciones extra) y el estimado viaja en el mensaje de WhatsApp.
- Home: secciones **Precios** y **Reseñas** (de muestra, con aclaración visible); nuevo pie "Producto cordobés. Hecho por sdv12 y jrd9 - 2026".
- Estilo (Jime): color de fondo propio y tamaño de texto en el configurador; Instagram en Consultorio.
- Seguridad: las fotos externas ya no pasan por el optimizador de imágenes (dejó de ser un proxy abierto).
- No se puede publicar con el WhatsApp de relleno de la hoja en blanco.

## 1.2.2 · 2026-09-30
- Arreglo: en el footer, "al toque" se veía cortado a la mitad sobre el fondo oscuro.

## 1.2.1 · 2026-09-30
- La versión en producción se muestra en el footer de la home y en el configurador.

## 1.2.0 · 2026-09-30
- `pnpm publicar`: publica la página de un cliente desde el mensaje de WhatsApp (valida, guarda, commitea, sube y despliega).
- Imagen de vista previa por landing al compartir el link (tipografía y colores de su plantilla).
- WhatsApp del dueño activo: envío de configuraciones desde el configurador y "Escribime" en la home.
- README.

## 1.1.0 · 2026-09-28
- Home pública rediseñada: "Landing al toque", con capturas reales de las cuatro plantillas.
- "Usar esta plantilla" abre el configurador con esa plantilla sin pisar un borrador.

## 1.0.0 · 2026-09-28
- Primera versión pública: cuatro plantillas (barbería, consultorio, casas de campo, portfolio), configurador con vista previa en vivo y landings en `/l/<slug>`.
