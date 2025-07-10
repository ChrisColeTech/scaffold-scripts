/**
 * End-to-End Test Configuration
 * 
 * Tests complete user workflows with real system components.
 * These tests verify the entire application works as expected from a user perspective.
 */

export default {
  displayName: "E2E Tests",
  preset: "ts-jest",
  testEnvironment: "node",
  
  // Test file matching
  testMatch: ["<rootDir>/e2e/**/*.test.ts"],
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
  
  // No coverage collection for E2E tests (focus on workflows)
  collectCoverage: false,
  
  // Mock and cleanup settings
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Extended timeout for E2E operations
  testTimeout: 60000,
  
  // Run tests serially to avoid conflicts with real filesystem operations
  maxWorkers: 1,
  
  // Verbose output for debugging
  verbose: true,
  
  // Detect open handles for proper cleanup
  detectOpenHandles: true,
  
  // Force exit to prevent hanging
  forceExit: true,
  
  // Global setup/teardown for E2E environment
  globalSetup: "<rootDir>/e2e/global-setup.ts",
  globalTeardown: "<rootDir>/e2e/global-teardown.ts"
};