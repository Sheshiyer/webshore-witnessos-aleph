module.exports = {
  extends: [
    'next/core-web-vitals',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    '*.config.js',
    '*.config.ts'
  ]
};
