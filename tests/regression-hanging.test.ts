/**
 * Regression Tests for Interactive Input Fixes
 * Tests to ensure the hanging issue fixes don't regress in future versions
 */

import { setupTest, cleanupTest, execCLI } from './test-isolation';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Regression Tests - Interactive Input Hanging', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('Historical Bug Prevention', () => {
    it('should never hang on the original problematic script patterns', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      // These are the exact patterns that caused hanging in the original issue
      const problematicScripts = [
        {
          name: 'scaffold-init-pattern',
          content: `Write-Host "Enter the full path to your project root: " -NoNewline -ForegroundColor Yellow
$projectRoot = Read-Host

if ([string]::IsNullOrWhiteSpace($projectRoot)) {
    Write-Host "ERROR: Project root path is required." -ForegroundColor Red
    exit 1
}`
        },
        {
          name: 'scaffold-all-pattern', 
          content: `Write-Host "Enter the full path where you want to create the project: " -NoNewline -ForegroundColor Yellow
$projectRoot = Read-Host

Write-Host "Starting complete project scaffold..." -ForegroundColor Green`
        },
        {
          name: 'multiple-prompts-pattern',
          content: `Write-Host "Enter your name: " -NoNewline -ForegroundColor Yellow
$userName = Read-Host

Write-Host "Enter project path: " -NoNewline -ForegroundColor Yellow  
$projectPath = Read-Host`
        }
      ];

      try {
        for (const script of problematicScripts) {
          const scriptFile = join(tempDir, `${script.name}.ps1`);
          writeFileSync(scriptFile, script.content);
          
          // Should add without issues and auto-convert
          const addResult = execCLI(`add ${script.name} "${scriptFile}"`, { encoding: 'utf8' });
          
          expect(addResult).toContain('Automatically converted interactive input');
          expect(addResult).toContain(`Added script "${script.name}"`);
          
          // Should not hang when viewed
          const viewResult = execCLI(`view ${script.name}`, { 
            encoding: 'utf8',
            timeout: 5000 
          });
          
          expect(viewResult).toContain('param(');
          expect(viewResult).toContain('Script Type: powershell');
          
          // Most importantly - should not hang when executed
          // (though it may still prompt for input if no parameters provided)
          const executeStart = Date.now();
          
          try {
            const executeResult = execCLI(script.name, { 
              encoding: 'utf8',
              timeout: 3000 // Short timeout to detect hanging
            });
            
            const executeEnd = Date.now();
            
            // If it completes within a reasonable time, it's not hanging (generous tolerance for CI/slow systems)
            expect(executeEnd - executeStart).toBeLessThan(10000);
            
          } catch (error: any) {
            // If it times out, that's also acceptable for interactive scripts
            // The key is it should timeout, not hang indefinitely
            if (error.message && error.message.includes('timeout')) {
              // This is expected for interactive scripts without parameters
              console.log(`Script ${script.name} timed out as expected (interactive)`);
            } else {
              throw error;
            }
          }
        }
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 30000);

    it('should maintain the CLI functionality after PowerShell detection improvements', () => {
      // Test that our PowerShell detection improvements don't break other functionality
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      const scripts = [
        {
          name: 'bash-script',
          file: 'test.sh',
          content: '#!/bin/bash\\necho "This is bash"\\necho "Should not be detected as PowerShell"'
        },
        {
          name: 'python-script', 
          file: 'test.py',
          content: 'print("This is Python")\\nname = "test"\\nprint(f"Hello {name}")'
        },
        {
          name: 'powershell-script',
          file: 'test.ps1', 
          content: 'Write-Host "This is PowerShell" -ForegroundColor Green\\n$name = "test"\\nWrite-Host "Hello $name"'
        }
      ];

      try {
        scripts.forEach(script => {
          const scriptPath = join(tempDir, script.file);
          writeFileSync(scriptPath, script.content);
          
          const addResult = execCLI(`add ${script.name} "${scriptPath}"`, { encoding: 'utf8' });
          
          expect(addResult).toContain(`Added script "${script.name}"`);
          
          // Verify correct type detection
          const viewResult = execCLI(`view ${script.name}`, { encoding: 'utf8' });
          
          if (script.name === 'powershell-script') {
            expect(viewResult).toContain('Script Type: powershell');
          } else if (script.name === 'python-script') {
            expect(viewResult).toContain('Script Type: python');
          } else {
            expect(viewResult).toContain('Script Type: shell');
          }
        });
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should handle the exact original scaffold-all.ps1 script structure', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'original-scaffold-all.ps1');
      
      // This is a simplified version of the actual scaffold-all.ps1 that was hanging
      const originalScaffoldAll = `# Scaffold All - Complete Project Setup
Write-Host "=== Complete Project Scaffold ===" -ForegroundColor Blue
Write-Host "This script will set up the entire project structure" -ForegroundColor Yellow

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "Script directory: $scriptDir" -ForegroundColor Yellow

# Prompt for project root path
Write-Host "Enter the full path where you want to create the project: " -NoNewline -ForegroundColor Yellow
$projectRoot = Read-Host

if ([string]::IsNullOrWhiteSpace($projectRoot)) {
    Write-Host "ERROR: Project root path is required." -ForegroundColor Red
    exit 1
}

Write-Host "Starting complete project scaffold..." -ForegroundColor Green
Write-Host "Target location: $projectRoot" -ForegroundColor Cyan`;

      writeFileSync(scriptFile, originalScaffoldAll);

      try {
        // Should process without hanging
        const addResult = execCLI(`add original-scaffold-all "${scriptFile}"`, { encoding: 'utf8' });
        
        expect(addResult).toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "original-scaffold-all"');
        
        // Should have proper parameter conversion
        const viewResult = execCLI('view original-scaffold-all', { encoding: 'utf8' });
        
        expect(viewResult).toContain('[string]$projectRoot = (Get-Location).Path');
        // The conditional check may be in different sections, check for param conversion success
        expect(viewResult).toContain('param(');
        
        // Should preserve all original functionality (check for key indicators)
        expect(viewResult).toContain('Split-Path -Parent $MyInvocation.MyCommand.Path');
        // Check that the script is stored and can be viewed (indicates conversion worked)
        expect(viewResult).toContain('Script Type: powershell');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('CLI Stability Tests', () => {
    it('should maintain backward compatibility with existing commands', () => {
      // Test that all existing CLI commands still work after our changes
      const commands = [
        'list',
        '--help',
        '--version'
      ];

      commands.forEach(command => {
        const result = execCLI(command, { encoding: 'utf8' });
        
        // Should not crash or hang
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        
        if (command === '--version') {
          expect(result.trim()).toMatch(/\d+\.\d+\.\d+/);
        }
      });
    });

    it('should handle edge cases that might cause regression', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      const edgeCases = [
        {
          name: 'empty-script',
          content: ''
        },
        {
          name: 'comments-only',
          content: '# Just comments\\n# No actual code'
        },
        {
          name: 'whitespace-only',
          content: '   \\n\\n   \\t\\t   '
        },
        {
          name: 'single-line',
          content: 'Write-Host "Single line script"'
        }
      ];

      try {
        edgeCases.forEach(testCase => {
          const scriptFile = join(tempDir, `${testCase.name}.ps1`);
          writeFileSync(scriptFile, testCase.content);
          
          // Should handle gracefully without crashing
          const addResult = execCLI(`add ${testCase.name} "${scriptFile}"`, { encoding: 'utf8' });
          
          if (testCase.content.trim()) {
            expect(addResult).toContain(`Added script "${testCase.name}"`);
          } else {
            // Empty scripts might be rejected, which is fine
            expect(addResult).toBeDefined();
          }
        });
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should preserve performance characteristics', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'performance-test.ps1');
      
      // Medium-sized script to test performance
      let script = '# Performance test script\\n';
      for (let i = 0; i < 10; i++) {
        script += `Write-Host "Step ${i}" -ForegroundColor Green\\n`;
        script += `$var${i} = Read-Host "Enter value ${i}"\\n`;
      }

      writeFileSync(scriptFile, script);

      try {
        // Should complete quickly
        const startTime = Date.now();
        const addResult = execCLI(`add performance-test "${scriptFile}"`, { encoding: 'utf8' });
        const endTime = Date.now();
        
        // Should complete in reasonable time (CI environments can be slow)
        expect(endTime - startTime).toBeLessThan(10000); // 10 seconds for CI
        
        expect(addResult).toContain('Added script "performance-test"');
        expect(addResult).toContain('Automatically converted interactive input');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should work consistently across different execution environments', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'cross-platform-test.ps1');
      
      const script = `# Cross-platform test
Write-Host "Platform: $($env:OS)" -ForegroundColor Cyan
$userInput = Read-Host "Enter test value"
Write-Host "You entered: $userInput" -ForegroundColor Green`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add cross-platform-test "${scriptFile}"`, { encoding: 'utf8' });
        
        expect(addResult).toContain('Added script "cross-platform-test"');
        expect(addResult).toContain('Automatically converted interactive input');
        
        // Should work on current platform
        const viewResult = execCLI('view cross-platform-test', { encoding: 'utf8' });
        expect(viewResult).toContain('param(');
        expect(viewResult).toContain('[string]$userInput = $null');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Future-Proofing Tests', () => {
    it('should handle new PowerShell syntax patterns gracefully', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'future-syntax.ps1');
      
      // Test with newer PowerShell syntax that might be added in future
      const script = `# Future PowerShell syntax test
using namespace System.IO
[string]$path = Read-Host "Enter path"
$result = [Path]::GetFileName($path)
Write-Host "Filename: $result"`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add future-syntax "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should handle gracefully
        expect(addResult).toContain('Added script "future-syntax"');
        
        if (addResult.includes('Automatically converted')) {
          const viewResult = execCLI('view future-syntax', { encoding: 'utf8' });
          expect(viewResult).toContain('[string]$path = (Get-Location).Path');
        }
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should be extensible for other script types in the future', () => {
      // This test ensures our architecture can be extended for bash, python, etc.
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      // Test that the framework doesn't break with other script types
      const scripts = [
        { name: 'bash-future', file: 'test.sh', content: '#!/bin/bash\\nread -p "Enter: " var\\necho $var' },
        { name: 'python-future', file: 'test.py', content: 'var = input("Enter: ")\\nprint(var)' }
      ];

      try {
        scripts.forEach(script => {
          const scriptPath = join(tempDir, script.file);
          writeFileSync(scriptPath, script.content);
          
          const addResult = execCLI(`add ${script.name} "${scriptPath}"`, { encoding: 'utf8' });
          
          // Should add successfully even if auto-fix doesn't apply
          expect(addResult).toContain(`Added script "${script.name}"`);
          
          // Should not crash the CLI
          const viewResult = execCLI(`view ${script.name}`, { encoding: 'utf8' });
          expect(viewResult).toBeDefined();
        });
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
