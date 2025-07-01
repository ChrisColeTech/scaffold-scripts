/**
 * Test isolation utilities for scaffold-scripts tests
 * Ensures each test runs with a clean database state
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { homedir, tmpdir } from 'os';

// Use a unique test database path to avoid conflicts
const TEST_DB_DIR = join(tmpdir(), '.scaffold-scripts-test-' + process.pid + '-' + Date.now());

// Export the test environment for use in tests
export const TEST_ENV = { 
  ...process.env, 
  SCAFFOLD_SCRIPTS_DB_DIR: TEST_DB_DIR,
  NODE_ENV: 'test',
  CI: 'true'
};

// Export CLI path and helper function
export const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

/**
 * Execute CLI command with proper test environment
 * Returns output for both success and failure cases
 */
export function execCLI(command: string, options: any = {}): any {
  try {
    return execSync(`node ${CLI_PATH} ${command}`, {
      ...options,
      env: TEST_ENV,
      stdio: 'pipe', // Prevent interactive input
      timeout: 30000 // 30 second timeout
    });
  } catch (error: any) {
    // For CLI commands that exit with non-zero (like validation errors),
    // return the combined output instead of throwing
    if (error.status !== undefined) {
      const stdout = error.stdout?.toString() || '';
      const stderr = error.stderr?.toString() || '';
      return stdout + stderr;
    }
    // Re-throw unexpected errors (like ENOENT, etc.)
    throw error;
  }
}

/**
 * Clean the test database completely
 */
export function cleanTestDatabase(): void {
  try {
    // Clean the test-specific database directory
    if (existsSync(TEST_DB_DIR)) {
      rmSync(TEST_DB_DIR, { recursive: true, force: true });
    }
    
    // Also clean the default directory just in case
    const defaultScriptDir = join(homedir(), '.scaffold-scripts');
    if (existsSync(defaultScriptDir)) {
      rmSync(defaultScriptDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Get a list of all scripts currently in the database
 */
export function getAllScripts(): string[] {
  try {
    const result = execCLI('list', { 
      encoding: 'utf8', 
      stdio: 'pipe'
    });
    
    if (result.includes('No scripts available')) {
      return [];
    }
    
    // Extract script names from the list output
    const lines = result.split('\n');
    const scripts: string[] = [];
    
    for (const line of lines) {
      if (line.includes('• ')) {
        const match = line.match(/• ([^\s(]+)/);
        if (match) {
          scripts.push(match[1]);
        }
      }
    }
    
    return scripts;
  } catch (error) {
    return [];
  }
}

/**
 * Remove all scripts from the database
 */
export function removeAllScripts(): void {
  const scripts = getAllScripts();
  
  for (const script of scripts) {
    try {
      execCLI(`remove ${script}`, { 
        stdio: 'pipe'
      });
    } catch (error) {
      // Ignore removal errors
    }
  }
}

/**
 * Setup for each test - ensures clean state
 */
export function setupTest(): void {
  cleanTestDatabase();
}

/**
 * Cleanup after each test - ensures no leftovers
 */
export function cleanupTest(): void {
  cleanTestDatabase();
}

/**
 * Complete test isolation - run a test function with guaranteed clean state
 */
export function isolatedTest(testFn: () => void | Promise<void>): () => Promise<void> {
  return async () => {
    setupTest();
    try {
      await testFn();
    } finally {
      cleanupTest();
    }
  };
}