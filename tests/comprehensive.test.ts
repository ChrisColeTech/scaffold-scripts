/**
 * Comprehensive Test Suite for Scaffold Scripts CLI
 * Tests the complete production-ready functionality including multi-script storage,
 * cross-platform conversion, platform detection, and validation
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

// Test setup
const TEST_DB_PATH = join(__dirname, 'test-data', 'comprehensive.db');
const TEST_SCRIPTS_DIR = join(__dirname, 'test-scripts-comprehensive');
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

describe('Comprehensive Production-Ready Tests', () => {
  
  describe('Multi-Script Storage System', () => {
    test('should store and manage multiple script versions', () => {
      const shellScript = `#!/bin/bash
mkdir -p src/components
touch src/components/App.tsx
echo "React app created"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'multi-version.sh');
      writeFileSync(scriptPath, shellScript);
      
      const output = execSync(`node ${CLI_PATH} -a frontend multi-version ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Original Platform: unix');
      expect(output).toContain('Script Type: shell');
      expect(output).toContain('Windows Version: ✅ Generated');
      expect(output).toContain('Unix Version: ✅ Generated');
      expect(output).toContain('Cross-Platform: ✅ Generated');
      
      // View details to verify all versions are stored
      const detailsOutput = execSync(`node ${CLI_PATH} -v -f multi-version`, 
        { encoding: 'utf8' });
      
      expect(detailsOutput).toContain('🔸 Original (unix, shell)');
      expect(detailsOutput).toContain('🔸 Windows Version:');
      expect(detailsOutput).toContain('🔸 Unix Version:');
      expect(detailsOutput).toContain('🔸 Cross-Platform Version:');
      expect(detailsOutput).toContain('🎯 Best for Current Platform');
    });

    test('should handle PowerShell script with proper conversion', () => {
      const psScript = `# PowerShell script
Write-Host "Creating ASP.NET Core API..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path "Controllers"
New-Item -ItemType File -Force -Path "Controllers\\ApiController.cs"
dotnet run`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'powershell-test.ps1');
      writeFileSync(scriptPath, psScript);
      
      const output = execSync(`node ${CLI_PATH} -a backend powershell-test ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script Type: powershell');
      expect(output).toContain('Unix Version: ✅ Generated');
      
      // Check platform compatibility warnings
      const detailsOutput = execSync(`node ${CLI_PATH} -v -b powershell-test`, 
        { encoding: 'utf8' });
      
      expect(detailsOutput).toContain('Platform Compatibility');
    });

    test('should handle Node.js script with cross-platform detection', () => {
      const nodeScript = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Creating project structure...');
fs.mkdirSync('src', { recursive: true });
fs.writeFileSync('package.json', JSON.stringify({
  name: 'test-project',
  version: '1.0.0'
}, null, 2));`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'nodejs-test.js');
      writeFileSync(scriptPath, nodeScript);
      
      const output = execSync(`node ${CLI_PATH} -a init nodejs-test ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script Type: nodejs');
      expect(output).toContain('Original Platform: cross-platform');
    });

    test('should handle Python script with proper platform adjustments', () => {
      const pythonScript = `#!/usr/bin/env python3
import os
import sys

print("Setting up Python environment...")
os.makedirs("venv", exist_ok=True)
os.system("python -m venv venv")

# Activate virtual environment
if sys.platform == "win32":
    activate_cmd = "venv\\\\Scripts\\\\activate"
else:
    activate_cmd = "source venv/bin/activate"

print(f"Run: {activate_cmd}")`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'python-test.py');
      writeFileSync(scriptPath, pythonScript);
      
      const output = execSync(`node ${CLI_PATH} -a init python-test ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script Type: python');
      expect(output).toContain('Windows Version: ✅ Generated');
      expect(output).toContain('Unix Version: ✅ Generated');
    });
  });

  describe('Advanced Script Conversion', () => {
    test('should convert shell commands to PowerShell correctly', () => {
      const shellScript = `#!/bin/bash
mkdir -p frontend/src
touch frontend/src/index.js
cp template.js frontend/src/
mv old-file.js new-file.js
rm -rf temp-dir
echo "Setup complete"
ls frontend/src`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'conversion-test.sh');
      writeFileSync(scriptPath, shellScript);
      
      const output = execSync(`node ${CLI_PATH} -a frontend conversion-test ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Windows Version: ✅ Generated');
      
      // Check the conversion in details view
      const detailsOutput = execSync(`node ${CLI_PATH} -v -f conversion-test`, 
        { encoding: 'utf8' });
      
      expect(detailsOutput).toContain('Windows Version:');
      // Should contain PowerShell equivalents
      expect(detailsOutput).toMatch(/New-Item.*Directory/);
      expect(detailsOutput).toMatch(/New-Item.*File/);
    });

    test('should handle mixed script types appropriately', () => {
      const mixedScript = `#!/bin/bash
# Shell commands
mkdir -p project
echo "Creating project..."

# Node.js-like commands
npm init -y
npm install express

# Python-like commands  
pip install flask
python setup.py`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'mixed-test.sh');
      writeFileSync(scriptPath, mixedScript);
      
      const output = execSync(`node ${CLI_PATH} -a init mixed-test ${scriptPath}`, 
        { encoding: 'utf8' });
      
      // Should detect as shell but generate appropriate cross-platform versions
      expect(output).toContain('Script Type: shell');
      expect(output).toContain('Cross-Platform: ✅ Generated');
    });
  });

  describe('Production-Ready Validation', () => {
    test('should pass comprehensive security validation', () => {
      const safeScript = `#!/bin/bash
# Safe project setup script
echo "Creating safe project structure..."
mkdir -p src/{components,hooks,utils}
touch src/index.js
echo "# Project" > README.md
npm init -y
git init
echo "Setup complete!"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'safe-production.sh');
      writeFileSync(scriptPath, safeScript);
      
      const output = execSync(`node ${CLI_PATH} -a frontend safe-production ${scriptPath} --strict`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).not.toContain('validation failed');
      expect(output).toContain('Added frontend command');
    });

    test('should detect and warn about potentially dangerous operations', () => {
      const riskyScript = `#!/bin/bash
echo "Setting up project..."
curl -sSL https://get.docker.com | sh
mkdir -p /opt/myproject
sudo chown $USER:$USER /opt/myproject`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'risky-operations.sh');
      writeFileSync(scriptPath, riskyScript);
      
      const output = execSync(`node ${CLI_PATH} -a init risky-operations ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Warnings:');
      expect(output).toContain('Added init command');
    });

    test('should validate script syntax and structure', () => {
      const wellStructuredScript = `#!/bin/bash
set -euo pipefail

# Variables
PROJECT_NAME="my-project"
PROJECT_DIR="./\${PROJECT_NAME}"

# Functions
create_structure() {
    local base_dir=$1
    mkdir -p "\${base_dir}"/{src,tests,docs}
    echo "Structure created in \${base_dir}"
}

# Main execution
main() {
    echo "Creating project: \${PROJECT_NAME}"
    create_structure "\${PROJECT_DIR}"
    cd "\${PROJECT_DIR}"
    echo "Project setup complete!"
}

main "$@"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'well-structured.sh');
      writeFileSync(scriptPath, wellStructuredScript);
      
      const output = execSync(`node ${CLI_PATH} -a init well-structured ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Added init command');
    });
  });

  describe('Platform Compatibility Analysis', () => {
    test('should provide detailed platform compatibility information', () => {
      const windowsSpecificScript = `# Windows-specific PowerShell script
$ErrorActionPreference = "Stop"

Write-Host "Setting up Windows project..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "C:\\Projects\\MyApp"
Set-Location "C:\\Projects\\MyApp"

# Windows-specific operations
$env:PATH += ";C:\\CustomTools"
Get-WmiObject -Class Win32_ComputerSystem
Start-Process "notepad.exe" "README.md"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'windows-specific.ps1');
      writeFileSync(scriptPath, scriptPath);
      
      const output = execSync(`node ${CLI_PATH} -a backend windows-specific ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Platform Compatibility:');
      expect(output).toContain('Recommendations:');
    });

    test('should suggest appropriate alternatives for cross-platform compatibility', () => {
      const unixSpecificScript = `#!/bin/bash
# Unix-specific operations
export PATH=$PATH:/usr/local/bin
which docker || { echo "Docker not found"; exit 1; }
chmod +x setup.sh
./setup.sh
ps aux | grep node
kill -9 $(pidof old_process)`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'unix-specific.sh');
      writeFileSync(scriptPath, unixSpecificScript);
      
      const output = execSync(`node ${CLI_PATH} -a init unix-specific ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script appears to be unix-specific');
      expect(output).toContain('Windows Version: ✅ Generated');
    });
  });

  describe('CLI Command Completeness', () => {
    test('should support all CRUD operations with shortcuts', () => {
      const testScript = `echo "CRUD test script"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'crud-test.sh');
      writeFileSync(scriptPath, testScript);
      
      // Create
      let output = execSync(`node ${CLI_PATH} -a frontend crud-test ${scriptPath} -d "CRUD test"`, 
        { encoding: 'utf8' });
      expect(output).toContain('Added frontend command');
      
      // Read (list)
      output = execSync(`node ${CLI_PATH} -l -t frontend`, { encoding: 'utf8' });
      expect(output).toContain('crud-test');
      
      // Update
      writeFileSync(scriptPath, `echo "Updated CRUD test script"`);
      output = execSync(`node ${CLI_PATH} -u frontend crud-test ${scriptPath} -d "Updated CRUD test"`, 
        { encoding: 'utf8' });
      expect(output).toContain('Updated frontend command');
      
      // Delete
      output = execSync(`node ${CLI_PATH} -r frontend crud-test`, { encoding: 'utf8' });
      expect(output).toContain('Removed frontend command');
    });

    test('should support all shorthand aliases', () => {
      const testScript = `echo "Alias test"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'alias-test.sh');
      writeFileSync(scriptPath, testScript);
      
      // Test all add aliases
      execSync(`node ${CLI_PATH} -a frontend alias-test-1 ${scriptPath}`, { encoding: 'utf8' });
      
      // Test all list aliases
      let output = execSync(`node ${CLI_PATH} -l`, { encoding: 'utf8' });
      expect(output).toContain('alias-test-1');
      
      output = execSync(`node ${CLI_PATH} -l`, { encoding: 'utf8' });
      expect(output).toContain('alias-test-1');
      
      // Test all remove aliases
      execSync(`node ${CLI_PATH} -r frontend alias-test-1`, { encoding: 'utf8' });
      
      // Test edit alias
      execSync(`node ${CLI_PATH} -a frontend alias-test-2 ${scriptPath}`, { encoding: 'utf8' });
      execSync(`node ${CLI_PATH} -u frontend alias-test-2 ${scriptPath} -d "Edited via alias"`, { encoding: 'utf8' });
      
      output = execSync(`node ${CLI_PATH} -v -f alias-test-2`, { encoding: 'utf8' });
      expect(output).toContain('Edited via alias');
      
      execSync(`node ${CLI_PATH} -r frontend alias-test-2`, { encoding: 'utf8' });
    });
  });

  describe('Real-World Scenario Tests', () => {
    test('should handle complete full-stack project setup workflow', () => {
      // Create realistic scripts for each part
      const frontendScript = `#!/bin/bash
echo "🚀 Setting up React frontend..."
mkdir -p frontend
cd frontend
npx create-react-app . --template typescript
npm install @types/node @types/react @types/react-dom
mkdir -p src/{components,hooks,services,utils,types}
echo "Frontend setup complete!"`;
      
      const backendScript = `#!/bin/bash
echo "🚀 Setting up Express backend..."
mkdir -p backend
cd backend
npm init -y
npm install express cors helmet morgan
npm install -D @types/express @types/cors typescript ts-node-dev
mkdir -p src/{controllers,middleware,models,routes,services}
echo "Backend setup complete!"`;
      
      const initScript = `#!/bin/bash
echo "🚀 Initializing full-stack project..."
mkdir -p my-fullstack-app
cd my-fullstack-app
git init
echo "node_modules/" > .gitignore
echo "# My Full-Stack App" > README.md
mkdir -p {docs,scripts,tests}
echo "Project initialized!"`;
      
      // Add all scripts
      const frontendPath = join(TEST_SCRIPTS_DIR, 'fullstack-frontend.sh');
      const backendPath = join(TEST_SCRIPTS_DIR, 'fullstack-backend.sh');
      const initPath = join(TEST_SCRIPTS_DIR, 'fullstack-init.sh');
      
      writeFileSync(frontendPath, frontendScript);
      writeFileSync(backendPath, backendScript);
      writeFileSync(initPath, initScript);
      
      execSync(`node ${CLI_PATH} -a frontend fullstack-react ${frontendPath} --alias fsr`, { encoding: 'utf8' });
      execSync(`node ${CLI_PATH} -a backend fullstack-express ${backendPath} --alias fse`, { encoding: 'utf8' });
      execSync(`node ${CLI_PATH} -a init fullstack-setup ${initPath} --alias fss`, { encoding: 'utf8' });
      
      // Verify all commands are available
      const listOutput = execSync(`node ${CLI_PATH} -l`, { encoding: 'utf8' });
      expect(listOutput).toContain('fullstack-react (fsr)');
      expect(listOutput).toContain('fullstack-express (fse)');
      expect(listOutput).toContain('fullstack-setup (fss)');
      
      // Test viewing each command
      const frontendDetails = execSync(`node ${CLI_PATH} -v -f fsr`, { encoding: 'utf8' });
      expect(frontendDetails).toContain('Command Details: fullstack-react');
      expect(frontendDetails).toContain('Script Versions:');
      
      const backendDetails = execSync(`node ${CLI_PATH} -v -b fse`, { encoding: 'utf8' });
      expect(backendDetails).toContain('Command Details: fullstack-express');
      
      const initDetails = execSync(`node ${CLI_PATH} -v -i fss`, { encoding: 'utf8' });
      expect(initDetails).toContain('Command Details: fullstack-setup');
    });

    test('should handle complex script with multiple language ecosystems', () => {
      const polyglotScript = `#!/bin/bash
echo "🌐 Setting up polyglot development environment..."

# Node.js setup
echo "Setting up Node.js environment..."
node --version || echo "Node.js not found"
npm init -y
npm install typescript prettier eslint

# Python setup  
echo "Setting up Python environment..."
python3 --version || echo "Python not found"
python3 -m venv venv
source venv/bin/activate || echo "Virtual env activation failed"
pip install flask pytest black

# .NET setup
echo "Setting up .NET environment..."
dotnet --version || echo ".NET not found"
dotnet new gitignore

# Go setup
echo "Setting up Go environment..."
go version || echo "Go not found"
go mod init myproject || echo "Go mod init failed"

# Docker setup
echo "Setting up Docker environment..."
docker --version || echo "Docker not found"
echo "FROM node:18" > Dockerfile

echo "Polyglot environment setup complete!"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'polyglot-setup.sh');
      writeFileSync(scriptPath, polyglotScript);
      
      const output = execSync(`node ${CLI_PATH} -a init polyglot ${scriptPath} -d "Multi-language development setup"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Added init command');
      
      // View details to ensure proper conversion
      const detailsOutput = execSync(`node ${CLI_PATH} -v -i polyglot`, { encoding: 'utf8' });
      expect(detailsOutput).toContain('🔸 Original (unix, shell)');
      expect(detailsOutput).toContain('🔸 Windows Version:');
      expect(detailsOutput).toContain('Best for Current Platform');
    });
  });
});