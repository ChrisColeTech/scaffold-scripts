/**
 * Script Execution and Hanging Prevention Tests
 * Tests to ensure scripts don't hang during execution and handle input correctly
 */

import { setupTest, cleanupTest, execCLI } from './test-isolation';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Script Execution - Hanging Prevention', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('PowerShell Script Execution', () => {
    it('should execute non-interactive scripts without hanging', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-non-interactive.ps1');
      
      const script = `Write-Host "This is a non-interactive script" -ForegroundColor Green
$result = "Success"
Write-Host "Result: $result" -ForegroundColor Cyan`;

      writeFileSync(scriptFile, script);

      try {
        // Add script
        const addResult = execCLI(`add test-non-interactive "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Added script "test-non-interactive"');
        
        // Execute script - should complete quickly without hanging
        const startTime = Date.now();
        const executeResult = execCLI('test-non-interactive', { 
          encoding: 'utf8',
          timeout: 10000 // 10 second timeout
        });
        const endTime = Date.now();
        
        // Should complete in reasonable time
        expect(endTime - startTime).toBeLessThan(5000);
        
        // Should show successful execution
        expect(executeResult).toContain('Script completed successfully!');
        expect(executeResult).toContain('This is a non-interactive script');
        expect(executeResult).toContain('Result: Success');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 15000);

    it('should handle scripts with fixed variables instead of Read-Host', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-fixed-vars.ps1');
      
      const script = `# Script with predefined values instead of Read-Host
$userName = "TestUser"
$projectPath = "C:\\\\TestProject"

Write-Host "Hello, $userName!" -ForegroundColor Green  
Write-Host "Creating project at: $projectPath" -ForegroundColor Cyan
Write-Host "Setup complete!" -ForegroundColor Green`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add test-fixed-vars "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Added script "test-fixed-vars"');
        
        // Execute - should work without issues
        const executeResult = execCLI('test-fixed-vars', { 
          encoding: 'utf8',
          timeout: 10000
        });
        
        expect(executeResult).toContain('Script completed successfully!');
        expect(executeResult).toContain('Hello, TestUser!');
        expect(executeResult).toContain('Creating project at: C:\\\\TestProject');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 15000);

    it('should detect when scripts would hang and show appropriate message', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-potential-hang.ps1');
      
      // Script that would hang without the auto-fix
      const script = `Write-Host "This script would hang without auto-fix" -ForegroundColor Yellow
$input = Read-Host "Enter something"
Write-Host "You entered: $input"`;

      writeFileSync(scriptFile, script);

      try {
        // Add script - should auto-convert
        const addResult = execCLI(`add test-potential-hang "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        // The converted script should have timeout protection
        const viewResult = execCLI('view test-potential-hang', { encoding: 'utf8' });
        expect(viewResult).toContain('param(');
        expect(viewResult).toContain('[string]$input = $null');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Script Type Detection for Hanging Prevention', () => {
    it('should correctly identify PowerShell scripts with Read-Host', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-ps-detection.ps1');
      
      const script = `# PowerShell script with Read-Host
Write-Host "Testing PowerShell detection" -ForegroundColor Blue
$name = Read-Host "Name"
Write-Host "Hello $name"`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add test-ps-detection "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should detect as PowerShell
        expect(addResult).toContain('Script Type: powershell');
        
        // Should auto-convert interactive input
        expect(addResult).toContain('Automatically converted interactive input');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should handle mixed script types appropriately', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      // Test different script types
      const scripts = [
        {
          name: 'test-bash',
          file: 'test-bash.sh',
          content: `#!/bin/bash\necho "Enter name:"\nread name\necho "Hello $name"`,
          shouldAutoFix: true // Bash auto-fix implemented
        },
        {
          name: 'test-python',
          file: 'test-python.py',
          content: `name = input("Enter name: ")\nprint(f"Hello {name}")`,
          shouldAutoFix: true // Python auto-fix implemented
        },
        {
          name: 'test-powershell',
          file: 'test-powershell.ps1',
          content: `$name = Read-Host "Enter name"\nWrite-Host "Hello $name"`,
          shouldAutoFix: true
        }
      ];

      try {
        scripts.forEach(script => {
          const scriptPath = join(tempDir, script.file);
          writeFileSync(scriptPath, script.content);
          
          const addResult = execCLI(`add ${script.name} "${scriptPath}"`, { encoding: 'utf8' });
          
          if (script.shouldAutoFix) {
            expect(addResult).toContain('Automatically converted interactive input');
          } else {
            expect(addResult).not.toContain('Automatically converted interactive input');
          }
          
          expect(addResult).toContain(`Added script "${script.name}"`);
        });
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Timeout and Hanging Detection', () => {
    it('should have reasonable timeout for script execution', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-timeout.ps1');
      
      // Script that takes some time but shouldn't hang
      const script = `Write-Host "Starting long-running task..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "Task completed!" -ForegroundColor Green`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add test-timeout "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Added script "test-timeout"');
        
        // Should complete within reasonable time
        const startTime = Date.now();
        const executeResult = execCLI('test-timeout', { 
          encoding: 'utf8',
          timeout: 15000 // 15 second timeout
        });
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeGreaterThan(2000); // Should take at least 2 seconds
        expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10 seconds
        
        expect(executeResult).toContain('Task completed!');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 20000);

    it('should handle scripts that might cause infinite loops', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-potential-loop.ps1');
      
      // Script that could potentially loop forever without proper input
      const script = `do {
    $input = Read-Host "Enter 'exit' to quit"
    if ($input -eq "exit") { break }
    Write-Host "You entered: $input"
} while ($true)`;

      writeFileSync(scriptFile, script);

      try {
        // Should auto-convert the Read-Host to prevent hanging
        const addResult = execCLI(`add test-potential-loop "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        // The converted script should have parameter support
        const viewResult = execCLI('view test-potential-loop', { encoding: 'utf8' });
        expect(viewResult).toContain('[string]$input = $null');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle malformed Read-Host patterns gracefully', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-malformed.ps1');
      
      // Script with unusual Read-Host patterns
      const script = `# Various edge cases
$var1 = Read-Host # No prompt
\$var2=Read-Host"Nospace" # No space
$var3 = Read-Host \`
    "Multi-line prompt"
Write-Host "Test completed"`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add test-malformed "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should not fail, even if some patterns aren't detected
        expect(addResult).toContain('Added script "test-malformed"');
        
        // Should still be executable
        const executeResult = execCLI('test-malformed', { 
          encoding: 'utf8',
          timeout: 10000
        });
        
        expect(executeResult).toContain('Test completed');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should preserve script functionality when auto-fixing fails', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-fix-failure.ps1');
      
      // Script with complex patterns that might be hard to auto-fix
      const script = `function Get-UserInput {
    param([string]$Prompt)
    return Read-Host $Prompt
}

$name = Get-UserInput "Enter your name"
Write-Host "Hello, $name!"`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add test-fix-failure "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should add successfully even if auto-fix doesn't apply
        expect(addResult).toContain('Added script "test-fix-failure"');
        
        // Should preserve the function
        const viewResult = execCLI('view test-fix-failure', { encoding: 'utf8' });
        expect(viewResult).toContain('function Get-UserInput');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Integration with Existing Scripts', () => {
    it('should work with real-world scaffold scripts', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-real-world.ps1');
      
      // Simulate a real scaffold script like the ones from project14
      const script = `Write-Host "=== Project Setup ===" -ForegroundColor Blue
Write-Host "Enter the full path to your project root: " -NoNewline -ForegroundColor Yellow
$projectRoot = Read-Host

if ([string]::IsNullOrWhiteSpace($projectRoot)) {
    Write-Host "ERROR: Project root path is required." -ForegroundColor Red
    exit 1
}

Write-Host "Creating project structure..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "$projectRoot\\\\src" | Out-Null
Write-Host "Project created successfully at: $projectRoot" -ForegroundColor Green`;

      writeFileSync(scriptFile, script);

      try {
        const addResult = execCLI(`add test-real-world "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should auto-convert
        expect(addResult).toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "test-real-world"');
        
        // Should preserve all original logic
        const viewResult = execCLI('view test-real-world', { encoding: 'utf8' });
        expect(viewResult).toContain('[string]$projectRoot = (Get-Location).Path');
        // Should preserve original logic (check for successful conversion indicators)
        expect(viewResult).toContain('Script Type: powershell');
        expect(viewResult).toContain('param(');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
