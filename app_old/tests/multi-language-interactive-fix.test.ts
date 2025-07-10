/**
 * Multi-Language Interactive Input Automatic Fixing Tests
 * Tests interactive input conversion for Bash, Python, and other supported script types
 */

import { setupTest, cleanupTest, execCLI } from './test-isolation';
import { writeFileSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('Multi-Language Interactive Input Fixing', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('Bash Script Interactive Input Conversion', () => {
    it('should convert bash read commands to parameter defaults', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-bash-interactive.sh');
      
      const bashScript = `#!/bin/bash
echo "=== Bash Interactive Script ==="
read -p "Enter project name: " projectName
read -p "Enter project path: " projectPath

echo "Project: $projectName"
echo "Path: $projectPath"
echo "Setup completed!"`;

      writeFileSync(scriptFile, bashScript);

      try {
        const addResult = execCLI(`add test-bash-interactive "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should auto-convert interactive input
        expect(addResult).toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "test-bash-interactive"');
        
        // Check converted script has parameter defaults
        const viewResult = execCLI('view test-bash-interactive', { encoding: 'utf8' });
        expect(viewResult).toContain('projectName=${1:-"default"}');
        expect(viewResult).toContain('projectPath=${2:-$(pwd)}');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should execute converted bash scripts without hanging', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-bash-execution.sh');
      
      const bashScript = `#!/bin/bash
read -p "Enter value: " userValue
echo "You entered: $userValue"
echo "Script completed successfully"`;

      writeFileSync(scriptFile, bashScript);

      try {
        const addResult = execCLI(`add test-bash-execution "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        // Should execute without hanging
        const startTime = Date.now();
        const executeResult = execCLI('test-bash-execution', { 
          encoding: 'utf8',
          timeout: 10000
        });
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeLessThan(10000);
        expect(executeResult).toContain('Script completed successfully');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 15000);

    it('should handle multiple bash read patterns', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-bash-multiple.sh');
      
      const bashScript = `#!/bin/bash
read -p "Enter name: " userName
read -p "Enter email: " userEmail
read -p "Enter project root: " projectRoot

echo "Name: $userName"
echo "Email: $userEmail"  
echo "Root: $projectRoot"`;

      writeFileSync(scriptFile, bashScript);

      try {
        const addResult = execCLI(`add test-bash-multiple "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        const viewResult = execCLI('view test-bash-multiple', { encoding: 'utf8' });
        expect(viewResult).toContain('userName=${1:-"default"}');
        expect(viewResult).toContain('userEmail=${2:-"default"}');
        // projectRoot should get current directory default (may be any parameter position, different commands on different platforms)
        expect(viewResult).toMatch(/projectRoot=\${.*:-\$\((pwd|Get-Location)\)}/);
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Python Script Interactive Input Conversion', () => {
    it('should convert python input() calls to sys.argv defaults', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-python-interactive.py');
      
      const pythonScript = `#!/usr/bin/env python3
print("=== Python Interactive Script ===")
project_name = input("Enter project name: ")
project_path = input("Enter project path: ")

print(f"Project: {project_name}")
print(f"Path: {project_path}")
print("Setup completed!")`;

      writeFileSync(scriptFile, pythonScript);

      try {
        const addResult = execCLI(`add test-python-interactive "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should auto-convert interactive input
        expect(addResult).toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "test-python-interactive"');
        
        // Check converted script has sys.argv handling
        const viewResult = execCLI('view test-python-interactive', { encoding: 'utf8' });
        expect(viewResult).toContain('import sys');
        expect(viewResult).toContain('import os');
        expect(viewResult).toContain('sys.argv[1] if len(sys.argv) > 1');
        expect(viewResult).toContain('os.getcwd()');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should execute converted python scripts without hanging', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-python-execution.py');
      
      const pythonScript = `#!/usr/bin/env python3
user_value = input("Enter value: ")
print(f"You entered: {user_value}")
print("Script completed successfully")`;

      writeFileSync(scriptFile, pythonScript);

      try {
        const addResult = execCLI(`add test-python-execution "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        // Should execute without hanging
        const startTime = Date.now();
        const executeResult = execCLI('test-python-execution', { 
          encoding: 'utf8',
          timeout: 10000
        });
        const endTime = Date.now();
        
        expect(endTime - startTime).toBeLessThan(10000);
        expect(executeResult).toContain('Script completed successfully');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 15000);

    it('should handle python input with different variable patterns', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-python-patterns.py');
      
      const pythonScript = `#!/usr/bin/env python3
user_name = input("Enter your name: ")
project_root = input("Enter project root: ")
config_file = input("Enter config file: ")

print(f"Name: {user_name}")
print(f"Root: {project_root}")
print(f"Config: {config_file}")`;

      writeFileSync(scriptFile, pythonScript);

      try {
        const addResult = execCLI(`add test-python-patterns "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        const viewResult = execCLI('view test-python-patterns', { encoding: 'utf8' });
        // Should have smart defaults for path variables
        expect(viewResult).toContain('os.getcwd()'); // for project_root
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('Node.js Script Interactive Input Conversion', () => {
    it('should convert readline interface to process.argv defaults', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-nodejs-interactive.js');
      
      const nodeScript = `const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter project name: ', (projectName) => {
  rl.question('Enter project path: ', (projectPath) => {
    console.log(\`Project: \${projectName}\`);
    console.log(\`Path: \${projectPath}\`);
    console.log('Setup completed!');
    rl.close();
  });
});`;

      writeFileSync(scriptFile, nodeScript);

      try {
        const addResult = execCLI(`add test-nodejs-interactive "${scriptFile}"`, { encoding: 'utf8' });
        
        // Should auto-convert interactive input
        expect(addResult).toContain('Automatically converted interactive input');
        expect(addResult).toContain('Added script "test-nodejs-interactive"');
        
        // Check converted script has process.argv handling
        const viewResult = execCLI('view test-nodejs-interactive', { encoding: 'utf8' });
        expect(viewResult).toContain('process.argv.slice(2)');
        expect(viewResult).toContain('process.cwd()');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should handle simple prompt-sync patterns', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-nodejs-prompt.js');
      
      const nodeScript = `const prompt = require('prompt-sync')();

const userName = prompt('Enter your name: ');
const projectPath = prompt('Enter project path: ');

console.log(\`Name: \${userName}\`);
console.log(\`Path: \${projectPath}\`);
console.log('Script completed!');`;

      writeFileSync(scriptFile, nodeScript);

      try {
        const addResult = execCLI(`add test-nodejs-prompt "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        // Should execute without hanging
        const executeResult = execCLI('test-nodejs-prompt', { 
          encoding: 'utf8',
          timeout: 10000
        });
        
        expect(executeResult).toContain('Script completed!');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 15000);
  });

  describe('Cross-Language Interactive Pattern Detection', () => {
    it('should correctly identify and convert different script types', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      const scripts = [
        {
          name: 'mixed-bash',
          file: 'test.sh',
          content: `#!/bin/bash\nread -p "Enter value: " val\necho "Value: $val"`,
          shouldConvert: true
        },
        {
          name: 'mixed-python',
          file: 'test.py', 
          content: `val = input("Enter value: ")\nprint(f"Value: {val}")`,
          shouldConvert: true
        },
        {
          name: 'mixed-powershell',
          file: 'test.ps1',
          content: `$val = Read-Host "Enter value"\nWrite-Host "Value: $val"`,
          shouldConvert: true
        },
        {
          name: 'non-interactive-bash',
          file: 'simple.sh',
          content: `#!/bin/bash\necho "No input needed"`,
          shouldConvert: false
        }
      ];

      try {
        scripts.forEach(script => {
          const scriptPath = join(tempDir, script.file);
          writeFileSync(scriptPath, script.content);
          
          const addResult = execCLI(`add ${script.name} "${scriptPath}"`, { encoding: 'utf8' });
          
          if (script.shouldConvert) {
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

  describe('Regression Tests for Multi-Language Support', () => {
    it('should maintain backward compatibility with existing PowerShell fixes', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      const scriptFile = join(tempDir, 'test-ps-regression.ps1');
      
      const psScript = `Write-Host "Testing PowerShell regression"
$projectRoot = Read-Host "Enter project root"
Write-Host "Root: $projectRoot"`;

      writeFileSync(scriptFile, psScript);

      try {
        const addResult = execCLI(`add test-ps-regression "${scriptFile}"`, { encoding: 'utf8' });
        expect(addResult).toContain('Automatically converted interactive input');
        
        const executeResult = execCLI('test-ps-regression', { 
          encoding: 'utf8',
          timeout: 10000
        });
        
        expect(executeResult).toContain('Script completed successfully');
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    }, 15000);

    it('should handle edge cases across all script types', async () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'scaffold-test-'));
      
      const edgeCases = [
        {
          name: 'empty-prompt-bash',
          file: 'empty.sh',
          content: 'read var\necho $var'
        },
        {
          name: 'multiline-python',
          file: 'multi.py',
          content: 'val = input(\n    "Enter value: "\n)\nprint(val)'
        },
        {
          name: 'quoted-powershell',
          file: 'quoted.ps1',
          content: '$val = Read-Host "Enter \\"quoted\\" value"\nWrite-Host $val'
        }
      ];

      try {
        edgeCases.forEach(testCase => {
          const scriptPath = join(tempDir, testCase.file);
          writeFileSync(scriptPath, testCase.content);
          
          // Should handle gracefully without crashing
          const addResult = execCLI(`add ${testCase.name} "${scriptPath}"`, { encoding: 'utf8' });
          expect(addResult).toContain(`Added script "${testCase.name}"`);
        });
        
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});