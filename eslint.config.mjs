import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Intentional CommonJS network-guard preloads used by Node --require.
    files: [
      "scripts/auth-p02a-offline.cjs",
      "scripts/auth-p03b-offline.cjs",
    ],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Private local audit artifacts and isolated tooling, not application source.
    ".local/**",
  ]),
]);

export default eslintConfig;
