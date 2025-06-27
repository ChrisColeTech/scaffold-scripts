module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
  rules: {
    // Basic rules only - minimal linting for production
    'no-unused-vars': 'off', // Let TypeScript handle this
    'no-console': 'off',
    'no-undef': 'off', // Let TypeScript handle this
  },
};