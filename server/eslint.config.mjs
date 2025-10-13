import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: {
      js,
      prettier: eslintPluginPrettier,
    },
    extends: ["js/recommended"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "prettier/prettier": [
        "warn",
        {
          arrowParens: "always",
          semi: true,
          trailingComma: "es5",
          tabWidth: 2,
          endOfLine: "auto",
          useTabs: false,
          singleQuote: false,
          printWidth: 120,
          jsxSingleQuote: true,
        },
      ],
    },
  },
  tseslint.configs.recommended,
]);
