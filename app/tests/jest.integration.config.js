/**
 * Integration Test Configuration
 * 
 * Tests component interactions with minimal mocking.
 * These tests verify that different parts of the system work together correctly.
 */

export default {
  displayName: "Integration Tests",
  preset: "ts-jest",
  testEnvironment: "node",
  
  // Test file matching
  testMatch: ["<rootDir>/integration/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/setup.ts"],
  
  // Path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/../src/$1",
    "^@core/(.*)$": "<rootDir>/../src/core/$1",
    "^@cli/(.*)$": "<rootDir>/../src/cli/$1",
    "^@commands/(.*)$": "<rootDir>/../src/commands/$1",
    "^@config/(.*)$": "<rootDir>/../src/config/$1",
    "^@services/(.*)$": "<rootDir>/../src/services/$1",
    "^@repositories/(.*)$": "<rootDir>/../src/repositories/$1",
    "^@utils/(.*)$": "<rootDir>/../src/utils/$1",
    "^@legacy/(.*)$": "<rootDir>/../src/legacy/$1"
  },
  
  // Coverage configuration (lighter than unit tests)
  collectCoverageFrom: [
    "<rootDir>/../src/**/*.{ts,tsx}",
    "!<rootDir>/../src/**/*.d.ts",
    "!<rootDir>/../src/legacy/**/*",
    "!<rootDir>/../src/**/index.ts"
  ],
  coverageDirectory: "<rootDir>/logs/coverage/integration",
  coverageReporters: ["text", "lcov"],
  
  // Mock and cleanup settings
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Longer timeout for integration tests
  testTimeout: 30000,
  
  // Run tests serially to avoid conflicts
  maxWorkers: 1,
  
  // Verbose output for debugging
  verbose: true,
  
  // Detect open handles for proper cleanup
  detectOpenHandles: true
};