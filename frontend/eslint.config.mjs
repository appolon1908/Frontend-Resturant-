import tsParser from '@typescript-eslint/parser'

export default [
  {
    ignores: ['.nuxt/**', '.output/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
    },
  },
]
