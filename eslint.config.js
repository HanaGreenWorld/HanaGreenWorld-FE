// CommonJS flat config for ESLint v9 (no ESM package.json)
const js = require('@eslint/js');
const globals = require('globals');
const ts = require('typescript-eslint');

module.exports = [
  {
    ignores: ['node_modules/**', '.expo/**', 'ios/**', 'android/**'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: false,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: ts.parser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];


