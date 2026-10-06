# Landing al toque

Landings para negocios chicos, armadas por rubro. El cliente entra al **configurador**, elige una
plantilla, la personaliza viendo el resultado en vivo y me manda su configuración por WhatsApp.
Con esa configuración se publica su página en `/l/<slug>`.

- Sitio: https://landing-al-toque.netlify.app
- Configurador: https://landing-al-toque.netlify.app/configurador

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
`src/app/(kit)/_home/contenido.ts`) sea `true`.

## Publicar la página de un cliente

El cliente toca **Enviar por WhatsApp** en el configurador y me llega un mensaje con un código
que empieza con `LK1.`. Con ese mensaje:

```bash
pnpm publicar "<mensaje completo que llegó por WhatsApp>"
```

El comando valida la configuración, la guarda en `configs/<slug>.json`, hace el commit (solo ese
archivo), lo sube a GitHub y despliega en Netlify. Al final muestra el link para mandarle al
cliente. Opciones:

| Opción | Para qué |
|---|---|
| `--archivo ruta.json` | Si el cliente mandó el JSON descargado en vez del código |
| `--slug nombre-a-eleccion` | Otra URL que la que sale del nombre del negocio |
| `--probar` | Solo valida y muestra la URL; no guarda ni publica nada |
| `--reemplazar` | Actualizar una página ya publicada |
| `--sin-deploy` | Guarda, commitea y sube, pero no despliega |

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

La home muestra capturas reales de las demos (`public/muestras`). Si cambia una plantilla:

```bash
pnpm build && pnpm start -p 3124     # en otra terminal
pnpm capturas
```

### Deploy manual

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
  app/         Home, configurador y /l/[slug] (render + imagen de vista previa).
configs/       Una landing publicada por archivo.
scripts/       publicar y capturas.
assets/og/     Fuentes TTF de las plantillas para las imágenes de vista previa (OFL).
```

Los datos pasan por la interfaz `DataAdapter`. Hoy se usa `DemoAdapter` (sin backend; simula
ocupación solo en las configs marcadas `"demo": true`). El futuro `SupabaseAdapter` implementa la
misma interfaz sin tocar las plantillas.
