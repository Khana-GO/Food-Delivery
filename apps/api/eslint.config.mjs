// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      sourceType: 'commonjs',

      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      // Allow explicit any
      '@typescript-eslint/no-explicit-any': 'off',

      // Disable strict any-related rules
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // Disable unused-vars so scaffolding/generated code does not error
      '@typescript-eslint/no-unused-vars': 'off',

      // Disable require-await (test mocks/overrides often don't await)
      '@typescript-eslint/require-await': 'off',

      // Disable unbound-method (jest mock functions passed around)
      '@typescript-eslint/unbound-method': 'off',

      // Promise handling
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',

      // Prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);