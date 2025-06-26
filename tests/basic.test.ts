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
});