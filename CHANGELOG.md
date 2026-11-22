# Cambios

Versionado semántico: PATCH = arreglos y ajustes; MINOR = funcionalidad nueva visible;
MAJOR = cambios que rompen algo existente (formato de configs, flujo, backend).
La versión se muestra en el footer de la home y en el configurador.

## 1.21.0 · 2026-11-22
- **Home más prolija en pantallas grandes**: el título principal entra en dos líneas, «¿Qué necesitás hoy?» muestra las cinco opciones en una fila y las preguntas frecuentes van en dos columnas.
- **Títulos de sección un poco más chicos** en todo el sitio, y el cierre amarillo usa más ancho (título en dos líneas).
- **Banda de rubros más fina**, con estrellas dibujadas: en el celular ya no salen como emoji verde.
- **Pie alineado a una grilla**: marca a la izquierda y Soluciones, Demos y Contacto en columnas parejas.

## 1.20.0 · 2026-11-22
- **«Ya están online» es un carrusel infinito**: una tarjeta centrada con un pedazo de la anterior y la siguiente. En la computadora tiene flechas a los costados y los bordes se difuminan; en el celular se desliza con el dedo, tiene puntos y un botón «Visitar el sitio». Ocupa menos alto en pantallas grandes.
- **Home en el celular, más compacta**: menos espacio entre secciones y un pie ordenado en columnas (Soluciones y Demos lado a lado, Contacto y legales debajo).
- **Textos más cuidados**: «Reservas online, a toda hora» en Turnos, «Nuestro compromiso» en lugar de «Lo que te aseguramos», y descripciones de Turnos, Caja, Estudio y Resto que ya no repiten lo que dice la lista de debajo.

## 1.19.0 · 2026-11-22
- **Resto al toque (R1), en `/resto/demo`**: la web de un restaurante + su panel, configurable por local. Ocho tipos con su restaurante de ejemplo completo (bodegón, parrilla, pizzería y pastas, café, bar o cervecería, sushi, hamburguesería y rotisería sin salón), cada uno con su carta, horarios, mesas, textos y diseño. Todos los restaurantes de ejemplo son inventados.
- **Siete diseños que cambian la forma de la página**, no solo los colores: Imprenta y Pizarra (de La Vaquita) y cinco nuevos, Trattoria, Café, Nocturno, Brasa y Moderno. Además, un color principal propio.
- **La web del restaurante**: abierto o cerrado según el horario real (también pasada la medianoche), ocupación del salón en vivo, carta con secciones, etiquetas (sin TACC, vegetariano, vegano, picante) y filtro, reservas por turno con cupo según las mesas, pedidos para retirar o con envío (costo, mínimo y zona), tienda (almacén, café en grano, growlers), horarios, cómo llegar y términos.
- **El panel**: salón con mesas, cuentas, servicio de mesa por persona, descuentos, propina y cambio de mesa; reservas con confirmación y recordatorio por WhatsApp; pedidos en tablero con aviso de «listo» o «salió»; caja con comisiones de Mercado Pago, gastos y cierre con arqueo; carta con «Hay / Se terminó», etiquetas y orden de secciones.
- **Panel completo (R2)**:
  - **Personal con PIN y rol**: encargado, mozo, cocina y caja, y cada uno ve solo lo suyo. En la demo, 1234 entra como encargada, 1111 como mozo, 3333 como cocina y 4444 como caja.
  - **Salón por zonas** (salón, vereda, patio, barra), mesas juntas para grupos grandes y el mozo de cada mesa.
  - **Comandas**: el mozo manda a cocina o barra lo que falta (las bebidas van a la barra). La pantalla de cocina tiene columnas, minutos de espera y alerta de demora, y la mesa avisa cuando hay algo para servir. Los pedidos entran solos a la cocina.
  - **Cuenta dividida**: en partes iguales o «cada uno lo suyo», cada parte con su forma de pago. El descuento queda guardado en la mesa.
  - **Opciones de cada plato** (punto, guarnición, tamaño, gustos) con su extra de precio, en la web y en el panel, más una aclaración por plato.
  - **Platos que salen algunos días** (el locro de fin de semana) y **promos con horario** (happy hour, menú del mediodía, martes de pizza): la web muestra el precio tachado y el aviso mientras corre.
  - **Lista de espera**: se anota en el local o desde la web cuando el salón está lleno, se avisa por WhatsApp y se sienta en una mesa.
  - **Reservas**: días o turnos sin reservas por la web (evento privado) sin cerrar el local. **Envíos**: zonas o barrios con su costo y su mínimo.
  - **Números**: vendido, ticket promedio, por persona, propinas, día por día, por turno, por mozo, cómo pagaron, y lo que más y menos sale (con cuatro semanas inventadas en la demo).
  - **Copia de seguridad** en archivo para guardar o pasar todo a otra computadora. Los datos de R1 se migran solos.
