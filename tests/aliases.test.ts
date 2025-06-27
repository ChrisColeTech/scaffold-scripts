/**
 * Fast and reliable tests for all CLI aliases
 * Production-ready test suite for 400+ daily downloads
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';

const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

describe('CLI Aliases - Production Testing', () => {
  let tempDir: string;
  let testScriptPath: string;

  beforeAll(() => {
    // Build the project
    try {
      execSync('npm run build', { cwd: join(__dirname, '..'), stdio: 'pipe' });
    } catch (error) {
      console.warn('Build failed, tests may not work correctly');
    }
    
    // Create shared temp resources
    tempDir = mkdtempSync(join(tmpdir(), 'scaffold-alias-test-'));
    testScriptPath = join(tempDir, 'test-script.sh');
    writeFileSync(testScriptPath, '#!/bin/bash\necho "test script for aliases"');
  });

  afterAll(() => {
    // Clean up temp files
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    
    // Clean up any test scripts
    const cleanupNames = [
      'alias-test-add', 'alias-test-update', 'alias-test-remove', 
      'alias-test-view', 'alias-workflow', 'alias-platform-test'
    ];
    
    cleanupNames.forEach(name => {
      try {
        execSync(`node ${CLI_PATH} remove ${name}`, { stdio: 'pipe' });
      } catch {
        // Ignore if doesn't exist
      }
    });
  });

  describe('Core Alias Functionality', () => {
    it('should handle all aliases with proper error output', () => {
      const aliases = ['a', 'u', 'r', 's'];
      
      aliases.forEach(alias => {
        try {
          execSync(`node ${CLI_PATH} ${alias}`, { stdio: 'pipe' });
          fail(`Expected ${alias} to throw an error for missing arguments`);
        } catch (error: any) {
          const errorOutput = (error.stderr?.toString() || '') + (error.stdout?.toString() || '');
          
          // Should contain error message and help
          expect(errorOutput).toContain('Missing required arguments');
          expect(errorOutput).toContain(`scripts ${alias}`);
          expect(error.status).toBe(1);
        }
      });
    });

    it('should support add alias "a" identically to "add"', () => {
      // Test with alias
      const aliasResult = execSync(`node ${CLI_PATH} a alias-test-add "${testScriptPath}"`, { encoding: 'utf8' });
      expect(aliasResult).toContain('Added script "alias-test-add"');
      
      // Verify it was added
      const listResult = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      expect(listResult).toContain('alias-test-add');
      
      // Clean up
      execSync(`node ${CLI_PATH} remove alias-test-add`, { stdio: 'pipe' });
    });

    it('should support update alias "u" identically to "update"', () => {
      // Setup: add a script first
      execSync(`node ${CLI_PATH} add alias-test-update "${testScriptPath}"`, { stdio: 'pipe' });
      
      // Test update with alias
      const newScriptPath = join(tempDir, 'updated.sh');
      writeFileSync(newScriptPath, '#!/bin/bash\necho "updated"');
      
      const updateResult = execSync(`node ${CLI_PATH} u alias-test-update "${newScriptPath}"`, { encoding: 'utf8' });
      expect(updateResult).toContain('Updated script "alias-test-update"');
      
      // Clean up
      execSync(`node ${CLI_PATH} remove alias-test-update`, { stdio: 'pipe' });
    });

    it('should support remove alias "r" identically to "remove"', () => {
      // Setup: add a script first
      execSync(`node ${CLI_PATH} add alias-test-remove "${testScriptPath}"`, { stdio: 'pipe' });
      
      // Test remove with alias
      const removeResult = execSync(`node ${CLI_PATH} r alias-test-remove`, { encoding: 'utf8' });
      expect(removeResult).toContain('Removed script "alias-test-remove"');
      
      // Verify it was removed
      const listResult = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      expect(listResult).not.toContain('alias-test-remove');
    });

    it('should support view alias "s" identically to "view"', () => {
      // Setup: add a script first
      execSync(`node ${CLI_PATH} add alias-test-view "${testScriptPath}"`, { stdio: 'pipe' });
      
      // Test view with alias
      const viewResult = execSync(`node ${CLI_PATH} s alias-test-view`, { encoding: 'utf8' });
      expect(viewResult).toContain('Command Details: alias-test-view');
      
      // Clean up
      execSync(`node ${CLI_PATH} remove alias-test-view`, { stdio: 'pipe' });
    });

    it('should support list alias "l" identically to "list"', () => {
      const aliasResult = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8' });
      const fullResult = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      
      // Results should be identical
      expect(aliasResult).toBe(fullResult);
      
      // Should contain either "Available Scripts" or "No scripts available"
      const hasScripts = aliasResult.includes('Available Scripts');
      const noScripts = aliasResult.includes('No scripts available');
      expect(hasScripts || noScripts).toBe(true);
    });
  });

  describe('Critical Production Features', () => {
    it('should support complete workflow using only aliases', () => {
      const uniqueName = 'alias-workflow';
      
      try {
        // 1. Add with alias
        const addResult = execSync(`node ${CLI_PATH} a ${uniqueName} "${testScriptPath}"`, { encoding: 'utf8' });
        expect(addResult).toContain(`Added script "${uniqueName}"`);
        
        // 2. List with alias should show our script
        const listResult = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8' });
        expect(listResult).toContain(uniqueName);
        
        // 3. View with alias
        const viewResult = execSync(`node ${CLI_PATH} s ${uniqueName}`, { encoding: 'utf8' });
        expect(viewResult).toContain(`Command Details: ${uniqueName}`);
        
        // 4. Update with alias
        const newScript = join(tempDir, 'updated-workflow.sh');
        writeFileSync(newScript, '#!/bin/bash\necho "updated via alias"');
        const updateResult = execSync(`node ${CLI_PATH} u ${uniqueName} "${newScript}"`, { encoding: 'utf8' });
        expect(updateResult).toContain(`Updated script "${uniqueName}"`);
        
        // 5. Remove with alias
        const removeResult = execSync(`node ${CLI_PATH} r ${uniqueName}`, { encoding: 'utf8' });
        expect(removeResult).toContain(`Removed script "${uniqueName}"`);
        
        // 6. Verify cleanup
        const finalListResult = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8' });
        expect(finalListResult).not.toContain(uniqueName);
        
      } catch (error) {
        // Clean up on error
        try {
          execSync(`node ${CLI_PATH} remove ${uniqueName}`, { stdio: 'pipe' });
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    });

    it('should handle non-existent scripts gracefully', () => {
      const nonExistentName = 'non-existent-script-xyz-12345';
      
      // Test that commands don't crash on non-existent scripts
      expect(() => {
        execSync(`node ${CLI_PATH} r ${nonExistentName}`, { stdio: 'pipe' });
      }).not.toThrow();
      
      expect(() => {
        execSync(`node ${CLI_PATH} remove ${nonExistentName}`, { stdio: 'pipe' });
      }).not.toThrow();
      
      // Most important: aliases and full commands behave consistently
      const aliasResult = execSync(`node ${CLI_PATH} r ${nonExistentName}`, { encoding: 'utf8' });
      const fullResult = execSync(`node ${CLI_PATH} remove ${nonExistentName}`, { encoding: 'utf8' });
      expect(aliasResult).toBe(fullResult);
    });

    it('should support command options with aliases', () => {
      // Test platform option with add alias
      const result = execSync(`node ${CLI_PATH} a alias-platform-test "${testScriptPath}" --platform unix`, { encoding: 'utf8' });
      expect(result).toContain('Added script "alias-platform-test"');
      expect(result).toContain('Original Platform: unix');
      
      // Test detailed option with list alias
      const detailedResult = execSync(`node ${CLI_PATH} l --detailed`, { encoding: 'utf8' });
      expect(detailedResult).toContain('Available Scripts');
      
      // Clean up
      execSync(`node ${CLI_PATH} remove alias-platform-test`, { stdio: 'pipe' });
    });

    it('should maintain consistent behavior between aliases and full commands', () => {
      // Test that help commands work
      expect(() => execSync(`node ${CLI_PATH} add --help`, { stdio: 'pipe' })).not.toThrow();
      expect(() => execSync(`node ${CLI_PATH} a --help`, { stdio: 'pipe' })).not.toThrow();
      
      // Test that version works  
      const version1 = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
      const version2 = execSync(`node ${CLI_PATH} -v`, { encoding: 'utf8' });
      expect(version1).toBe(version2);
      
      // Test that list commands produce identical results
      const list1 = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      const list2 = execSync(`node ${CLI_PATH} l`, { encoding: 'utf8' });
      expect(list1).toBe(list2);
    });
  });

  describe('Error Resilience', () => {
    it('should handle rapid successive commands without issues', () => {
      const testName = 'rapid-test-script';
      
      try {
        // Rapid succession of commands
        execSync(`node ${CLI_PATH} a ${testName} "${testScriptPath}"`, { stdio: 'pipe' });
        execSync(`node ${CLI_PATH} l`, { stdio: 'pipe' });
        execSync(`node ${CLI_PATH} s ${testName}`, { stdio: 'pipe' });
        execSync(`node ${CLI_PATH} r ${testName}`, { stdio: 'pipe' });
        
        // Should not crash
        expect(true).toBe(true); // If we get here, all commands succeeded
        
      } catch (error) {
        // Clean up on error
        try {
          execSync(`node ${CLI_PATH} remove ${testName}`, { stdio: 'pipe' });
        } catch {
          // Ignore cleanup errors
        }
        throw error;
      }
    });

    it('should provide helpful feedback for common mistakes', () => {
      // Test common user mistakes
      const testCases = [
        { command: 'a', expectation: 'error for missing arguments' },
        { command: 'u', expectation: 'error for missing arguments' },
        { command: 'r', expectation: 'error for missing arguments' },
        { command: 's', expectation: 'error for missing arguments' }
      ];
      
      testCases.forEach(({ command, expectation }) => {
        try {
          execSync(`node ${CLI_PATH} ${command}`, { stdio: 'pipe' });
          fail(`Expected ${command} to fail with ${expectation}`);
        } catch (error: any) {
          // Should fail gracefully, not crash
          expect(error.status).toBe(1);
          expect(error).toBeDefined();
        }
      });
    });
  });
});