# Cambios

Versionado semántico: PATCH = arreglos y ajustes; MINOR = funcionalidad nueva visible;
MAJOR = cambios que rompen algo existente (formato de configs, flujo, backend).
La versión se muestra en el footer de la home y en el configurador.

## 1.17.0 · 2026-11-21
- **Niveles de Al Toque Web**: Perfil digital (nuevo: $160.000 + $15.000/mes, hasta 3 bloques en una dirección de Al Toque), Listo para usar, Personalizado, Web + Turnos y Desarrollo a medida (a presupuestar). El configurador cotiza el Perfil digital solo. En /web: guía «¿Qué necesitás de tu página?», tabla de niveles y qué incluye el mensual y qué se cobra aparte.
- **Al Toque Turnos en /turnos**: página comercial con «Dejá de coordinar a mano», agenda sola o paquete Web + Turnos (con lo que te ahorrás), adicionales y demos por rubro. La app de turnos pasa a /turnos/demo; /agenda y los links viejos (/turnos#/…, ?demo=, ?d=) redirigen solos.
- **Caja pro sin precio publicado**: es un proyecto a medida que se presupuesta según el alcance y la complejidad. /caja suma el aviso de dónde quedan los datos de la caja simple.
- **Al Toque Tienda en /tienda**: próximamente, con lista de espera (llega por Netlify Forms) para medir cuánta gente la quiere.
- **Alto, más completo**: arranca orientado a cada página (saludo, dudas y qué marcar), 13 dudas nuevas (planes, Perfil digital, paquete, caja pro, dirección de la página, soporte, capacitación, sin internet, migrar una página, logo, atrasos, límites de turnos y recordatorios), avisa el ahorro del paquete, sugiere el Perfil digital si el presupuesto es justo y deja la caja pro como «a presupuestar».
- Términos: niveles, desarrollo a medida y presupuesto de la caja pro. Privacidad: lista de espera de Tienda. Un test asegura que ninguna página escriba precios a mano.

## 1.16.0 · 2026-11-21
- **Al Toque Estudio**: nueva solución en el acordeón de la portada, para arquitectos, diseñadores, constructoras y profesionales, con su precio, la captura y la demo.
- **Estudio en `/web`**: cuarta plantilla con capturas, colores propios y los componentes que se pueden prender, apagar y ordenar (portada a pantalla completa, proyectos con ficha, servicios en índice, testimonios rotativos, preguntas y contacto sobre foto).
- «Usar esta plantilla» abre el configurador con el ejemplo Estudio (`/configurador?plantilla=estudio`); también se puede cargar desde la pestaña Plantilla. Si hay un borrador con cambios, pregunta antes de pisarlo.
- La demo pasa a **`/estudio`** (`/l/demo-arquitectos` redirige). También figura en el pie de la portada y en `/adm`.

## 1.15.0 · 2026-11-21
- **Plantilla Portfolio modular, modo Estudio**: nueva portada «Estudio» con foto a pantalla completa que rota sola (zoom lento, contador, barras de avance y pausa) y header transparente que se vuelve sólido al bajar, con menú desplegable en celular. Elegirla pasa toda la página a un tono sobrio: títulos finos, rótulos en mayúsculas, footer liviano y secciones que aparecen al scrollear.
- Variantes nuevas: Trabajos «Galería con ficha» (grilla con filtros por tipo y ficha emergente con antes/después y «Quiero algo así» por WhatsApp), Servicios «Índice desplegable» (con foto que cambia según el servicio y «Consultar» directo), Testimonios «Rotativo» y Contacto «Sobre foto». Las variantes anteriores no cambian.
- Demo de estudio de arquitectura (`/l/demo-arquitectos`) con fotos reales.
- Tipografía de la plantilla: Raleway fina para títulos y DM Sans para el texto.

## 1.14.0 · 2026-11-21
- **Ahora somos Al Toque**: soluciones digitales para negocios (páginas web, turnos y caja), no solo páginas. Cambia la marca en todo el sitio.
- **Portada nueva**: «La solución para tu negocio, al toque», con el texto y los celulares alineados en dos columnas; los rubros pasan solos en una marquesina (se frena al pasar el mouse); las soluciones son un acordeón horizontal (en compu, tarjetas una al lado de la otra que se abren y pasan solas mientras nadie las toca; en celular, una debajo de la otra); un selector de lo que necesitás (web, turnos, controlar el comercio, vender por internet), las soluciones con su precio y su demo, Al Toque Tienda como próximamente (con «Avisame cuando esté»), desarrollos a medida, proyectos, cómo funciona, lo que te aseguramos y preguntas frecuentes.
- «Encontrar mi solución» abre a Alto desde cualquier página. Las preguntas frecuentes salen de las dudas de Alto: el chat y la página dicen lo mismo.
- **Al Toque Web** (`/web`): las plantillas, el video del configurador, los precios y lo que trae cada página pasan a su propia página.
- Sin reseñas de muestra.
- Salud queda para Sala de Espera: Al Toque ya no ofrece la plantilla de consultorio ni los rubros de salud en Alto y en la agenda (lo ya armado sigue funcionando).

## 1.13.0 · 2026-11-18
- **Todo lo legal**: Términos y condiciones (contrato de adhesión, 30 cláusulas: anticipo del 50 %, saldo antes de publicar, mora y suspensión con aviso, dos rondas de ajustes, aprobación tácita, materiales, propiedad intelectual sujeta al pago, límite de responsabilidad, indemnidad, fuerza mayor), Política de privacidad (Ley 25.326, leyenda de la AAIP), Botón de arrepentimiento (Res. SCI 424/2020, sin registro y con código de solicitud), Botón de baja e Información legal. Link a Defensa del Consumidor (Res. SCI 274/2021) en el pie.
- Los datos del titular están en `legales/datos.ts`; mientras falte alguno, los documentos muestran un aviso de borrador.
- Aviso de aceptación de Términos y Privacidad al enviar un pedido (configurador, `/caja`, Alto, turnos) y links legales en las cajas y en la agenda. La agenda tiene sus propios «Términos del turno».
- **Alto responde dudas**: «Tengo una pregunta» con 15 preguntas frecuentes (precios, mensual, plazos, pagos, cambios, baja, arrepentimiento, dominio, factura, datos…) o escribiéndola con tus palabras, en cualquier momento del chat.
- **Alto, aún más fino**: 16 rubros nuevos (psicología, nutrición, odontología, veterinaria, tatuajes, gastronomía, tienda, construcción, inmobiliaria…), nuevas dificultades y funciones (catálogo, menú, pedidos, preguntas frecuentes, equipo, promos, Instagram, tienda, idiomas). Pregunta dónde atiende, su horario, su Instagram y su página actual, cuánto piensa invertir y cómo nos conoció. Comenta cada rubro, da un consejo por lo que le complica y, si el total pasa el presupuesto, propone arrancar por partes.

## 1.12.0 · 2026-11-16
- **Alto, más completo**: ahora es un robot con los colores de la marca (parpadea y su antena late) y saluda con la viñeta «¡Bienvenido/a! Soy Alto, el asistente virtual. ¿Te ayudo a armar tu página?».
- Más fácil de usar: barra de progreso, «Volver» para corregir la respuesta anterior, «Saltear» en lo opcional y «Otro» para escribir el rubro.
- Pedidos más completos: según lo que elige, pregunta dónde lo encuentran hoy, cuántas personas trabajan, cuántos servicios o productos tiene, cómo le pagan, cuántas sucursales, si tiene logo, fotos y dominio, para cuándo lo necesita, su nombre, su WhatsApp (validado) y un comentario libre. Todo eso llega en el pedido.
- La recomendación usa esos detalles: suma las sucursales extra de la caja pro, no cobra el dominio si ya tiene uno y avisa lo que se cotiza aparte (logo, fotos, carga de muchos productos). Al final muestra un resumen de lo que contó y se puede mandar por WhatsApp o pedir que le escriban.

## 1.11.0 · 2026-11-16
- **Agenda al toque** (`/agenda` y `/turnos`): el sistema de turnos de Agenda Rápida, ahora dentro del sitio. Tiene 9 diseños de reserva (Base, Ticket, Bruto, Agenda, Kiosco, Mes, Historias, Reloj y Pila; el de chat quedó afuera), 19 rubros con sus servicios y el panel del negocio: hoy, agenda, caja, números, clientes, servicios y ajustes. «Probalo con tus datos» termina en el pedido con número, como las cajas y las landings.
- **Alto, el asistente**: un chat de preguntas rápidas en la home, `/caja` y `/agenda`. Pregunta el nombre, el rubro, qué le complica, qué resolver primero, qué zona cubrir, los colores y qué le gustaría tener. Al final recomienda qué armar, con el porqué y los precios de referencia, y deja probarlo ya cargado (configurador, agenda o caja) o hablarlo por WhatsApp.
- Home: sección «Que te reserven solos» y «Turnos» en el menú y en el pie. `/adm` suma las demos de turnos y a Alto.
- **Precios nuevos**, revisados contra el mercado: Vidriera desde $250.000 + $15.000/mes; A tu medida $320.000 + $15.000/mes (bloque extra $20.000); Con sistema desde $410.000 + $75.000/mes; Agenda sola $280.000 + $60.000/mes; Caja simple $150.000 + $15.000/mes; Caja pro $520.000 + $75.000/mes. Los mensuales y los extras no cambian.
- Por dentro: la agenda está en TypeScript estricto, con su propio layout y sus hojas de estilo originales. `/caja` acepta datos en la URL (`?rubro=…&nombre=…&color=…`).

## 1.10.1 · 2026-11-15
- **Actualización de seguridad**: Next.js, React, Zod y las herramientas de desarrollo pasan a sus últimas versiones, con los arreglos de seguridad publicados. `pnpm audit` queda sin vulnerabilidades conocidas.
- Cabeceras de seguridad en todo el sitio: ninguna página nuestra se puede meter en un iframe de otro sitio, y se limitan el referer y los permisos del navegador (la cámara queda solo para las fotos de la caja). `/adm` también avisa por cabecera que no se indexa.
- El número de pedido solo se entrega a pedidos que salen de nuestras páginas.
- Las fotos de las configuraciones aceptan URLs `https` o rutas propias, ya no direcciones de otro dominio disfrazadas de ruta.

## 1.10.0 · 2026-11-15
- **Panel del equipo en `/adm`** (no está enlazado desde el sitio y no aparece en Google). Tiene dos pestañas:
- **Demos**: todo lo que se le puede mostrar a un cliente, con capturas y un consejo de qué mostrar: las 5 landings, la home, el configurador (también en modo admin), `/caja`, las 4 cajas simples, la caja pro, los proyectos reales y los accesos del equipo (pedidos en Netlify Forms, deploys y el repo).
- **Novedades**: cada versión publicada, contada en simple, con un contador rojo y la marca «Nuevo» para lo que todavía no viste en ese navegador. Sale de este mismo `CHANGELOG.md`: para sumar una novedad se escribe acá, en el PR que sube la versión.

## 1.9.1 · 2026-11-15
- **Deploy automático**: Netlify quedó conectado al repo `sdv12/Al-toque`. Cada push o merge a `master` se publica solo y cada PR tiene vista previa. La versión del footer se sube en el mismo PR.
- `pnpm publicar` ya no despliega desde la máquina (solo commit + push; lo publica Netlify). `--deploy` lo fuerza si hace falta; `--sin-deploy` queda aceptado pero ya no hace falta.

## 1.9.0 · 2026-11-15
- Aviso de **actualización trimestral de precios**: una tarjeta chica abajo a la izquierda que aparece cuando hay precios en pantalla (home y `/caja`), sin bloquear ni tomar el foco. Dice hasta cuándo valen los precios y que la próxima actualización es el 1 de enero de 2027. Una vez cerrada no vuelve hasta la siguiente actualización.
- La vigencia también queda escrita junto a los precios (nota de la sección Precios, `/caja` y la calculadora de la caja). La fecha se cambia en un solo lugar: `ACTUALIZACION_PRECIOS` en `src/core/lib/precios.ts`.

## 1.8.0 · 2026-11-15
- **Número de pedido** (`#00015`): al enviar una landing desde el configurador o pedir una caja en `/caja`, el cliente recibe un número correlativo y WhatsApp se abre con un mensaje corto (número + resumen), sin el código largo. El número sale de `/api/pedidos`, con el contador en Netlify Blobs (escritura condicional: dos pedidos a la vez no repiten número).
- La configuración completa llega por mail vía Netlify Forms (`configuraciones`) con el asunto «Pedido #00015 · Landing/Caja · Negocio»: JSON legible y el código `LK1.`/`CJ1.` para `pnpm publicar`. Si no se consigue número, el WhatsApp lleva el código completo como antes.
- `/caja`: el pedido pasa de link a botón con confirmación y número en pantalla (y link a WhatsApp si el navegador bloquea la pestaña). Antes no dejaba respaldo; ahora sí.
- `/caja`: el celular de prueba tiene proporción de teléfono real y la caja se ve en escala (letras y botones más chicos) gracias a un modo compacto (`/c/prueba?marco=1`) que no afecta a la caja real.
- Desarrollo: sin el indicador «N» de Next (`devIndicators: false`).

## 1.7.1 · 2026-11-12
- Precios nuevos (después de comparar con el mercado y los costos): Vidriera desde $190.000 + $15.000/mes; A tu medida desde $250.000 + $15.000/mes; Con sistema desde $350.000 + $75.000/mes (cada componente con sistema, como la agenda real, $60.000 + $10.000/mes); Caja simple $99.000 + $15.000/mes con el fiado incluido y cajones +$20.000; Caja pro $450.000 + $75.000/mes (incluye una sucursal y hasta 1.000 facturas por mes) y $25.000/mes por sucursal extra.

## 1.7.0 · 2026-11-12
- **Demo de la caja pro** (`/c/pro`), inspirada en el backoffice de un cliente: una ferretería inventada con dos sucursales y una semana de movimiento. Se entra eligiendo a una persona (dueña, encargado, vendedores) y cada una ve solo lo que le permiten.
- Venta con lector de código de barras (el código + Enter), factura A o B según el cliente con CAE de demostración e impresión, cobro con QR de Mercado Pago simulado y venta a cuenta corriente con límite de crédito.
- Caja por sucursal: apertura con fondo, ingresos y egresos, cierre con arqueo y motivo obligatorio si hay diferencia, historial de cierres.
- Stock por sucursal con mínimo y alerta, alta y edición de productos, ajustes con motivo. Clientes con cuenta corriente, cobros y saldo por WhatsApp. Equipo con roles y permisos uno por uno. Auditoría de todo, con lo sensible marcado para revisar. Tablero con ventas de la semana, medios de pago, equipo, más vendidos y lo que hay que reponer.
- Precio de referencia de la caja pro en `/caja` y link a la demo desde `/caja`, la home y el pie.

## 1.6.0 · 2026-11-11
- **Caja al toque** (`/caja`): caja para verdulerías, almacenes, kioscos y dietéticas, basada en la de Verdulería Lorenzo. El cliente elige rubro, nombre, color y módulos (fiado; cajones y mercado solo en verdulería), la prueba en vivo con sus productos de rubro y la pide por WhatsApp con un código `CJ1.`. Precio estimado en la misma página.
- Cajas publicadas en `/c/<slug>` (configs en `configs/cajas/`): instalables en el celular y funcionan sin internet. `pnpm publicar` acepta también códigos CJ1.
- Demos: `/c/demo-verduleria`, `/c/demo-almacen`, `/c/demo-kiosco` y `/c/demo-dietetica`, con ventas y fiado de ejemplo y botón «Empezar de cero».
- Home: sección «¿Tenés un local? También la caja.» y link a Caja en el menú (reemplaza a «Cómo funciona», que sigue en la página).
- Por dentro: las rutas pasan a dos layouts raíz, `(sitio)` y `(caja)`, cada uno con su propia hoja de Tailwind.

## 1.5.0 · 2026-10-24
- Home: nueva sección **Proyectos** ("Ya están online") con capturas y links a sitios que hicimos: Cuervo Peluquería, 1918 Peluquería, Lunagui Viajes, Casas de Sierra y For her. Los proyectos se editan en `PROYECTOS` (`src/app/(kit)/_home/contenido.ts`).
- `pnpm capturas` también saca las capturas de los proyectos (`public/proyectos`, sin el cartel de Netlify); `SOLO=proyectos` saca solo esas.

## 1.4.0 · 2026-10-21
- **Dominio propio**: el sitio pasa a https://altoque-cba.com.ar. El dominio de Netlify redirige al nuevo (301), y los links canónicos, las vistas previas y `pnpm publicar` usan el dominio nuevo.
- **Redes sociales** (Jime): el negocio carga Instagram, Facebook, TikTok, YouTube, X y LinkedIn. El formato de configuración pasa a v2 con migración automática (las configs v1 se siguen aceptando).
- **Respaldo en Netlify Forms** (Jime): cada envío del configurador queda guardado además de ir por WhatsApp.
- **Video demo** en "Cómo funciona" (Jime), comprimido de 21 MB a 1,7 MB (sin audio, que era silencio).
- Capturas de la home actualizadas.
- Arreglo: un párrafo anidado en la sección Precios generaba un error de hidratación en la home.

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
