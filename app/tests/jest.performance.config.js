/**
 * Performance Test Configuration
 * 
 * Tests for performance benchmarks and optimization validation.
 * These tests measure execution time, memory usage, and resource consumption.
 */

export default {
  displayName: "Performance Tests",
  preset: "ts-jest",
  testEnvironment: "node",
  
  // Test file matching
  testMatch: ["<rootDir>/performance/**/*.perf.test.ts"],
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
  
  // No coverage collection for performance tests
  collectCoverage: false,
  
  // Mock and cleanup settings
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Extended timeout for performance measurements
  testTimeout: 120000,
  
  // Run tests serially for accurate performance measurements
  maxWorkers: 1,
  
  // Verbose output for performance metrics
  verbose: true,
  
  // Detect open handles for proper cleanup
  detectOpenHandles: true,
  
  // Log heap usage for memory profiling
  logHeapUsage: true
};