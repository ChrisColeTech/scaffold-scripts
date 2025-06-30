/**
 * Script Processor Auto-Fix Tests
 * Unit tests for the automatic interactive input fixing functionality
 */

import { ScriptProcessor } from '../dist/scriptProcessor.js';
import { ScriptTypeDetector } from '../dist/scriptTypeDetector.js';

describe('ScriptProcessor - Interactive Input Auto-Fix', () => {
  let processor: ScriptProcessor;
  let detector: ScriptTypeDetector;

  beforeEach(() => {
    processor = new ScriptProcessor();
    detector = new ScriptTypeDetector();
  });

  describe('fixInteractiveInput method', () => {
    it('should detect and fix simple PowerShell Read-Host patterns', async () => {
      const originalScript = `Write-Host "Enter your name: " -NoNewline -ForegroundColor Yellow
$userName = Read-Host

Write-Host "Hello, $userName!" -ForegroundColor Green`;

      const result = await processor.processScriptContent(originalScript);

      expect(result.validation.warnings).toContain(
        'Automatically converted interactive input to support command-line arguments'
      );

      // Should contain parameter block
      expect(result.original).toContain('param(');
      expect(result.original).toContain('[string]$userName = $null');

      // Should contain conditional wrapper
      expect(result.original).toContain('if (-not $userName)');
      expect(result.original).toContain('$userName = Read-Host');
    });

    it('should handle multiple Read-Host variables', async () => {
      const originalScript = `$name = Read-Host "Name"
$email = Read-Host "Email"  
$phone = Read-Host "Phone"`;

      const result = await processor.processScriptContent(originalScript);

      expect(result.validation.warnings).toContain(
        'Automatically converted interactive input to support command-line arguments'
      );

      // Should have all parameters
      expect(result.original).toContain('[string]$name = $null');
      expect(result.original).toContain('[string]$email = $null');
      expect(result.original).toContain('[string]$phone = $null');

      // Should have all conditionals
      expect(result.original).toContain('if (-not $name)');
      expect(result.original).toContain('if (-not $email)');
      expect(result.original).toContain('if (-not $phone)');
    });

    it('should not modify scripts without Read-Host', async () => {
      const originalScript = `Write-Host "No interactive input here" -ForegroundColor Green
$value = "hardcoded"
Write-Host "Value: $value"`;

      const result = await processor.processScriptContent(originalScript);

      // Should NOT have auto-fix warning
      expect(result.validation.warnings).not.toContain(
        'Automatically converted interactive input to support command-line arguments'
      );

      // Should not contain parameter block
      expect(result.original).not.toContain('param(');

      // Should be unchanged
      expect(result.original).toContain('$value = "hardcoded"');
    });

    it('should handle complex variable names', async () => {
      const originalScript = `$project_name_2024 = Read-Host "Project"
$api_key_v1 = Read-Host "API Key"
$target_dir123 = Read-Host "Directory"`;

      const result = await processor.processScriptContent(originalScript);

      expect(result.original).toContain('[string]$project_name_2024 = $null');
      expect(result.original).toContain('[string]$api_key_v1 = $null');
      expect(result.original).toContain('[string]$target_dir123 = $null');
    });

    it('should handle Read-Host with different prompt formats', async () => {
      const originalScript = `$var1 = Read-Host "Double quotes"
$var2 = Read-Host 'Single quotes'
$var3 = Read-Host
Write-Host "Prompt:"
$var4 = Read-Host`;

      const result = await processor.processScriptContent(originalScript);

      expect(result.original).toContain('[string]$var1 = $null');
      expect(result.original).toContain('[string]$var2 = $null');
      expect(result.original).toContain('[string]$var3 = $null');
      expect(result.original).toContain('[string]$var4 = $null');
    });

    it('should preserve existing script functionality', async () => {
      const originalScript = `Write-Host "=== Setup Script ===" -ForegroundColor Blue
$projectName = Read-Host "Project name"

if ([string]::IsNullOrWhiteSpace($projectName)) {
    Write-Host "ERROR: Project name required" -ForegroundColor Red
    exit 1
}

$targetDir = Read-Host "Target directory"
Write-Host "Creating $projectName in $targetDir" -ForegroundColor Green`;

      const result = await processor.processScriptContent(originalScript);

      // Should have parameters
      expect(result.original).toContain('[string]$projectName = $null');
      expect(result.original).toContain('[string]$targetDir = $null');

      // Should preserve existing logic
      expect(result.original).toContain('if ([string]::IsNullOrWhiteSpace($projectName))');
      expect(result.original).toContain('exit 1');
      expect(result.original).toContain('Write-Host "Creating $projectName in $targetDir"');
    });

    it('should not modify scripts with existing parameter blocks', async () => {
      const originalScript = `param(
    [string]$ExistingParam = "default"
)

Write-Host "Existing: $ExistingParam"
$newParam = Read-Host "New value"`;

      const result = await processor.processScriptContent(originalScript);

      // Should preserve existing parameter block unchanged
      expect(result.original).toContain('[string]$ExistingParam = "default"');

      // Should NOT add new parameters (because param block already exists)
      expect(result.original).not.toContain('[string]$newParam = $null');

      // Should NOT add conditionals (because script already has param block)
      expect(result.original).not.toContain('if (-not $newParam)');
      
      // Should preserve the original Read-Host unchanged
      expect(result.original).toContain('$newParam = Read-Host "New value"');
    });

    it('should be disabled when fixInteractiveInput option is false', async () => {
      const originalScript = `$name = Read-Host "Enter name"`;

      const result = await processor.processScriptContent(originalScript, {
        fixInteractiveInput: false
      });

      // Should NOT have auto-fix warning
      expect(result.validation.warnings).not.toContain(
        'Automatically converted interactive input to support command-line arguments'
      );

      // Should not contain parameter block
      expect(result.original).not.toContain('param(');

      // Should be unchanged
      expect(result.original).toBe(originalScript);
    });

    it('should work with different script types', async () => {
      // Test that non-PowerShell scripts don't get PowerShell fixes
      const bashScript = `#!/bin/bash
echo "Enter name:"
read name
echo "Hello $name"`;

      const result = await processor.processScriptContent(bashScript);

      // Should NOT apply PowerShell fixes to bash script
      expect(result.original).not.toContain('param(');
      expect(result.original).not.toContain('[string]');
    });
  });

  describe('Script Type Detection Integration', () => {
    it('should only apply PowerShell fixes to PowerShell scripts', async () => {
      const powershellScript = `Write-Host "PowerShell script"
$name = Read-Host "Name"`;

      const result = await processor.processScriptContent(powershellScript);

      expect(result.scriptType).toBe('powershell');
      expect(result.validation.warnings).toContain(
        'Automatically converted interactive input to support command-line arguments'
      );
    });

    it('should detect script type correctly before applying fixes', async () => {
      const scriptType = detector.detectType(`Write-Host "Test"
$var = Read-Host "Input"`);

      expect(scriptType.type).toBe('powershell');
      expect(scriptType.interpreters).toContain('powershell');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large scripts efficiently', async () => {
      // Generate a large script with many Read-Host commands
      let largeScript = '# Large script with many Read-Host commands\\n';
      for (let i = 1; i <= 50; i++) {
        largeScript += `$var${i} = Read-Host "Enter value ${i}"\\n`;
      }

      const startTime = Date.now();
      const result = await processor.processScriptContent(largeScript);
      const endTime = Date.now();

      // Should complete quickly (under 1 second)
      expect(endTime - startTime).toBeLessThan(1000);

      // Should process all variables
      for (let i = 1; i <= 50; i++) {
        expect(result.original).toContain(`[string]$var${i} = $null`);
      }
    });

    it('should handle malformed Read-Host patterns gracefully', async () => {
      const malformedScript = `# Various edge cases
$var1 = Read-Host # No prompt  
\$var2=Read-Host"NoSpace"
$var3 = Read-Host \`
    "Multi-line"
# This should still work
Write-Host "Done"`;

      const result = await processor.processScriptContent(malformedScript);

      // Should not crash
      expect(result.validation.isValid).toBe(true);

      // Should preserve the "Done" message
      expect(result.original).toContain('Write-Host "Done"');
    });

    it('should handle empty or whitespace-only scripts', async () => {
      const emptyScript = '   \\n\\n   ';

      const result = await processor.processScriptContent(emptyScript);

      expect(result.validation.isValid).toBe(true);
      expect(result.scriptType).toBe('shell'); // Default type for empty scripts
    });

    it('should handle scripts with only comments', async () => {
      const commentScript = `# This is a comment
# Another comment
# No actual code here`;

      const result = await processor.processScriptContent(commentScript);

      expect(result.validation.isValid).toBe(true);
      expect(result.original).toContain('# This is a comment');
    });
  });

  describe('Validation Integration', () => {
    it('should preserve validation warnings and errors', async () => {
      const scriptWithIssues = `# Script with potential issues
$name = Read-Host "Name"
rm -rf / # Dangerous command that might trigger warnings`;

      const result = await processor.processScriptContent(scriptWithIssues, {
        strict: true
      });

      // Should have auto-fix warning
      expect(result.validation.warnings).toContain(
        'Automatically converted interactive input to support command-line arguments'
      );

      // May have other validation warnings too
      expect(result.validation.warnings.length).toBeGreaterThan(0);
    });

    it('should maintain validation status after auto-fix', async () => {
      const validScript = `Write-Host "Valid script"
$name = Read-Host "Name"
Write-Host "Hello $name"`;

      const result = await processor.processScriptContent(validScript);

      expect(result.validation.isValid).toBe(true);
      expect(result.validation.errors.length).toBe(0);
      expect(result.validation.warnings).toContain(
        'Automatically converted interactive input to support command-line arguments'
      );
    });
  });
});
