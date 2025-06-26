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

  it('should handle list command without crashing', () => {
    expect(() => {
      execSync(`node ${CLI_PATH} list`, { stdio: 'pipe' });
    }).not.toThrow();
  });

  it('should verify sc and scripts aliases are configured', () => {
    // Test that our package.json has the right aliases
    const packageJson = require('../package.json');
    expect(packageJson.bin.sc).toBe('./bin/scaffold.js');
    expect(packageJson.bin.scripts).toBe('./bin/scaffold.js');
    expect(packageJson.bin.scaffold).toBe('./bin/scaffold.js');
  });

  it('should reject binary files', () => {
    // Test file type validation works
    const { writeFileSync, rmSync } = require('fs');
    const binaryFile = '/tmp/test-binary.exe';
    writeFileSync(binaryFile, 'text content'); // Text content but binary extension
    
    const result = execSync(`node ${CLI_PATH} add test-binary "${binaryFile}" 2>&1`, { encoding: 'utf8' });
    expect(result).toContain('Binary file type not supported');
    expect(result).toContain('.exe');
    
    rmSync(binaryFile, { force: true });
  });
});