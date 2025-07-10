/**
 * Unit Test Configuration
 * 
 * Fast, isolated testing with heavy mocking for individual components.
 * These tests should run in milliseconds and provide high code coverage.
 */

export default {
  displayName: "Unit Tests",
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "../",
  
  // Test file matching
  testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  
  // Path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@core/(.*)$": "<rootDir>/src/core/$1",
    "^@cli/(.*)$": "<rootDir>/src/cli/$1",
    "^@commands/(.*)$": "<rootDir>/src/commands/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@repositories/(.*)$": "<rootDir>/src/repositories/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@legacy/(.*)$": "<rootDir>/src/legacy/$1"
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx}",
    "!<rootDir>/src/**/*.d.ts",
    "!<rootDir>/src/legacy/**/*",
    "!<rootDir>/src/**/index.ts"
  ],
  coverageDirectory: "<rootDir>/tests/logs/coverage/unit",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Performance settings
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Timeout for fast unit tests
  testTimeout: 5000,
  
  // Verbose output for debugging
  verbose: true
};