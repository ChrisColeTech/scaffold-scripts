/**
 * Happy Path Tests for Scaffold Scripts CLI
 * Tests all successful scenarios and expected behaviors
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

// Test setup
const TEST_DB_PATH = join(__dirname, 'test-data', 'happy-path.db');
const TEST_SCRIPTS_DIR = join(__dirname, 'test-scripts');
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

describe('Happy Path Tests', () => {
  
  describe('CLI Basic Operations', () => {
    test('should show help information', () => {
      const output = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf8' });
      expect(output).toContain('CLI tool for scaffolding frontend and backend projects');
      expect(output).toContain('Commands:');
      expect(output).toContain('add|a');
      expect(output).toContain('list|ls');
    });

    test('should show version information', () => {
      const output = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf8' });
      expect(output).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Script Addition - Happy Paths', () => {
    test('should add a simple shell frontend script', () => {
      const scriptContent = `#!/bin/bash
echo "Creating React app..."
npx create-react-app my-app --template typescript
cd my-app
npm start`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'react-simple.sh');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add frontend react-simple ${scriptPath} -d "Simple React TypeScript setup"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Added frontend command "react-simple"');
      expect(output).toContain('Windows Version: ✅ Generated');
      expect(output).toContain('Unix Version: ✅ Generated');
    });

    test('should add a PowerShell backend script', () => {
      const scriptContent = `# PowerShell ASP.NET Core setup
Write-Host "Creating ASP.NET Core API..." -ForegroundColor Blue
dotnet new webapi -f net8.0 --output .
New-Item -ItemType Directory -Force -Path "Models"
New-Item -ItemType Directory -Force -Path "Services"
dotnet run`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'aspnet-simple.ps1');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add backend aspnet-simple ${scriptPath} -a asp -d "Simple ASP.NET Core API"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Added backend command "aspnet-simple"');
      expect(output).toContain('Alias: asp');
    });

    test('should add a Python init script', () => {
      const scriptContent = `#!/usr/bin/env python3
import os
import subprocess

print("Setting up Python project...")
os.makedirs("src", exist_ok=True)
os.makedirs("tests", exist_ok=True)

with open("requirements.txt", "w") as f:
    f.write("flask\\nrequests\\npytest\\n")

print("Python project structure created!")`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'python-init.py');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add init python-project ${scriptPath} -d "Python project initialization"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Added init command "python-project"');
      expect(output).toContain('Script Type: python');
    });

    test('should add a Node.js cross-platform script', () => {
      const scriptContent = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('Creating Node.js project...');

const packageJson = {
  name: 'my-node-app',
  version: '1.0.0',
  main: 'index.js',
  scripts: {
    start: 'node index.js',
    test: 'jest'
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
fs.mkdirSync('src', { recursive: true });
fs.mkdirSync('tests', { recursive: true });

console.log('Node.js project created!');`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'node-init.js');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add init node-project ${scriptPath} -d "Node.js project initialization"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Added init command "node-project"');
      expect(output).toContain('Script Type: nodejs');
    });
  });

  describe('Script Listing and Viewing', () => {
    test('should list all commands', () => {
      const output = execSync(`node ${CLI_PATH} list`, { encoding: 'utf8' });
      expect(output).toContain('Available Commands');
      expect(output).toContain('FRONTEND:');
      expect(output).toContain('BACKEND:');
      expect(output).toContain('INIT:');
    });

    test('should list commands by type', () => {
      const output = execSync(`node ${CLI_PATH} list -t frontend`, { encoding: 'utf8' });
      expect(output).toContain('Available Commands (frontend)');
      expect(output).toContain('react-simple');
    });

    test('should show detailed command information', () => {
      const output = execSync(`node ${CLI_PATH} -f react-simple -v`, { encoding: 'utf8' });
      expect(output).toContain('Command Details: react-simple');
      expect(output).toContain('Script Versions:');
      expect(output).toContain('Original (');
      expect(output).toContain('Best for Current Platform');
    });
  });

  describe('Script Updates', () => {
    test('should update existing script', () => {
      const newScriptContent = `#!/bin/bash
echo "Creating updated React app..."
npx create-react-app my-app --template typescript
cd my-app
npm install @types/node
npm start`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'react-updated.sh');
      writeFileSync(scriptPath, newScriptContent);
      
      const output = execSync(`node ${CLI_PATH} update frontend react-simple ${scriptPath} -d "Updated React setup with @types/node"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Updated frontend command "react-simple"');
    });

    test('should update script alias and description', () => {
      const scriptPath = join(TEST_SCRIPTS_DIR, 'react-updated.sh'); // Reuse existing file
      
      const output = execSync(`node ${CLI_PATH} update frontend react-simple ${scriptPath} -a react-ts -d "React TypeScript with enhanced setup"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Updated frontend command "react-simple"');
      expect(output).toContain('Alias: react-ts');
    });
  });

  describe('Cross-Platform Compatibility', () => {
    test('should detect script type correctly', () => {
      // Test shell script detection
      const shellOutput = execSync(`node ${CLI_PATH} -f react-simple -v`, { encoding: 'utf8' });
      expect(shellOutput).toContain('Script Type: shell');
      
      // Test PowerShell script detection  
      const psOutput = execSync(`node ${CLI_PATH} -b aspnet-simple -v`, { encoding: 'utf8' });
      expect(psOutput).toContain('Script Type: powershell');
      
      // Test Python script detection
      const pyOutput = execSync(`node ${CLI_PATH} -i python-project -v`, { encoding: 'utf8' });
      expect(pyOutput).toContain('Script Type: python');
    });

    test('should generate platform-specific versions', () => {
      const output = execSync(`node ${CLI_PATH} -f react-simple -v`, { encoding: 'utf8' });
      expect(output).toContain('🔸 Original (');
      expect(output).toContain('🔸 Windows Version:');
      expect(output).toContain('🔸 Unix Version:');
      expect(output).toContain('🔸 Cross-Platform Version:');
    });

    test('should provide platform compatibility warnings', () => {
      const output = execSync(`node ${CLI_PATH} -b aspnet-simple -v`, { encoding: 'utf8' });
      // Should show compatibility info for PowerShell on Unix
      expect(output).toMatch(/(Platform Compatibility|compatible with current platform)/);
    });
  });

  describe('Script Removal', () => {
    test('should remove existing command', () => {
      const output = execSync(`node ${CLI_PATH} remove init python-project`, { encoding: 'utf8' });
      expect(output).toContain('Removed init command "python-project"');
    });

    test('should handle removal with aliases', () => {
      const output = execSync(`node ${CLI_PATH} rm init node-project`, { encoding: 'utf8' });
      expect(output).toContain('Removed init command "node-project"');
    });
  });

  describe('Shorthand Commands', () => {
    test('should work with shorthand add command', () => {
      const scriptContent = `echo "Quick test script"`;
      const scriptPath = join(TEST_SCRIPTS_DIR, 'quick-test.sh');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} a init quick-test ${scriptPath} -d "Quick test"`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Added init command "quick-test"');
    });

    test('should work with shorthand list command', () => {
      const output = execSync(`node ${CLI_PATH} ls`, { encoding: 'utf8' });
      expect(output).toContain('Available Commands');
    });

    test('should work with multiple aliases for remove', () => {
      const output1 = execSync(`node ${CLI_PATH} delete init quick-test`, { encoding: 'utf8' });
      expect(output1).toContain('Removed init command "quick-test"');
    });
  });

  describe('Validation Success Cases', () => {
    test('should pass validation for safe shell script', () => {
      const scriptContent = `#!/bin/bash
mkdir -p src/components
touch src/components/App.js
echo "Project created"`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'safe-script.sh');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add frontend safe-script ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).not.toContain('validation failed');
    });

    test('should handle scripts with warnings gracefully', () => {
      const scriptContent = `#!/bin/bash
# Script with potential warnings but still valid
curl -sSL https://get.docker.com | sh
mkdir -p /opt/myapp`;
      
      const scriptPath = join(TEST_SCRIPTS_DIR, 'warning-script.sh');
      writeFileSync(scriptPath, scriptContent);
      
      const output = execSync(`node ${CLI_PATH} add init warning-script ${scriptPath}`, 
        { encoding: 'utf8' });
      
      expect(output).toContain('Script validation passed');
      expect(output).toContain('Warnings:');
    });
  });
});