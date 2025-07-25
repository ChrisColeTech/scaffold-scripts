import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import { ScriptTypeDetector, ScriptTypeInfo } from './scriptTypeDetector.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

export class ScriptExecutor {
  private isWindows = platform() === 'win32';
  private typeDetector = new ScriptTypeDetector();
  
  /**
   * Convert script to appropriate platform format
   */
  convertScript(script: string, targetPlatform?: string): string {
    const shouldConvertToWindows = targetPlatform === 'windows' || 
      (targetPlatform === 'all' && this.isWindows);
    
    if (shouldConvertToWindows) {
      return this.convertToWindows(script);
    } else {
      return this.convertToUnix(script);
    }
  }

  /**
   * Convert script to Windows PowerShell format
   */
  private convertToWindows(script: string): string {
    return script
      // Convert directory separators
      .replace(/\//g, '\\\\')
      // Convert mkdir to ni (New-Item)
      .replace(/mkdir -p\s+/g, 'ni -ItemType Directory -Force -Path ')
      .replace(/mkdir\s+/g, 'ni -ItemType Directory -Force -Path ')
      // Convert touch to ni (New-Item)
      .replace(/touch\s+/g, 'ni -ItemType File -Force -Path ')
      // Convert Python virtual environment activation
      .replace(/source\s+([^\\s]+)\/bin\/activate/g, '$1\\\\Scripts\\\\activate.ps1')
      .replace(/\.\s+([^\\s]+)\/bin\/activate/g, '$1\\\\Scripts\\\\activate.ps1')
      // Convert shell-specific commands
      .replace(/export\s+([A-Z_]+)=([^\\s;]+)/g, '$env:$1="$2"')
      .replace(/which\s+/g, 'Get-Command ')
      // Convert && to semicolons for PowerShell
      .replace(/\s+&&\s+/g, '; ')
      // Convert environment variables
      .replace(/\$([A-Z_]+)/g, '$env:$1')
      // Convert common Unix commands
      .replace(/\bls\b/g, 'Get-ChildItem')
      .replace(/\bcp\s+/g, 'Copy-Item ')
      .replace(/\bmv\s+/g, 'Move-Item ')
      // Ensure paths are quoted if they contain spaces
      .replace(/(ni -ItemType \w+ -Force -Path\s+)([^'"][^;]*)/g, (match, prefix, paths) => {
        // Split paths and quote each one
        const pathList = paths.split(',').map((p: string) => p.trim()).map((p: string) => {
          if (!p.startsWith("'") && !p.startsWith('"')) {
            return `'${p}'`;
          }
          return p;
        }).join(',');
        return prefix + pathList;
      });
  }

  /**
   * Convert script to Unix/Linux format
   */
  private convertToUnix(script: string): string {
    return script
      // Convert directory separators
      .replace(/\\\\/g, '/')
      .replace(/\\\\/g, '/')
      // Convert ni (New-Item) to mkdir/touch
      .replace(/ni -ItemType Directory -Force -Path\s+/g, 'mkdir -p ')
      .replace(/ni -ItemType File -Force -Path\s+/g, 'touch ')
      // Convert Python virtual environment activation
      .replace(/([^\\s]+)\\\\Scripts\\\\activate\.ps1/g, 'source $1/bin/activate')
      // Convert PowerShell commands to Unix equivalents
      .replace(/\$env:([A-Z_]+)="([^"]+)"/g, 'export $1="$2"')
      .replace(/Get-Command\s+/g, 'which ')
      .replace(/Get-ChildItem/g, 'ls')
      .replace(/Copy-Item\s+/g, 'cp ')
      .replace(/Move-Item\s+/g, 'mv ')
      // Convert semicolons back to &&
      .replace(/;\s+/g, ' && ')
      // Convert PowerShell environment variables
      .replace(/\$env:([A-Z_]+)/g, '$$$1')
      // Remove quotes from simple paths
      .replace(/'([^']*?)'/g, '$1')
      .replace(/"([^"]*?)"/g, '$1');
  }

  /**
   * Get script type info from string
   */
  private getScriptTypeInfo(type: string): ScriptTypeInfo {
    switch (type) {
      case 'nodejs':
        return { type: 'nodejs', interpreters: ['node'], extensions: ['.js', '.mjs'] };
      case 'python':
        return { type: 'python', interpreters: ['python', 'python3'], extensions: ['.py'] };
      case 'powershell':
        return { type: 'powershell', interpreters: ['powershell', 'pwsh'], extensions: ['.ps1'] };
      case 'shell':
        return { type: 'shell', interpreters: ['bash'], extensions: ['.sh'] };
      case 'batch':
        return { type: 'batch', interpreters: ['cmd'], extensions: ['.bat', '.cmd'] };
      default:
        return { type: 'shell', interpreters: ['bash'], extensions: ['.sh'] };
    }
  }

  /**
   * Execute the script in the current directory with real-time output streaming
   */
  async executeScript(script: string, targetPlatform?: string, args: string[] = [], knownScriptType?: string): Promise<{ stdout: string; stderr: string }> {
    const scriptType = knownScriptType ? 
      this.getScriptTypeInfo(knownScriptType) : 
      this.typeDetector.detectType(script);
    console.log(`Using script type: ${scriptType.type}`);
    
    // Check if required interpreters are available
    const availability = await this.typeDetector.checkInterpreterAvailability(scriptType);
    if (availability.available.length === 0 && availability.missing.length > 0) {
      throw new Error(`Required interpreters not found: ${availability.missing.join(', ')}. Please install them first.`);
    }

    // For Python, Node.js, PowerShell, or other interpreter-based scripts, create a temporary file
    if (['python', 'nodejs', 'powershell'].includes(scriptType.type)) {
      return this.executeInterpreterScriptWithStreaming(script, scriptType, args);
    }
    
    // For shell/batch scripts, use the converted approach
    const convertedScript = this.convertScript(script, targetPlatform);
    
    console.log('\\n--- Executing Script ---');
    console.log(convertedScript);
    console.log('--- End Script ---\\n');
    
    return this.executeWithStreaming(convertedScript);
  }

  /**
   * Execute a command with real-time output streaming
   */
  private async executeWithStreaming(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Detect best available shell
        let shell = '/bin/bash';
        let shellArgs = ['-c'];
        
        if (this.isWindows) {
          // On Windows, try powershell.exe first, then pwsh as fallback
          try {
            await execAsync('where powershell.exe', { timeout: 1000 });
            shell = 'powershell.exe';
            shellArgs = ['-Command'];
          } catch {
            try {
              await execAsync('where pwsh', { timeout: 1000 });
              shell = 'pwsh';
              shellArgs = ['-Command'];
            } catch {
              // If neither PowerShell is available on Windows, use cmd
              shell = 'cmd';
              shellArgs = ['/c'];
            }
          }
        } else {
          // On Unix-like systems, try pwsh first, then bash as fallback
          try {
            await execAsync('which pwsh', { timeout: 1000 });
            shell = 'pwsh';
            shellArgs = ['-Command'];
          } catch {
            shell = '/bin/bash';
            shellArgs = ['-c'];
          }
        }

        const child = spawn(shell, [...shellArgs, command], {
          cwd: process.cwd(),
          stdio: ['inherit', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        // Stream stdout in real-time
        child.stdout?.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          // Write directly to stdout to preserve formatting
          process.stdout.write(output);
        });

        // Stream stderr in real-time
        child.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          // Write directly to stderr to preserve formatting
          process.stderr.write(output);
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`Script execution failed with exit code ${code}`));
          }
        });

        child.on('error', (error) => {
          reject(new Error(`Script execution failed: ${error.message}`));
        });

      } catch (error: any) {
        reject(new Error(`Script execution failed: ${error.message}`));
      }
    });
  }

  /**
   * Execute interpreter-based scripts (Python, Node.js, etc.)
   */
  private async executeInterpreterScript(script: string, scriptType: any, args: string[] = []): Promise<{ stdout: string; stderr: string }> {
    // Create temporary directory
    const tempDir = join(tmpdir(), 'scaffold-scripts');
    mkdirSync(tempDir, { recursive: true });
    
    // Create temporary script file
    const extension = scriptType.extensions[0];
    const tempFile = join(tempDir, `temp_script${extension}`);
    writeFileSync(tempFile, script);
    
    console.log(`\\n--- Executing ${scriptType.type} Script ---`);
    console.log(script);
    console.log('--- End Script ---\\n');
    
    try {
      let command = this.typeDetector.getExecutionCommand(scriptType, tempFile);
      
      // Add script arguments for PowerShell
      if (scriptType.type === 'powershell' && args.length > 0) {
        command += ' ' + args.join(' ');
      }
      
      const result = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      return result;
    } catch (error: any) {
      throw new Error(`${scriptType.type} script execution failed: ${error.message}`);
    }
  }

  /**
   * Execute interpreter-based scripts with real-time output streaming
   */
  private async executeInterpreterScriptWithStreaming(script: string, scriptType: any, args: string[] = []): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      // Create temporary directory
      const tempDir = join(tmpdir(), 'scaffold-scripts');
      mkdirSync(tempDir, { recursive: true });
      
      // Create temporary script file
      const extension = scriptType.extensions[0];
      const tempFile = join(tempDir, `temp_script${extension}`);
      writeFileSync(tempFile, script);
      
      console.log(`\\n--- Executing ${scriptType.type} Script ---`);
      console.log(script);
      console.log('--- End Script ---\\n');
      
      try {
        let command = this.typeDetector.getExecutionCommand(scriptType, tempFile);
        
        // Parse command and arguments for spawn, handling quoted paths properly
        const parseCommand = (cmd: string): { executable: string; args: string[] } => {
          const parts: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < cmd.length; i++) {
            const char = cmd[i];
            if (char === '"' && (i === 0 || cmd[i-1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === ' ' && !inQuotes) {
              if (current) {
                parts.push(current);
                current = '';
              }
            } else {
              current += char;
            }
          }
          if (current) {
            parts.push(current);
          }
          
          return {
            executable: parts[0],
            args: parts.slice(1)
          };
        };
        
        const { executable, args: execArgs } = parseCommand(command);
        
        // Add script arguments for PowerShell
        if (scriptType.type === 'powershell' && args.length > 0) {
          execArgs.push(...args);
        }
        
        const child = spawn(executable, execArgs, {
          cwd: process.cwd(),
          stdio: ['inherit', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        // Stream stdout in real-time
        child.stdout?.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          // Write directly to stdout to preserve formatting
          process.stdout.write(output);
        });

        // Stream stderr in real-time
        child.stderr?.on('data', (data) => {
          const output = data.toString();
          stderr += output;
          // Write directly to stderr to preserve formatting
          process.stderr.write(output);
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`${scriptType.type} script execution failed with exit code ${code}`));
          }
        });

        child.on('error', (error) => {
          reject(new Error(`${scriptType.type} script execution failed: ${error.message}`));
        });

      } catch (error: any) {
        reject(new Error(`${scriptType.type} script execution failed: ${error.message}`));
      }
    });
  }

  /**
   * Preview what the script will look like when converted
   */
  previewScript(script: string, targetPlatform?: string): string {
    return this.convertScript(script, targetPlatform);
  }
}