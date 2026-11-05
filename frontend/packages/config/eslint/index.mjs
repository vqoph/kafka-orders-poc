// @ts-check
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint flat config for the frontend monorepo (TypeScript + React).
 * Packages consume it via `eslint.config.mjs`:
 *
 *   import config from "@poc/config/eslint";
 *   export default config;
 */
export default defineConfig(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".turbo/**",
      "coverage/**",
      // RTK Query OpenAPI codegen output — do not hand-lint
      "**/src/api/generatedApi.ts",
      // CommonJS tooling kept as .js in this monorepo (webpack/vitest/prettier shareables)
      "**/*.config.js",
      "**/*.config.cjs",
      "**/webpack/**",
      "**/vitest/**",
      "**/prettier/**",
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/prop-types": "off",
      // Classic hooks behavior for this POC; React Compiler rules can be enabled later.
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  eslintConfigPrettier,
);
