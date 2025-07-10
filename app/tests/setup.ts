/**
 * Global Test Setup
 * 
 * Configures the testing environment for all test types.
 * Includes timeout settings, environment variables, and global utilities.
 */

// Global test timeout configuration
jest.setTimeout(30000); // 30 seconds default

// Environment setup
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce logging noise in tests
process.env.DB_PATH = ':memory:'; // Use in-memory database for tests

// Global test utilities - moved to separate declaration file

// Custom Jest matchers
expect.extend({
  toBeValidExecutionResult(received: any) {
    const pass = received && 
                 typeof received.success === 'boolean' &&
                 typeof received.exitCode === 'number' &&
                 typeof received.output === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid execution result`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid execution result with success, exitCode, and output properties`,
        pass: false,
      };
    }
  },

  toBeValidScript(received: any) {
    const pass = received &&
                 typeof received.id === 'string' &&
                 typeof received.name === 'string' &&
                 typeof received.content === 'string' &&
                 typeof received.type === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid script`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid script with id, name, content, and type properties`,
        pass: false,
      };
    }
  },

  toHaveValidMetadata(received: any) {
    const pass = received &&
                 received.metadata &&
                 typeof received.metadata.createdAt === 'string' &&
                 typeof received.metadata.platform === 'string';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have valid metadata`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have valid metadata with createdAt and platform`,
        pass: false,
      };
    }
  },
});

// Global error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in tests, just log
});

// Global cleanup
afterEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  
  // Clear environment variables that might have been set in tests
  delete process.env.TEST_SCRIPT_ID;
  delete process.env.TEST_SCRIPT_CONTENT;
  delete process.env.TEST_EXECUTION_PATH;
});

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  const originalConsole = global.console;
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
  
  // Restore after all tests
  afterAll(() => {
    global.console = originalConsole;
  });
}
