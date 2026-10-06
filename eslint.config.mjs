import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const PLANTILLAS = ["barberia", "consultorio", "alojamiento", "generico", "libre"];

/**
 * Reglas de arquitectura:
 * - El core es headless: no importa UI, plantillas ni app.
 * - Una plantilla nunca importa componentes de otra (cada una tiene su presentación propia).
 * - Las primitivas de UI no conocen plantillas.
 */
const reglasDeCapas = [
  {
    files: ["src/core/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/templates", "@/templates/**", "@/ui", "@/ui/**", "@/app/**", "next", "next/**", "react-dom", "react-dom/**"],
              message: "El core es headless: no puede depender de UI, plantillas ni Next.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/templates", "@/templates/**", "@/app/**"],
              message: "Las primitivas no conocen plantillas ni rutas.",
            },
          ],
        },
      ],
    },
  },
  ...PLANTILLAS.map((plantilla) => ({
    files: [`src/templates/${plantilla}/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: PLANTILLAS.filter((p) => p !== plantilla).flatMap((p) => [
                `@/templates/${p}`,
                `@/templates/${p}/**`,
                `../${p}`,
                `../${p}/**`,
                `../../${p}/**`,
              ]),
              message: `La plantilla "${plantilla}" no puede usar componentes de otra plantilla.`,
            },
            {
              group: ["@/app/**"],
              message: "Las plantillas no dependen de rutas de la app.",
            },
          ],
        },
      ],
    },
  })),
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...reglasDeCapas,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".netlify/**"]),
]);

export default eslintConfig;
