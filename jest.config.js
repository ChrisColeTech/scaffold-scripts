module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '<rootDir>/tests/files/',
    '<rootDir>/node_modules/'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testTimeout: 60000, // Increased for CI environments
  // Allow parallel test execution for better performance  
  maxWorkers: process.env.CI ? 1 : 2,
  // Ensure tests are isolated
  resetMocks: true,
  restoreMocks: true,
  // Optimize for CI performance
  verbose: false,
  silent: process.env.CI === 'true'
};