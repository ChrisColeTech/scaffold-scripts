/**
 * Type declarations for test utilities
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidExecutionResult(): R;
      toBeValidScript(): R;
      toHaveValidMetadata(): R;
    }
  }
}

export {};