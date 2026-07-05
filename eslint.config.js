const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angularPlugin = require("@angular-eslint/eslint-plugin");
const angularTemplatePlugin = require("@angular-eslint/eslint-plugin-template");
const angularTemplateParser = require("@angular-eslint/template-parser");

module.exports = [
  { ignores: ["dist/", "node_modules/", ".angular/"] },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2021 },
      parser: tseslint.parser,
      parserOptions: {
        project: "tsconfig.app.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "@angular-eslint": angularPlugin,
    },
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/contextual-lifecycle": "error",
      "@angular-eslint/prefer-standalone": "error",
      "@angular-eslint/no-async-lifecycle-method": "error",
      "@angular-eslint/prefer-on-push-component-change-detection": "warn",
      "@angular-eslint/prefer-inject": "warn",
      "@angular-eslint/no-attribute-decorator": "error",

      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    },
  },

  {
    files: ["**/*.spec.ts", "**/*.test.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  {
    files: ["**/*.html"],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      "@angular-eslint/template": angularTemplatePlugin,
    },
    rules: {
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-any": "error",
      "@angular-eslint/template/prefer-self-closing-tags": "error",
      "@angular-eslint/template/prefer-control-flow": "error",
      "@angular-eslint/template/use-track-by-function": "warn",
      "@angular-eslint/template/attributes-order": "warn",
    },
  },

  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-eval": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "no-throw-literal": "error",
    },
  },
];
