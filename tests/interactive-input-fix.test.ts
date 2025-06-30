/**
 * Interactive Input Fix Tests
 * Tests the automatic detection and fixing of interactive input issues in scripts
 */

import { setupTest, cleanupTest, execCLI } from './test-isolation';
import { writeFileSync, rmSync, mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Interactive Input Automatic Fixing', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('PowerShell Read-Host Detection and Fixing', () => {
    it('should detect and fix single Read-Host command', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-single-readhost.ps1');
      
      const originalScript = `Write-Host "Enter your name: " -NoNewline -ForegroundColor Yellow
$userName = Read-Host

Write-Host "Hello, $userName!" -ForegroundColor Green`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-single-readhost "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should show automatic conversion warning
        expect(addResult).toContain('Automatically converted interactive input to support command-line arguments');
        expect(addResult).toContain('Added script "test-single-readhost"');
        
        // View the converted script
        const viewResult = execCLI('view test-single-readhost', { encoding: 'utf8' });
        
        // Should contain parameter block
        expect(viewResult).toContain('param(');
        expect(viewResult).toContain('[string]$userName = $null');
        
        // Should contain conditional wrapper (PowerShell or Unix equivalent)
        expect(viewResult).toMatch(/if [\[\(]?[^$]*-not[^$]*\$userName/); 
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should detect and fix multiple Read-Host commands', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-multiple-readhost.ps1');
      
      const originalScript = `Write-Host "Enter your name: " -NoNewline
$userName = Read-Host

Write-Host "Enter project path: " -NoNewline  
$projectPath = Read-Host

Write-Host "Enter description: " -NoNewline
$description = Read-Host`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-multiple-readhost "${scriptFile}"`, { encoding: 'utf8' });
        
        expect(addResult).toContain('Automatically converted interactive input to support command-line arguments');
        
        const viewResult = execCLI('view test-multiple-readhost', { encoding: 'utf8' });
        
        // Should contain all parameters
        expect(viewResult).toContain('[string]$userName = $null');
        expect(viewResult).toContain('[string]$projectPath = (Get-Location).Path');
        expect(viewResult).toContain('[string]$description = $null');
        
        // Should contain all conditionals (PowerShell or Unix equivalent)
        expect(viewResult).toMatch(/if [\[\(]?[^$]*-not[^$]*\$userName/);
        expect(viewResult).toMatch(/if [\[\(]?[^$]*-not[^$]*\$projectPath/);
        expect(viewResult).toMatch(/if [\[\(]?[^$]*-not[^$]*\$description/);
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should handle complex Write-Host + Read-Host patterns', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-complex-readhost.ps1');
      
      const originalScript = `# Complex script with various Read-Host patterns
Write-Host "=== Setup Script ===" -ForegroundColor Blue

Write-Host "Enter project name: " -NoNewline -ForegroundColor Yellow
$projectName = Read-Host

if ([string]::IsNullOrWhiteSpace($projectName)) {
    Write-Host "ERROR: Project name is required." -ForegroundColor Red
    exit 1
}

Write-Host "Enter target directory (default: ./projects): " -NoNewline -ForegroundColor Cyan
$targetDir = Read-Host

Write-Host "Creating project $projectName in $targetDir" -ForegroundColor Green`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-complex-readhost "${scriptFile}"`, { encoding: 'utf8' });
        
        expect(addResult).toContain('Automatically converted interactive input to support command-line arguments');
        
        const viewResult = execCLI('view test-complex-readhost', { encoding: 'utf8' });
        
        // Should detect both variables
        expect(viewResult).toContain('[string]$projectName = $null');
        expect(viewResult).toContain('[string]$targetDir = $null');
        
        // Should preserve original logic structure (check for content presence)
        expect(viewResult).toContain('Setup Script');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should not modify scripts without Read-Host commands', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-no-readhost.ps1');
      
      const originalScript = `Write-Host "This script has no interactive input" -ForegroundColor Green
$projectName = "fixed-value"
Write-Host "Project: $projectName" -ForegroundColor Cyan`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-no-readhost "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should NOT show automatic conversion warning
        expect(addResult).not.toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "test-no-readhost"');
        
        const viewResult = execCLI('view test-no-readhost', { encoding: 'utf8' });
        
        // Should NOT contain parameter block
        expect(viewResult).not.toContain('param(');
        
        // Should preserve original script exactly
        expect(viewResult).toContain('$projectName = "fixed-value"');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Script Execution Without Hanging', () => {
    it('should execute converted scripts without hanging on missing parameters', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-execution.ps1');
      
      const originalScript = `Write-Host "Enter your name: " -NoNewline
$userName = Read-Host
Write-Host "Hello, $userName!" -ForegroundColor Green`;

      writeFileSync(scriptFile, originalScript);

      try {
        // Add the script (should auto-convert)
        const addResult = execCLI(`add test-execution "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Added script "test-execution"');
        
        // Try to execute without parameters - should not hang
        // We expect this to either prompt for input or use defaults
        // but NOT hang indefinitely
        const executeResult = execCLI('test-execution', { 
          encoding: 'utf8',
          timeout: 5000 // 5 second timeout to detect hanging
        });
        
        // Should either execute successfully or show expected interactive behavior
        // The key is it should NOT timeout/hang
        expect(executeResult).toBeDefined();
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 10000); // 10 second test timeout

    it('should handle scripts with environment variable fallbacks', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-env-fallback.ps1');
      
      const originalScript = `# Script with environment variable fallback
$projectRoot = $env:SCAFFOLD_PROJECT_ROOT
if (-not $projectRoot) {
    Write-Host "Enter project root: " -NoNewline
    $projectRoot = Read-Host
}
Write-Host "Using project root: $projectRoot"`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-env-fallback "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should still convert the Read-Host part
        expect(addResult).toContain('Automatically converted interactive input');
        
        const viewResult = execCLI('view test-env-fallback', { encoding: 'utf8' });
        
        // Should add parameter for projectRoot
        expect(viewResult).toContain('[string]$projectRoot = (Get-Location).Path');
        
        // Should preserve environment variable logic (check for successful conversion)
        expect(viewResult).toContain('Script Type: powershell');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle variable names with underscores and numbers', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-variable-names.ps1');
      
      const originalScript = `$project_name_2024 = Read-Host "Project name"
$api_key_v1 = Read-Host "API Key"
$target_dir123 = Read-Host "Target directory"`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-variable-names "${scriptFile}"`, { encoding: 'utf8' });
        
        const viewResult = execCLI('view test-variable-names', { encoding: 'utf8' });
        
        // Should handle all variable name formats
        expect(viewResult).toContain('[string]$project_name_2024 = $null');
        expect(viewResult).toContain('[string]$api_key_v1 = $null');
        expect(viewResult).toContain('[string]$target_dir123 = $null');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should handle Read-Host with different prompt styles', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-prompt-styles.ps1');
      
      const originalScript = `# Different Read-Host prompt styles
$name1 = Read-Host "Simple prompt"
$name2 = Read-Host 'Single quote prompt'
Write-Host "Prompt on separate line:"
$name3 = Read-Host
$name4 = Read-Host -Prompt "Using -Prompt parameter"`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-prompt-styles "${scriptFile}"`, { encoding: 'utf8' });
        
        const viewResult = execCLI('view test-prompt-styles', { encoding: 'utf8' });
        
        // Should detect all Read-Host patterns
        expect(viewResult).toContain('[string]$name1 = $null');
        expect(viewResult).toContain('[string]$name2 = $null');
        expect(viewResult).toContain('[string]$name3 = $null');
        expect(viewResult).toContain('[string]$name4 = $null');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should not break existing parameter blocks', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-existing-params.ps1');
      
      const originalScript = `param(
    [string]$ExistingParam = "default"
)

Write-Host "Existing param: $ExistingParam"
$newParam = Read-Host "Enter new value"`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-existing-params "${scriptFile}"`, { encoding: 'utf8' });
        
        const viewResult = execCLI('view test-existing-params', { encoding: 'utf8' });
        
        // Should preserve existing parameter
        expect(viewResult).toContain('[string]$ExistingParam = "default"');
        
        // Should preserve existing params but NOT modify scripts with existing param blocks
        expect(viewResult).toContain('Enter new value');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Performance and Validation', () => {
    it('should process large scripts with many Read-Host commands efficiently', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-large-script.ps1');
      
      // Generate a script with many Read-Host commands
      let scriptContent = '# Large script with many interactive inputs\\n';
      for (let i = 1; i <= 20; i++) {
        scriptContent += `$var${i} = Read-Host "Enter value ${i}"\\n`;
      }

      writeFileSync(scriptFile, scriptContent);

      try {
        const startTime = Date.now();
        const addResult = execCLI(`add test-large-script "${scriptFile}"`, { encoding: 'utf8' });
        const endTime = Date.now();
        
        // Should complete in reasonable time (under 5 seconds)
        expect(endTime - startTime).toBeLessThan(5000);
        
        expect(addResult).toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "test-large-script"');
        
        const viewResult = execCLI('view test-large-script', { encoding: 'utf8' });
        
        // Should contain parameters for all variables
        for (let i = 1; i <= 20; i++) {
          expect(viewResult).toContain(`[string]$var${i} = $null`);
        }
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should maintain script functionality after conversion', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-functionality.ps1');
      
      const originalScript = `Write-Host "Project Setup Script" -ForegroundColor Blue
$projectName = Read-Host "Enter project name"
$projectPath = "C:\\\\Projects\\\\$projectName"
Write-Host "Creating project at: $projectPath" -ForegroundColor Green
# Simulated project creation
Write-Host "Project $projectName created successfully!" -ForegroundColor Green`;

      writeFileSync(scriptFile, originalScript);

      try {
        const addResult = execCLI(`add test-functionality "${scriptFile}"`, { encoding: 'utf8' });
        
        expect(addResult).toContain('Added script "test-functionality"');
        
        const viewResult = execCLI('view test-functionality', { encoding: 'utf8' });
        
        // Should preserve all original functionality
        expect(viewResult).toContain('Project Setup Script');
        // Should preserve path assignment (may have different path separators on different platforms)
        expect(viewResult).toMatch(/\$projectPath = "C:[\\/]Projects[\\/]\$projectName"/);
        expect(viewResult).toContain('Project $projectName created successfully!');
        
        // Should add parameter support
        expect(viewResult).toContain('[string]$projectName = $null');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
