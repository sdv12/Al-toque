# Landing al toque

Landings para negocios chicos, armadas por rubro. El cliente entra al **configurador**, elige una
plantilla, la personaliza viendo el resultado en vivo y me manda su configuración por WhatsApp.
Con esa configuración se publica su página en `/l/<slug>`.

- Sitio: https://altoque-cba.com.ar
- Configurador: https://altoque-cba.com.ar/configurador

**Estado: beta sin backend.** Las configuraciones son archivos JSON en `configs/`, los turnos y
consultas se confirman por WhatsApp y no se guarda nada en ningún servidor. Supabase (datos) y
n8n (recordatorios) quedan para más adelante.

## Plantillas

Cada una tiene su propia estructura, no solo otros colores.

| Plantilla | Rubro | Lo que la distingue |
|---|---|---|
| Nocturna editorial | Barbería | Nav lateral, precios tipo pizarra, reserva en panel lateral con barbero a elección |
| Clínica clara | Consultorio / estética | Turnos desde la portada, prestaciones comparables, obras sociales con buscador |
| Cuaderno de campo | Casas de campo | Recorrido casa por casa, mapa ilustrado, calendario de fechas con estimado |
| Portfolio modular | Cualquier rubro | Portada en bento, trabajos con antes/después, contacto que termina en WhatsApp |
| A tu medida | Cualquier negocio | Hoja en blanco que se arma sumando bloques; los componentes con sistema avisan que suman costo |

Demos: `/l/demo-barberia`, `/l/demo-consultorio`, `/l/demo-casas`, `/l/demo-portfolio`, `/l/demo-a-medida`.

## Precios

Son estimados de referencia y viven en un solo lugar: [`src/core/lib/precios.ts`](src/core/lib/precios.ts).
Cambiarlos ahí actualiza la calculadora del configurador y la sección de precios de la home.
Las reseñas de la home son de muestra mientras `RESENAS_DE_MUESTRA` (en
`src/app/(sitio)/(kit)/_home/contenido.ts`) sea `true`.

## Caja al toque

Además de landings, el kit arma **cajas** para negocios de barrio (verdulería, almacén, kiosco,
dietética): vender por kilo o por unidad, precios, fiado, caja del día y, en verdulería, cajones y
lista del mercado. Es la caja de Verdulería Lorenzo hecha configurable.

- `/caja`: el cliente elige rubro, nombre, color y módulos, la prueba en vivo (`/c/prueba`, lee la
  configuración del `localStorage` de ese navegador) y la pide por WhatsApp con un código `CJ1.`.
- `/c/<slug>`: cada caja publicada, desde `configs/cajas/<slug>.json`. Los datos (ventas, fiado,
  precios) quedan en IndexedDB del equipo donde se usa, sin servidor. Es instalable y anda sin
  internet (`public/c/sw.js`).
- Demos: `/c/demo-verduleria`, `/c/demo-almacen`, `/c/demo-kiosco`, `/c/demo-dietetica`.
- `/c/pro`: demo de la **caja pro** (sucursales, permisos, factura, QR, stock, cuentas corrientes,
  auditoría) con una ferretería inventada. Vive en `src/cajas/pro/`: `lib/logica.ts` son las reglas
  (funciones puras, con tests), `lib/semilla.ts` arma la semana de ejemplo pasando por esas mismas
  reglas y `lib/estado.ts` la guarda en `localStorage`. La factura (CAE) y el QR son simulados; la
  versión real necesita backend (Supabase + ARCA + Mercado Pago).

Se publica igual que una landing: `pnpm publicar "<mensaje con el código CJ1>"` (mismas opciones).
El código vive en `src/cajas/` (`rubros.ts` = productos de arranque por rubro, `config.ts` =
schema). Las rutas de las cajas usan su propio root layout (`src/app/(caja)`) y su propia hoja de
Tailwind (`src/cajas/estilos.css`), porque el kit anula la paleta y la escala por defecto.

## Publicar la página de un cliente

