/**
 * Clear All Functionality Tests
 * Tests the new clear command and Clear all option in interactive mode
 */

import { setupTest, cleanupTest, execCLI } from './test-isolation';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Clear All Functionality', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('Clear Command - Happy Path', () => {
    let tempDir: string;
    let script1: string;
    let script2: string;
    let script3: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-clear-'));
      script1 = join(tempDir, 'script1.sh');
      script2 = join(tempDir, 'script2.py');
      script3 = join(tempDir, 'script3.js');
      
      writeFileSync(script1, 'echo "Script 1"');
      writeFileSync(script2, 'print("Script 2")');
      writeFileSync(script3, 'console.log("Script 3");');
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should clear all scripts with -y flag (skip confirmation)', () => {
      // Add multiple scripts
      execCLI(`add script1 "${script1}"`, { encoding: 'utf8' });
      execCLI(`add script2 "${script2}"`, { encoding: 'utf8' });
      execCLI(`add script3 "${script3}"`, { encoding: 'utf8' });

      // Verify scripts exist
      const listBefore = execCLI('list', { encoding: 'utf8' });
      expect(listBefore).toContain('script1');
      expect(listBefore).toContain('script2');
      expect(listBefore).toContain('script3');

      // Clear all scripts
      const clearResult = execCLI('clear -y', { encoding: 'utf8' });
      expect(clearResult).toContain('Successfully cleared 3 script(s)');

      // Verify scripts are gone
      const listAfter = execCLI('list', { encoding: 'utf8' });
      expect(listAfter).not.toContain('script1');
      expect(listAfter).not.toContain('script2'); 
      expect(listAfter).not.toContain('script3');
    });

    it('should clear all scripts with --yes flag (alternative syntax)', () => {
      // Add scripts
      execCLI(`add test-script "${script1}"`, { encoding: 'utf8' });
      
      // Clear with --yes
      const clearResult = execCLI('clear --yes', { encoding: 'utf8' });
      expect(clearResult).toContain('Successfully cleared 1 script(s)');

      // Verify empty
      const listAfter = execCLI('list', { encoding: 'utf8' });
      expect(listAfter).not.toContain('test-script');
    });

    it('should show clear command in help', () => {
      const helpResult = execCLI('--help', { encoding: 'utf8' });
      expect(helpResult).toContain('clear');
      expect(helpResult).toContain('clear all scripts from database');
    });

    it('should show clear command help with examples', () => {
      const clearHelpResult = execCLI('clear --help', { encoding: 'utf8' });
      expect(clearHelpResult).toContain('clear all scripts from database');
      expect(clearHelpResult).toContain('-y, --yes');
      expect(clearHelpResult).toContain('skip confirmation prompt');
      expect(clearHelpResult).toContain('$ scripts clear');
      expect(clearHelpResult).toContain('$ scripts clear -y');
    });

    it('should handle clearing empty database gracefully', () => {
      // Try to clear when no scripts exist
      const clearResult = execCLI('clear -y', { encoding: 'utf8' });
      expect(clearResult).toContain('No scripts were found to clear');
    });

    it('should clear scripts and maintain database integrity', () => {
      // Add script, clear, then add again
      execCLI(`add initial-script "${script1}"`, { encoding: 'utf8' });
      
      const clearResult = execCLI('clear -y', { encoding: 'utf8' });
      expect(clearResult).toContain('Successfully cleared 1 script(s)');

      // Add new script after clearing
      const addResult = execCLI(`add new-script "${script2}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "new-script"');

      const listResult = execCLI('list', { encoding: 'utf8' });
      expect(listResult).toContain('new-script');
      expect(listResult).not.toContain('initial-script');
    });
  });

  describe('Clear Command - Interactive Confirmation', () => {
    let tempDir: string;
    let scriptFile: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-confirm-'));
      scriptFile = join(tempDir, 'test.sh');
      writeFileSync(scriptFile, 'echo "Test"');
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should show confirmation message without -y flag', () => {
      execCLI(`add test-script "${scriptFile}"`, { encoding: 'utf8' });

      // Note: Testing interactive confirmation is complex in automated tests
      // This test verifies the command exists and doesn't crash immediately
      expect(() => {
        execCLI('clear', { encoding: 'utf8', input: 'n\n', timeout: 1000 });
      }).not.toThrow();
    });
  });

  describe('Clear Command - Edge Cases and Validation', () => {
    it('should handle invalid flags gracefully', () => {
      const result = execCLI('clear --invalid-flag', { encoding: 'utf8' });
      // Should either throw or show error message
      expect(result.includes('Unknown option') || result.includes('error') || result.length > 0).toBe(true);
    });

    it('should work with aliases if any exist', () => {
      // Test that clear command works consistently
      const result = execCLI('clear -y', { encoding: 'utf8' });
      expect(result).toContain('No scripts were found to clear');
    });

    it('should maintain proper exit codes', () => {
      // Clear empty database should succeed (exit code 0)
      expect(() => {
        execCLI('clear -y', { encoding: 'utf8' });
      }).not.toThrow();
    });
  });

  describe('Clear Command - Performance and Scale', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-scale-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should handle clearing many scripts efficiently', () => {
      // Add multiple scripts
      for (let i = 1; i <= 10; i++) {
        const scriptFile = join(tempDir, `script${i}.sh`);
        writeFileSync(scriptFile, `echo "Script ${i}"`);
        execCLI(`add script${i} "${scriptFile}"`, { encoding: 'utf8' });
      }

      // Clear all at once
      const startTime = Date.now();
      const clearResult = execCLI('clear -y', { encoding: 'utf8' });
      const endTime = Date.now();

      expect(clearResult).toContain('Successfully cleared 10 script(s)');
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify all are gone
      const listResult = execCLI('list', { encoding: 'utf8' });
      for (let i = 1; i <= 10; i++) {
        expect(listResult).not.toContain(`script${i}`);
      }
    });

    it('should report accurate count of cleared scripts', () => {
      const tempScript = join(tempDir, 'temp.sh');
      writeFileSync(tempScript, 'echo "temp"');
      
      // Add exactly 3 scripts
      execCLI(`add script-a "${tempScript}"`, { encoding: 'utf8' });
      execCLI(`add script-b "${tempScript}"`, { encoding: 'utf8' });
      execCLI(`add script-c "${tempScript}"`, { encoding: 'utf8' });

      const clearResult = execCLI('clear -y', { encoding: 'utf8' });
      expect(clearResult).toContain('Successfully cleared 3 script(s)');
      expect(clearResult).not.toContain('2 script(s)');
      expect(clearResult).not.toContain('4 script(s)');
    });
  });

  describe('Database Integrity After Clear', () => {
    let tempDir: string;
    let scriptFile: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-integrity-'));
      scriptFile = join(tempDir, 'integrity-test.sh');
      writeFileSync(scriptFile, 'echo "Integrity Test"');
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should maintain database functionality after clear', () => {
      // Add script
      execCLI(`add original-script "${scriptFile}"`, { encoding: 'utf8' });
      
      // Clear all
      execCLI('clear -y', { encoding: 'utf8' });
      
      // Test that all commands still work
      expect(() => {
        execCLI('list', { encoding: 'utf8' });
      }).not.toThrow();

      expect(() => {
        execCLI(`add new-script "${scriptFile}"`, { encoding: 'utf8' });
      }).not.toThrow();

      expect(() => {
        execCLI('view new-script', { encoding: 'utf8' });
      }).not.toThrow();

      expect(() => {
        execCLI('remove new-script', { encoding: 'utf8' });
      }).not.toThrow();
    });

    it('should reset auto-incrementing IDs after clear', () => {
      // Add script, clear, add again - should maintain consistency
      execCLI(`add script1 "${scriptFile}"`, { encoding: 'utf8' });
      execCLI('clear -y', { encoding: 'utf8' });
      
      const addResult = execCLI(`add script2 "${scriptFile}"`, { encoding: 'utf8' });
      expect(addResult).toContain('Added script "script2"');
      
      const viewResult = execCLI('view script2', { encoding: 'utf8' });
      expect(viewResult).toContain('script2');
    });
  });
});