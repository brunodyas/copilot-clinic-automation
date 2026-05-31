// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import boundaries from "eslint-plugin-boundaries";
import { recommended as boundariesRecommended } from "eslint-plugin-boundaries/config";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const boundaryElements = [
  { type: "generated", pattern: "app/generated/**", mode: "full" },
  { type: "api-route", pattern: "app/api/**", mode: "full" },
  { type: "app-route", pattern: "app/**", mode: "full" },
  // The Apollo provider is the only component allowed to bootstrap MSW in development.
  { type: "provider", pattern: "components/apollo-provider.tsx", mode: "full" },
  { type: "ui", pattern: "components/ui/**", mode: "full" },
  { type: "dashboard-component", pattern: "components/dashboard/**", mode: "full" },
  { type: "component", pattern: "components/**", mode: "full" },
  { type: "lib", pattern: "lib/**", mode: "full" },
  { type: "mock", pattern: "mocks/**", mode: "full" },
  { type: "worker", pattern: "workers/**", mode: "full" },
  { type: "test", pattern: "tests/**", mode: "full" },
  { type: "config", pattern: "*.config.{js,mjs,ts}", mode: "full" },
  { type: "config", pattern: "codegen.ts", mode: "full" },
  { type: "config", pattern: "tailwind.config.ts", mode: "full" },
];

const boundaryDependencyRules = [
  {
    from: { type: ["app-route", "api-route"] },
    allow: { to: { type: ["app-route", "api-route", "provider", "component", "dashboard-component", "ui", "lib", "generated"] } },
  },
  {
    from: { type: "provider" },
    // Keep mock imports scoped to the provider so regular components cannot depend on mocks.
    allow: { to: { type: ["provider", "component", "dashboard-component", "ui", "lib", "mock", "generated"] } },
  },
  {
    from: { type: ["component", "dashboard-component"] },
    allow: { to: { type: ["component", "dashboard-component", "ui", "lib", "generated"] } },
  },
  {
    from: { type: "ui" },
    allow: { to: { type: ["ui", "lib"] } },
  },
  {
    from: { type: "lib" },
    allow: { to: { type: ["lib", "generated"] } },
  },
  {
    from: { type: "worker" },
    allow: { to: { type: ["lib", "generated"] } },
  },
  {
    from: { type: "mock" },
    allow: { to: { type: ["mock", "lib", "generated"] } },
  },
  {
    from: { type: "test" },
    allow: { to: { type: ["app-route", "api-route", "provider", "component", "dashboard-component", "ui", "lib", "generated", "mock", "worker"] } },
  },
  {
    from: { type: "config" },
    allow: { to: { type: ["lib", "generated"] } },
  },
];

const eslintConfig = defineConfig([...nextVitals, ...nextTs, {
  files: ["**/*.{js,jsx,ts,tsx,mjs}"],
  plugins: {
    boundaries,
  },
  settings: {
    ...boundariesRecommended.settings,
    "boundaries/elements": boundaryElements,
    "boundaries/include": [
      "app/**/*",
      "components/**/*",
      "lib/**/*",
      "mocks/**/*",
      "workers/**/*",
      "tests/**/*",
      "*.config.{js,mjs,ts}",
      "codegen.ts",
      "tailwind.config.ts",
    ],
    "boundaries/ignore": ["app/generated/**/*"],
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
      },
    },
  },
  rules: {
    ...boundariesRecommended.rules,
    "boundaries/dependencies": [
      "error",
      {
        default: "disallow",
        rules: boundaryDependencyRules,
      },
    ],
  },
}, // Override default ignores of eslint-config-next.
globalIgnores([
  // Default ignores of eslint-config-next:
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
]), ...storybook.configs["flat/recommended"]]);

export default eslintConfig;
