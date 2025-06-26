module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js'],
  rules: {
    // Basic rules only
    'no-unused-vars': 'warn',
    'no-console': 'off',
  },
};