/**
 * Test isolation utilities for scaffold-scripts tests
 * Ensures each test runs with a clean database state
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';
import { homedir } from 'os';

const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

/**
 * Clean the test database completely
 */
export function cleanTestDatabase(): void {
  try {
    // Remove the database file if it exists
    const dbPath = join(homedir(), '.scaffold-scripts', 'commands.db');
    if (existsSync(dbPath)) {
      rmSync(dbPath, { force: true });
    }
    
    // Remove the entire directory if it exists
    const scriptDir = join(homedir(), '.scaffold-scripts');
    if (existsSync(scriptDir)) {
      rmSync(scriptDir, { recursive: true, force: true });
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
    const result = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8', stdio: 'pipe' });
    
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
      execSync(`node ${CLI_PATH} remove ${script}`, { stdio: 'pipe' });
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