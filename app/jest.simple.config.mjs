/**
 * Simplified Unified Jest Configuration
 * 
 * Based on lessons learned from CI/CD challenges, this unified configuration
 * has proven reliable across all environments (local and CI).
 * 
 * Use this for CI with: npm run test:ci
 * Use multi-project config for local development: npm test
 */

export default {
  testEnvironment: "node",
  rootDir: "./",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  
  // Path aliases for cleaner imports
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
  
  // Manual transform instead of preset to avoid CI conflicts
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  
  // Custom reporters for organized logging (temporarily disabled for CI)
  // reporters: [
  //   ["<rootDir>/tests/scripts/custom-reporter.js", {}],
  //   ["<rootDir>/tests/scripts/verbose-reporter.js", {}]
  // ],
  
  // Mock and cleanup settings
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Development settings
  detectOpenHandles: true,
  verbose: false,
  silent: true,
  
  // Coverage settings (for when used with --coverage)
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/legacy/**/*",
    "!src/**/index.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};