import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { PLANTILLAS_DE_RUBRO, registry } from "@/core/registry";
import { DISENOS } from "@/agendas/lib/disenos";
import { RUBROS, RUBROS_CAJA } from "@/cajas/rubros";
import { ESTUDIO, FICHAS, PROYECTOS } from "../_home/contenido";
import { fuentesHome } from "../_home/fuentes";
import { Marca, margen } from "../_home/Secciones";
import { Adm, type GrupoDemos } from "./Adm";
import { leerChangelog } from "./changelog";

/*
 * /adm: panel interno del equipo (no está enlazado desde el sitio y no se indexa). Junta todas las
 * demos para mostrarle a un cliente y las novedades de cada versión, que salen de CHANGELOG.md.
 * No tiene datos privados: todo lo que muestra ya es público.
 */
export const metadata: Metadata = {
  title: "Panel · Al Toque",
  robots: { index: false, follow: false },
};

const NETLIFY = "https://app.netlify.com/projects/landing-al-toque";

function demos(): GrupoDemos[] {
  return [
    {
      id: "landings",
      titulo: "Landings",
      bajada: "Una demo por plantilla, con datos de ejemplo. Mostralas en el celular: es donde las van a ver sus clientes.",
      items: [
        ...PLANTILLAS_DE_RUBRO.map((p) => ({
          titulo: registry[p].meta.nombre,
          etiqueta: registry[p].meta.rubro,
          texto: FICHAS[p].bajada,
          consejo: FICHAS[p].destacados[0],
          href: `/l/${FICHAS[p].slug}`,
          imagen: `/muestras/${p}-escritorio.jpg`,
        })),
        {
          titulo: ESTUDIO.nombre,
          etiqueta: ESTUDIO.rubro,
          texto: ESTUDIO.bajada,
          consejo: "Abrí un proyecto y mostrá el antes y después deslizando.",
          href: ESTUDIO.ruta,
          imagen: `/muestras/${ESTUDIO.id}-escritorio.jpg`,
        },
        {
          titulo: "A tu medida",
          etiqueta: "Cualquier negocio",
          texto: "Hoja en blanco armada con bloques. Incluye bloques con sistema (agenda, consultas, seña).",
          consejo: "Mostrá el cartel de costo de los bloques con sistema.",
          href: "/l/demo-a-medida",
        },
      ],
    },
    {
      id: "venta",
      titulo: "Para vender",
      bajada: "Lo que ve el cliente antes de pedir.",
      items: [
        { titulo: "Home", etiqueta: "Sitio", texto: "Plantillas, proyectos, turnos, caja, precios y preguntas.", href: "/" },
        {
          titulo: "Alto, el asistente",
          etiqueta: "Asistente",
          texto: "Preguntas rápidas (rubro, qué le complica, zona, colores, qué quiere) y una recomendación con precios y botones para probar.",
          consejo: "Está en la home, /caja y /agenda: «Preguntale a Alto», abajo a la derecha. Al final, «Armar mi página» abre el configurador ya cargado.",
          href: "/",
        },
        {
          titulo: "Configurador",
          etiqueta: "Landings",
          texto: "El cliente elige plantilla, edita en vivo, ve el precio y la manda.",
          consejo: "Con ?admin aparecen «Copiar JSON», «Descargar JSON» e «Importar».",
          href: "/configurador",
          imagen: "/muestras/configurador.jpg",
        },
        { titulo: "Configurador (admin)", etiqueta: "Interno", texto: "Para cargar o revisar la configuración que mandó un cliente.", href: "/configurador?admin" },
        { titulo: "Armá tu caja", etiqueta: "Cajas", texto: "Rubro, nombre, color y módulos, con la caja de prueba al lado y el pedido.", href: "/caja" },
      ],
    },
    {
      id: "turnos",
      titulo: "Turnos",
      bajada: "La agenda de turnos (ex Agenda Rápida): guarda todo en el navegador; el selector de abajo a la derecha cambia de diseño y de rubro.",
      items: [
        { titulo: "Al Toque Turnos", etiqueta: "Presentación", texto: "Los nueve diseños, el panel, los rubros y el precio.", href: "/turnos" },
        {
          titulo: "Probalo con tus datos",
          etiqueta: "Asistente",
          texto: "Rubro, servicios, horarios, contacto y diseño, con la vista previa en vivo. Termina en el pedido.",
          consejo: "Hacelo con el rubro del cliente: al final ve su página y su panel con turnos de ejemplo.",
          href: "/turnos/demo#/probar",
        },
        ...DISENOS.map((d) => ({ titulo: `Diseño ${d.nombre}`, etiqueta: "Reserva", texto: d.bajada, href: `/turnos/demo?d=${d.id}#/`, imagen: `/muestras/agenda-${d.id}.jpg` })),
        {
          titulo: "Panel del negocio",
          etiqueta: "Panel",
          texto: "Hoy, agenda, caja, números, clientes, servicios y ajustes.",
          consejo: "PIN de la demo: 1234. Mostrá «Números»: es lo que más vende.",
          href: "/turnos/demo#/admin/hoy",
          imagen: "/muestras/agenda-panel.jpg",
        },
      ],
    },
    {
      id: "cajas",
      titulo: "Cajas",
      bajada: "Las simples guardan en el navegador; «Empezar de cero» vuelve a los datos de ejemplo.",
      items: [
        ...RUBROS_CAJA.map((r) => ({
          titulo: `Caja ${RUBROS[r].nombre.toLowerCase()}`,
          etiqueta: "Caja simple",
          texto: RUBROS[r].bajada,
          href: `/c/demo-${r}`,
          imagen: r === "verduleria" ? "/muestras/caja-vender.jpg" : r === "almacen" ? "/muestras/caja-cierre.jpg" : undefined,
        })),
        {
          titulo: "Caja pro",
          etiqueta: "Pro",
          texto: "Ferretería inventada con dos sucursales: factura, QR, stock, cuentas corrientes, permisos y auditoría.",
          consejo: "Entrá como Graciela (dueña) y después como Sofía (vendedora) para mostrar los permisos.",
          href: "/c/pro",
        },
      ],
    },
    {
      id: "proyectos",
      titulo: "Proyectos reales",
      bajada: "Sitios que hicimos y están online (los de la sección «Ya están online»).",
      items: PROYECTOS.map((p) => ({
        titulo: p.nombre,
        etiqueta: p.rubro,
        texto: p.texto,
        href: p.url,
        imagen: `/proyectos/${p.id}.jpg`,
        externo: true,
      })),
    },
    {
      id: "accesos",
      titulo: "Accesos del equipo",
      bajada: "Piden iniciar sesión con la cuenta correspondiente.",
      items: [
        { titulo: "Pedidos (Netlify Forms)", etiqueta: "Netlify", texto: "Cada pedido con su número, el JSON y el código para publicar.", href: `${NETLIFY}/forms`, externo: true },
        { titulo: "Deploys", etiqueta: "Netlify", texto: "Cada push o merge a master se publica solo; acá se ve si salió bien.", href: `${NETLIFY}/deploys`, externo: true },
        { titulo: "Repositorio", etiqueta: "GitHub", texto: "sdv12/Al-toque: código, PRs y el CHANGELOG.", href: "https://github.com/sdv12/Al-toque", externo: true },
      ],
    },
  ];
}

export default async function AdmPagina() {
  const versiones = leerChangelog(await readFile(path.join(process.cwd(), "CHANGELOG.md"), "utf8"));
  const ultima = versiones[0];
  const fecha = ultima ? new Date(`${ultima.fecha}T12:00:00Z`).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "";
  return (
    <div data-kit="home" className={fuentesHome}>
      <Adm
        versiones={versiones}
        grupos={demos()}
        encabezado={
          <header className={`${margen} flex flex-wrap items-center justify-between gap-4 border-b-2 border-tinta py-4`}>
            <Link href="/" className="text-[1.4rem]" aria-label="Ir al sitio">
              <Marca />
            </Link>
            <p className="text-chico text-tinta-suave">
              Panel del equipo · en producción <strong className="text-tinta">v{process.env.NEXT_PUBLIC_VERSION}</strong>
              {fecha && ` · ${fecha}`}
            </p>
          </header>
        }
      />
    </div>
  );
}