El cliente toca **Enviar** en el configurador (o **Pedir mi caja por WhatsApp** en `/caja`): recibe
un número de pedido correlativo (`#00015`, contador en Netlify Blobs vía `/api/pedidos`) y se le
abre WhatsApp con un mensaje corto con ese número y un resumen. La configuración completa va a
**Netlify Forms** (formulario `configuraciones`, declarado en `public/__forms.html`) con el asunto
«Pedido #00015 · Landing · Negocio»: trae el JSON legible y el código `LK1.`/`CJ1.` para publicar,
y queda en el panel de Netlify aunque el cliente no termine de mandar el WhatsApp. Si no se pudo
sacar número, el WhatsApp lleva el código completo como respaldo. Con el código del mail:

```bash
pnpm publicar "<código LK1. o CJ1. del mail>"
```

El comando valida la configuración, la guarda en `configs/<slug>.json`, hace el commit (solo ese
archivo) y lo sube a GitHub; Netlify lo publica solo en unos minutos. Al final muestra el link
para mandarle al cliente. Opciones:

| Opción | Para qué |
|---|---|
| `--archivo ruta.json` | Si el cliente mandó el JSON descargado en vez del código |
| `--slug nombre-a-eleccion` | Otra URL que la que sale del nombre del negocio |
| `--probar` | Solo valida y muestra la URL; no guarda ni publica nada |
| `--reemplazar` | Actualizar una página ya publicada |
| `--deploy` | Además de subirlo, despliega desde esta máquina (por si el deploy automático falla) |

Para ver el JSON o cargar una configuración en el configurador, abrilo como `/configurador?admin`:
aparecen «Copiar JSON», «Descargar JSON» e «Importar» (el cliente no los ve). Queda activo mientras
dure esa pestaña del navegador.

Para que el mail llegue, en Netlify hay que activar una vez **Forms › Enable form detection** y
sumar en el formulario `configuraciones` la notificación por mail a altoque.landing@gmail.com.
Netlify Blobs no necesita configuración. En `pnpm dev` el número sale de un contador en memoria y
no hay Netlify Forms.

Los commits salen con la identidad de git configurada **en este repo** (cuenta sdv12). Si git
fuera a firmar con el mail del trabajo, el comando frena y explica cómo configurarlo.

## Desarrollo

Requiere Node 22+ y pnpm.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # tests del core (Vitest)
pnpm lint && pnpm typecheck
```

Variables de entorno (ver `.env.example`):

- `NEXT_PUBLIC_OWNER_WHATSAPP`: número que recibe las configuraciones y el "Escribime" de la home.
- `NEXT_PUBLIC_SITE_URL`: URL pública, para canonical y vistas previas al compartir.

### Capturas de la home

La home muestra capturas reales de las demos (`public/muestras`) y de los proyectos ya publicados
(`public/proyectos`, lista en `PROYECTOS` de `src/app/(sitio)/(kit)/_home/contenido.ts`). Si cambia una
plantilla o un proyecto:

```bash
pnpm build && pnpm start -p 3124     # en otra terminal
pnpm capturas
```

### Deploy

Netlify está conectado al repo (`sdv12/Al-toque`): **cada push o merge a `master` se publica solo**,
y cada PR tiene su vista previa con URL propia. Por eso la versión del footer (`package.json` +
`CHANGELOG.md`) se sube en el mismo PR, antes de mergear. Para desplegar a mano (emergencias):

```bash
netlify deploy --build --prod
```

## Arquitectura

```
src/
  core/        Lógica sin UI: schema Zod versionado, registry de plantillas, migrador,
               agenda y turnos (hora de Córdoba), estadías, adaptadores de datos, mensajes.
  templates/   Una carpeta por plantilla, con su layout, sus secciones y sus tokens.
               Una plantilla no puede importar de otra (lo controla ESLint).
  ui/          Primitivas compartidas (placeholder de foto, raíz de tokens).
  app/         (sitio): home, configurador, /caja y /l/[slug]. (caja): /c/[slug] y /c/prueba.
  cajas/       Caja al toque: rubros, schema y la app de caja (simple/).
configs/       Una landing publicada por archivo.
scripts/       publicar y capturas.
configs/cajas/ Una caja publicada por archivo.
assets/og/     Fuentes TTF de las plantillas para las imágenes de vista previa (OFL).
```

Los datos pasan por la interfaz `DataAdapter`. Hoy se usa `DemoAdapter` (sin backend; simula
ocupación solo en las configs marcadas `"demo": true`). El futuro `SupabaseAdapter` implementa la
misma interfaz sin tocar las plantillas.
