import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
export default [
  { ignores: ['**/.vite/**', '**/dist/**', '**/node_modules/**', '**/uploads/**', '**/.cache/**'] },
  js.configs.recommended,
  { files: ['**/*.{js,jsx,mjs}'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } }, rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^[A-Z_]' }] } },
  { files: ['client/src/**/*.{js,jsx}'], plugins: { 'react-hooks': hooks }, rules: hooks.configs.recommended.rules }
];


