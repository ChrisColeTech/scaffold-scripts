/**
 * E2E Global Setup
 * 
 * Prepares the environment for end-to-end testing.
 * Sets up temporary directories, test databases, and system state.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export default async function globalSetup(): Promise<void> {
  console.log('🔧 Setting up E2E test environment...');
  
  // Create temporary directory for E2E tests
  const tempDir = path.join(os.tmpdir(), 'scaffold-scripts-e2e-tests');
  
  // Clean up any existing test directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  // Create fresh test directory
  fs.mkdirSync(tempDir, { recursive: true });
  
  // Set environment variables for E2E tests
  process.env.E2E_TEMP_DIR = tempDir;
  process.env.E2E_TEST_DB = path.join(tempDir, 'test.db');
  process.env.E2E_CONFIG_DIR = path.join(tempDir, '.scaffold-scripts');
  
  // Create config directory
  fs.mkdirSync(process.env.E2E_CONFIG_DIR, { recursive: true });
  
  // Create test script files for E2E testing
  const testScriptsDir = path.join(tempDir, 'test-scripts');
  fs.mkdirSync(testScriptsDir, { recursive: true });
  
  // Create sample test scripts
  const testScripts = [
    {
      name: 'hello.sh',
      content: '#!/bin/bash\necho "Hello from test script!"'
    },
    {
      name: 'python-test.py',
      content: '#!/usr/bin/env python3\nprint("Hello from Python!")'
    },
    {
      name: 'node-test.js',
      content: 'console.log("Hello from Node.js!");'
    }
  ];
  
  testScripts.forEach(script => {
    const scriptPath = path.join(testScriptsDir, script.name);
    fs.writeFileSync(scriptPath, script.content, { mode: 0o755 });
  });
  
  // Store test script paths for use in tests
  process.env.E2E_TEST_SCRIPTS_DIR = testScriptsDir;
  
  console.log(`✅ E2E environment ready at: ${tempDir}`);
}