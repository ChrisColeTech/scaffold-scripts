/**
 * Version Selection Feature Tests
 * Tests the new --original, --converted, --windows, --unix, --cross-platform flags
 */

import { setupTest, cleanupTest, execCLI } from './test-isolation';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Version Selection Features', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('Version Selection Flags - Happy Path', () => {
    let tempDir: string;
    let scriptFile: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-version-'));
      scriptFile = join(tempDir, 'test-script.sh');
      writeFileSync(scriptFile, 'echo "Hello Version Test"');
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should run original version with --original flag', () => {
      const addResult = execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-script"');

      const runResult = execCLI('test-script --original', { encoding: 'utf8' });
      expect(runResult).toContain('Using original version');
      expect(runResult).toContain('Hello Version Test');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should run converted version with --converted flag', () => {
      const addResult = execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-script"');

      const runResult = execCLI('test-script --converted', { encoding: 'utf8' });
      expect(runResult).toContain('Using converted version');
      expect(runResult).toContain('Hello Version Test');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should run Windows version with --windows flag', () => {
      const addResult = execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-script"');

      const runResult = execCLI('test-script --windows', { encoding: 'utf8' });
      expect(runResult).toContain('Using Windows version');
      expect(runResult).toContain('Hello Version Test');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should run Unix version with --unix flag', () => {
      const addResult = execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-script"');

      const runResult = execCLI('test-script --unix', { encoding: 'utf8' });
      expect(runResult).toContain('Using Unix version');
      expect(runResult).toContain('Hello Version Test');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should run cross-platform version with --cross-platform flag', () => {
      const addResult = execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-script"');

      const runResult = execCLI('test-script --cross-platform', { encoding: 'utf8' });
      expect(runResult).toContain('Using cross-platform version');
      expect(runResult).toContain('Hello Version Test');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should show version selection flags in help', () => {
      const helpResult = execCLI('--help', { encoding: 'utf8' });
      expect(helpResult).toContain('--original');
      expect(helpResult).toContain('--converted');
      expect(helpResult).toContain('--windows');
      expect(helpResult).toContain('--unix');
      expect(helpResult).toContain('--cross-platform');
    });
  });

  describe('Version Selection Flags - Edge Cases', () => {
    let tempDir: string;
    let scriptFile: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-edge-'));
      scriptFile = join(tempDir, 'edge-script.sh');
      writeFileSync(scriptFile, 'echo "Edge Case Test"');
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should fall back to original when Windows version not available', () => {
      // Create a simple script that might not generate all versions
      const simpleScript = join(tempDir, 'simple.py');
      writeFileSync(simpleScript, 'print("Simple Python")');
      
      const addResult = execCLI(`add simple-script "${simpleScript}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "simple-script"');

      const runResult = execCLI('simple-script --windows', { encoding: 'utf8' });
      // Should either use Windows version or fall back gracefully
      expect(runResult).toContain('Script completed successfully');
    });

    it('should handle Python scripts with Unix flag correctly', () => {
      const simpleScript = join(tempDir, 'simple.py');
      writeFileSync(simpleScript, 'print("Simple Python")');
      
      const addResult = execCLI(`add simple-script "${simpleScript}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "simple-script"');

      const runResult = execCLI('simple-script --unix', { encoding: 'utf8' });
      // Should use Unix version with correct Python script type
      expect(runResult).toContain('Using Unix version');
      expect(runResult).toContain('Using script type: python');
      expect(runResult).toContain('Simple Python');
    });

    it('should handle multiple version flags gracefully', () => {
      const addResult = execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "test-script"');

      // Test with multiple flags - should use the first one that applies
      const runResult = execCLI('test-script --original --windows', { encoding: 'utf8' });
      expect(runResult).toContain('Using original version');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should work with non-existent script name', () => {
      const result = execCLI('non-existent-script --original', { encoding: 'utf8' });
      expect(result).toContain('No scripts available');
    });
  });

  describe('Version Selection with Different Script Types', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-types-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should handle PowerShell scripts with version selection', () => {
      const psScript = join(tempDir, 'test.ps1');
      writeFileSync(psScript, 'Write-Output "PowerShell Test"');
      
      const addResult = execCLI(`add ps-script "${psScript}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "ps-script"');

      const runResult = execCLI('ps-script --original', { encoding: 'utf8' });
      expect(runResult).toContain('Using original version');
      expect(runResult).toContain('Script completed successfully');
    });

    it('should handle Python scripts with version selection', () => {
      const pyScript = join(tempDir, 'test.py');
      writeFileSync(pyScript, 'print("Python Test")');
      
      const addResult = execCLI(`add py-script "${pyScript}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "py-script"');

      const runResult = execCLI('py-script --converted', { encoding: 'utf8' });
      expect(runResult).toContain('Script completed successfully');
    });

    it('should handle JavaScript scripts with version selection', () => {
      const jsScript = join(tempDir, 'test.js');
      writeFileSync(jsScript, 'console.log("JavaScript Test");');
      
      const addResult = execCLI(`add js-script "${jsScript}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "js-script"');

      const runResult = execCLI('js-script --original', { encoding: 'utf8' });
      expect(runResult).toContain('Using original version');
      expect(runResult).toContain('JavaScript Test');
    });
  });

  describe('Version Selection Validation', () => {
    it('should reject invalid version flags', () => {
      const result = execCLI('some-script --invalid-version', { encoding: 'utf8' });
      expect(result).toContain('Unknown option');
    });

    it('should show error for unknown options', () => {
      const result = execCLI('--unknown-flag', { encoding: 'utf8' });
      expect(result).toContain('Unknown option');
    });

    it('should handle version flags without script name', () => {
      const result = execCLI('--original', { encoding: 'utf8' });
      // Should go into interactive mode or show available scripts
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});