- **Editor de la web (R3)**, en el panel → Web, con vista previa en celular o computadora que se actualiza sola:
  - **Secciones**: cuáles se ven, en qué orden y con qué título (ocupación, carta, reservas, eventos, galería, historia, reseñas, dónde y cuándo). Si a una le falta contenido, el editor avisa por qué no se ve.
  - **Textos** del encabezado y «Nuestra historia» en párrafos.
  - **Fotos**: logo (reemplaza las iniciales en la web y el panel), portada (cada diseño la ubica distinto) y foto de la historia, más una galería de hasta 12 fotos con ampliación. Se achican solas al subirlas, y se ve cuánto espacio queda en el navegador.
  - **Eventos** con fecha, hora y precio (los que pasaron se ocultan solos) y **reseñas reales** con estrellas y de dónde vienen. No trae reseñas inventadas: la sección aparece cuando se carga la primera.
  - **Diseño**: el diseño, el color y ahora también la **tipografía** (seis combinaciones), más el **mapa** de Google, que se carga solo si lo tocan.
  - **QR por mesa** para imprimir: al escanearlo, el cliente ve la carta y puede **llamar al mozo o pedir la cuenta**, y el aviso llega al salón. **Carta para imprimir** en A4, con o sin precios, o para guardar en PDF.
- Arreglo: al abrir otra pestaña (la vista previa, la cocina), ya no se pisan cambios recientes con lo que esa pestaña leyó al abrir.
- **Al Toque Resto a la venta (R4)**:
  - **Página `/resto`** con los ocho tipos de local, los siete diseños, la web, el panel, las preguntas y «Armalo con tus datos» (tipo, nombre, diseño y plan → la demo con eso y el pedido por WhatsApp con código RS1).
  - **Dos planes**: «Carta y web» ($ 250.000 + $ 15.000 por mes: web con carta, pedidos y reservas por WhatsApp, eventos, galería, QR y editor) y «Web + panel» ($ 450.000 + $ 75.000 por mes: suma salón, cocina, cuenta dividida, caja, números y personal).
  - **El espacio de cada cliente en `/r/<nombre>`**, desde `configs/restos/<nombre>.json`. Mientras no esté la nube, las reservas y los pedidos de la web llegan por WhatsApp con el mensaje armado, la web no guarda nada en el navegador de quien la visita y el panel trabaja en el equipo del local. El plan «Carta y web» muestra solo carta, web y ajustes.
  - **`pnpm publicar-resto <copia.json> <nombre> <carta|completo>`**: publica la copia que manda el cliente. Saca la operación de la demo y no publica sin WhatsApp del local ni con el PIN de la demo.
  - **Alto recomienda Resto a gastronomía** (el plan según lo que pida), con su duda y su saludo en `/resto`. **Portada**: Resto en las soluciones, en «¿Qué necesitás?» y en el pie. **/adm**: demos de Resto y «Mandar una demo» con el tipo de local; los pedidos de Resto se cuentan aparte.
  - Términos y privacidad suman Resto: qué incluye, que por ahora los pedidos llegan por WhatsApp y que las reseñas tienen que ser reales.
- Arreglo en /adm: dos demos con el mismo link repetían la clave de la lista.
- **Ajustes, todo editable**: datos y textos del local, horarios por día con varias franjas, feriados y vacaciones, reglas de reservas, retiro y envíos, funciones que se prenden y apagan (salón, ocupación en la web, reservas, retiro, envíos, caja, tienda), diseño y color, servicio de mesa, comisiones y PIN.
- Por ahora guarda en el navegador, como la caja simple: la nube llega con la Fase 5.

## 1.18.0 · 2026-11-21
- **Configurador más claro**: arriba siempre dice en qué nivel está tu página (Perfil digital, Listo para usar, Personalizado o Web + Turnos). En Bloques avisa cuántos bloques te quedan en el Perfil digital y, antes de pasarte, cuánto suma pasar a Personalizado.
- **Tu dirección**: en Precio elegís entre la dirección de Al Toque sin costo (tunegocio.altoque-cba.com.ar, con tu nombre) o dominio propio a tu nombre.
- **¿Cuánto pensás invertir?** (opcional): si lo que armaste se pasa, te dice qué sacar y cuánto queda, o con qué nivel arrancar. Viaja en el pedido, junto con el nivel y la dirección.
- **Copia de seguridad en la caja simple**: «Guardar una copia» (en el celular se comparte a WhatsApp, Drive o mail) y «Recuperar desde una copia» en este u otro equipo. Si pasa una semana sin copia, la caja lo recuerda con letra grande.
- **/adm › Pedidos**: cuántos pedidos llegan por semana, por qué página entraron, desde dónde pidieron y qué nivel o producto, más los anotados para Tienda. Solo números, sin datos personales; solo cuentan los del sitio real.
- **Arreglo en los números de pedido**: en Netlify, leer de Blobs una clave que todavía no existe se quedaba colgado; el primer pedido esperaba ~30 segundos y salía sin número. Ahora se fija antes si la clave existe.
- **/adm › Mandar una demo**: nombre del negocio + rubro + producto → el link de la demo personalizada y el mensaje para WhatsApp, listos para prospectar. El configurador acepta `?nombre=`.

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
