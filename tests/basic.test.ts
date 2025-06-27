/**
 * Basic smoke tests for Scaffold Scripts CLI
 */

import { execSync } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

describe('Scaffold Scripts CLI - Smoke Tests', () => {
  beforeAll(() => {
    // Build the project
    try {
      execSync('npm run build', { cwd: join(__dirname, '..'), stdio: 'pipe' });
    } catch (error) {
      console.warn('Build failed, tests may not work correctly');
    }
  });

  it('should show help without crashing', () => {
    const result = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf8' });
    expect(result).toContain('scaffold');
  });

  it('should show version without crashing', () => {
    const result = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
    expect(result).toMatch(/\d+\.\d+\.\d+/);
  });

  it('should support -v for version', () => {
    const result = execSync(`node ${CLI_PATH} -v`, { encoding: 'utf8' });
    expect(result).toMatch(/\d+\.\d+\.\d+/);
    
    // Test that -v and --version produce same output
    const longResult = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
    expect(result).toBe(longResult);
  });

  it('should handle list command without crashing', () => {
    expect(() => {
      execSync(`node ${CLI_PATH} list`, { stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should verify scripts alias is configured', () => {
    // Test that our package.json has the right aliases
    const packageJson = require('../package.json');
    expect(packageJson.bin.scripts).toBe('./bin/scaffold.js');
    expect(packageJson.bin.scaffold).toBe('./bin/scaffold.js');
    // sc alias should not exist (conflicts with Windows Service Control)
    expect(packageJson.bin.sc).toBeUndefined();
  });

  it('should support ALL command aliases correctly', () => {
    // Test every single alias to ensure they work exactly like their full commands
    let result;
    
    // Test 'a' alias for 'add' command
    try {
      execSync(`node ${CLI_PATH} a`, { stdio: 'pipe' });
    } catch (error: any) {
      result = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(result).toContain('missing required argument');
      expect(result).not.toContain('unknown option');
      expect(result).not.toContain('unknown command');
    }
    
    // Test 'add' full command produces same error
    try {
      execSync(`node ${CLI_PATH} add`, { stdio: 'pipe' });
    } catch (error: any) {
      const addResult = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(addResult).toContain('missing required argument');
      // Both should produce similar error messages
      expect(addResult).toContain('name');
    }
    
    // Test 'u' alias for 'update' command
    try {
      execSync(`node ${CLI_PATH} u`, { stdio: 'pipe' });
    } catch (error: any) {
      result = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(result).toContain('missing required argument');
      expect(result).not.toContain('unknown option');
      expect(result).not.toContain('unknown command');
    }
    
    // Test 'update' full command produces same error
    try {
      execSync(`node ${CLI_PATH} update`, { stdio: 'pipe' });
    } catch (error: any) {
      const updateResult = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(updateResult).toContain('missing required argument');
    }
    
    // Test 'r' alias for 'remove' command
    try {
      execSync(`node ${CLI_PATH} r`, { stdio: 'pipe' });
    } catch (error: any) {
      result = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(result).toContain('missing required argument');
      expect(result).not.toContain('unknown option');
      expect(result).not.toContain('unknown command');
    }
    
    // Test 'remove' full command produces same error
    try {
      execSync(`node ${CLI_PATH} remove`, { stdio: 'pipe' });
    } catch (error: any) {
      const removeResult = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(removeResult).toContain('missing required argument');
    }
    
    // Test 'l' alias for 'list' command - should work without error
    expect(() => {
      execSync(`node ${CLI_PATH} l`, { stdio: 'pipe' });
    }).not.toThrow();
    
    // Test 'list' full command - should work without error
    expect(() => {
      execSync(`node ${CLI_PATH} list`, { stdio: 'pipe' });
    }).not.toThrow();
    
    // Verify 'l' and 'list' produce same output
    const lResult = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8', stdio: 'pipe' });
    const listResult = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8', stdio: 'pipe' });
    expect(lResult).toBe(listResult);
    
    // Test 's' alias for 'view' command - should show error for missing arguments
    try {
      execSync(`node ${CLI_PATH} s`, { stdio: 'pipe' });
    } catch (error: any) {
      result = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(result).toContain('missing required argument');
      expect(result).not.toContain('unknown option');
      expect(result).not.toContain('unknown command');
    }
    
    // Test 'view' full command produces same error
    try {
      execSync(`node ${CLI_PATH} view`, { stdio: 'pipe' });
    } catch (error: any) {
      const viewResult = error.stdout?.toString() || error.stderr?.toString() || '';
      expect(viewResult).toContain('missing required argument');
    }
  });

  it('should reject old-style flag syntax', () => {
    // Test that -a, -u, -r, -l are rejected as unknown options
    // Note: -v is now valid for version, so it's excluded from this test
    const oldFlags = ['-a', '-u', '-r', '-l'];
    
    for (const flag of oldFlags) {
      try {
        execSync(`node ${CLI_PATH} ${flag} test-name test-file`, { stdio: 'pipe' });
        fail(`Expected ${flag} to be rejected as unknown option`);
      } catch (error: any) {
        const result = error.stdout?.toString() || error.stderr?.toString() || '';
        expect(result).toContain('unknown option');
        expect(result).toContain(flag);
      }
    }
  });

  it('should perform full workflow with aliases', () => {
    // Test complete add -> list -> remove workflow using aliases
    const { writeFileSync, rmSync, mkdtempSync } = require('fs');
    const { tmpdir } = require('os');
    const { join } = require('path');
    
    const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
    const scriptFile = join(tempDir, 'test-script.sh');
    writeFileSync(scriptFile, '#!/bin/bash\necho "test script"');
    
    try {
      // Test adding with alias 'a'
      const addResult = execSync(`node ${CLI_PATH} a test-workflow "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-workflow"');
      
      // Test listing with alias 'l' shows our script
      const listResult = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8' });
      expect(listResult).toContain('test-workflow');
      
      // Test removing with alias 'r'
      const removeResult = execSync(`node ${CLI_PATH} r test-workflow`, { encoding: 'utf8' });
      expect(removeResult).toContain('Removed script "test-workflow"');
      
      // Test listing again should not show our script
      const listAfterRemove = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8' });
      expect(listAfterRemove).not.toContain('test-workflow');
      
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should perform same workflow with full commands', () => {
    // Test same workflow using full command names for comparison
    const { writeFileSync, rmSync, mkdtempSync } = require('fs');
    const { tmpdir } = require('os');
    const { join } = require('path');
    
    const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
    const scriptFile = join(tempDir, 'test-script2.sh');
    writeFileSync(scriptFile, '#!/bin/bash\necho "test script 2"');
    
    try {
      // Test adding with full command
      const addResult = execSync(`node ${CLI_PATH} add test-full-workflow "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-full-workflow"');
      
      // Test listing with full command
      const listResult = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      expect(listResult).toContain('test-full-workflow');
      
      // Test removing with full command
      const removeResult = execSync(`node ${CLI_PATH} remove test-full-workflow`, { encoding: 'utf8' });
      expect(removeResult).toContain('Removed script "test-full-workflow"');
      
      // Test listing again should not show our script
      const listAfterRemove = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      expect(listAfterRemove).not.toContain('test-full-workflow');
      
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should reject binary files', () => {
    // Test file type validation works
    const { writeFileSync, rmSync, mkdtempSync } = require('fs');
    const { tmpdir } = require('os');
    const { join } = require('path');
    
    const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
    const binaryFile = join(tempDir, 'test-binary.exe');
    writeFileSync(binaryFile, 'text content'); // Text content but binary extension
    
    const result = execSync(`node ${CLI_PATH} add test-binary "${binaryFile}" 2>&1`, { encoding: 'utf8' });
    expect(result).toContain('Binary file type not supported');
    expect(result).toContain('.exe');
    
    rmSync(tempDir, { recursive: true, force: true });
  });
});