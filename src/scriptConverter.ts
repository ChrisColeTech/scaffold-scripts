import { ScriptTypeInfo } from './scriptTypeDetector.js';

export interface ScriptVersions {
  original: string;
  windows?: string;
  unix?: string;
  crossPlatform?: string;
}

export class AdvancedScriptConverter {
  
  /**
   * Generate all platform versions of a script
   */
  generateVersions(originalScript: string, scriptType: ScriptTypeInfo, originalPlatform: string): ScriptVersions {
    const versions: ScriptVersions = {
      original: originalScript
    };

    // Generate platform-specific versions based on script type
    switch (scriptType.type) {
      case 'shell':
        versions.unix = originalScript; // Keep as-is for Unix
        versions.windows = this.convertShellToPowerShell(originalScript);
        versions.crossPlatform = this.generateCrossPlatformScript(originalScript, 'shell');
        break;
        
      case 'powershell':
        versions.windows = originalScript; // Keep as-is for Windows
        versions.unix = this.convertPowerShellToShell(originalScript);
        versions.crossPlatform = this.generateCrossPlatformScript(originalScript, 'powershell');
        break;
        
      case 'python':
      case 'nodejs':
        // Interpreter-based scripts work on all platforms with minor adjustments
        versions.unix = this.adjustForUnix(originalScript, scriptType.type);
        versions.windows = this.adjustForWindows(originalScript, scriptType.type);
        versions.crossPlatform = this.generateCrossPlatformScript(originalScript, scriptType.type);
        break;
        
      case 'batch':
        versions.windows = originalScript; // Keep as-is for Windows
        versions.unix = this.convertBatchToShell(originalScript);
        versions.crossPlatform = this.generateCrossPlatformScript(originalScript, 'batch');
        break;
        
      default:
        // For mixed or unknown types, try to generate cross-platform version
        versions.crossPlatform = this.generateCrossPlatformScript(originalScript, 'mixed');
        break;
    }

    return versions;
  }

  /**
   * Convert Shell script to PowerShell
   */
  private convertShellToPowerShell(script: string): string {
    return script
      // Directory operations
      .replace(/mkdir -p\s+([^\\s&|;]+)/g, 'New-Item -ItemType Directory -Force -Path "$1"')
      .replace(/mkdir\s+([^\\s&|;]+)/g, 'New-Item -ItemType Directory -Force -Path "$1"')
      .replace(/rmdir\s+([^\\s&|;]+)/g, 'Remove-Item -Recurse -Force -Path "$1"')
      .replace(/rm -rf\s+([^\\s&|;]+)/g, 'Remove-Item -Recurse -Force -Path "$1"')
      .replace(/rm\s+([^\\s&|;]+)/g, 'Remove-Item -Path "$1"')
      
      // File operations
      .replace(/touch\s+([^\\s&|;]+)/g, 'New-Item -ItemType File -Force -Path "$1"')
      .replace(/cp\s+([^\\s&|;]+)\s+([^\\s&|;]+)/g, 'Copy-Item -Path "$1" -Destination "$2"')
      .replace(/mv\s+([^\\s&|;]+)\s+([^\\s&|;]+)/g, 'Move-Item -Path "$1" -Destination "$2"')
      
      // Output and text operations
      .replace(/echo\s+"([^"]+)"/g, 'Write-Output "$1"')
      .replace(/echo\s+'([^']+)'/g, "Write-Output '$1'")
      .replace(/echo\s+([^\\s&|;]+)/g, 'Write-Output $1')
      .replace(/cat\s+([^\\s&|;]+)/g, 'Get-Content -Path "$1"')
      
      // Listing and finding
      .replace(/ls\s+([^\\s&|;]+)/g, 'Get-ChildItem -Path "$1"')
      .replace(/ls$/g, 'Get-ChildItem')
      .replace(/find\s+([^\\s&|;]+)\s+-name\s+"([^"]+)"/g, 'Get-ChildItem -Path "$1" -Name "$2" -Recurse')
      .replace(/grep\s+([^\\s&|;]+)\s+([^\\s&|;]+)/g, 'Select-String -Pattern "$1" -Path "$2"')
      
      // Environment and system
      .replace(/export\s+([A-Z_]+)=([^\\s&|;]+)/g, '$env:$1="$2"')
      .replace(/\$([A-Z_]+)/g, '$env:$1')
      .replace(/which\s+([^\\s&|;]+)/g, 'Get-Command "$1"')
      .replace(/whoami/g, '$env:USERNAME')
      .replace(/pwd/g, 'Get-Location')
      
      // Control flow - convert && and || to PowerShell equivalents
      .replace(/\s+&&\s+/g, '; if ($?) { ')
      .replace(/\s+\|\|\s+/g, ' } else { ')
      
      // Path separators
      .replace(/\//g, '\\\\')
      
      // Add proper PowerShell ending braces for control flow
      .replace(/$/g, (match, offset, string) => {
        const openBraces = (string.substring(0, offset).match(/if \(\$\?\) \{/g) || []).length;
        const closeBraces = (string.substring(0, offset).match(/\}/g) || []).length;
        return ' '.repeat(Math.max(0, openBraces - closeBraces)) + '}';
      });
  }

  /**
   * Convert PowerShell script to Shell
   */
  private convertPowerShellToShell(script: string): string {
    return script
      // Directory operations
      .replace(/New-Item -ItemType Directory -Force -Path\s+"?([^"\\s]+)"?/g, 'mkdir -p "$1"')
      .replace(/New-Item -ItemType Directory -Path\s+"?([^"\\s]+)"?/g, 'mkdir -p "$1"')
      .replace(/Remove-Item -Recurse -Force -Path\s+"?([^"\\s]+)"?/g, 'rm -rf "$1"')
      .replace(/Remove-Item -Path\s+"?([^"\\s]+)"?/g, 'rm "$1"')
      
      // File operations
      .replace(/New-Item -ItemType File -Force -Path\s+"?([^"\\s]+)"?/g, 'touch "$1"')
      .replace(/Copy-Item -Path\s+"?([^"\\s]+)"? -Destination\s+"?([^"\\s]+)"?/g, 'cp "$1" "$2"')
      .replace(/Move-Item -Path\s+"?([^"\\s]+)"? -Destination\s+"?([^"\\s]+)"?/g, 'mv "$1" "$2"')
      
      // Output and text operations
      .replace(/Write-Output\s+"([^"]+)"/g, 'echo "$1"')
      .replace(/Write-Output\s+'([^']+)'/g, "echo '$1'")
      .replace(/Write-Output\s+([^\\s;]+)/g, 'echo $1')
      .replace(/Write-Host\s+"([^"]+)"/g, 'echo "$1"')
      .replace(/Write-Host\s+'([^']+)'/g, "echo '$1'")
      .replace(/Write-Host\s+([^\\s;]+)/g, 'echo $1')
      .replace(/Get-Content -Path\s+"?([^"\\s]+)"?/g, 'cat "$1"')
      
      // Listing and finding
      .replace(/Get-ChildItem -Path\s+"?([^"\\s]+)"?/g, 'ls "$1"')
      .replace(/Get-ChildItem$/g, 'ls')
      .replace(/Get-ChildItem -Path\s+"?([^"\\s]+)"? -Name\s+"?([^"\\s]+)"? -Recurse/g, 'find "$1" -name "$2"')
      .replace(/Select-String -Pattern\s+"?([^"\\s]+)"? -Path\s+"?([^"\\s]+)"?/g, 'grep "$1" "$2"')
      
      // Environment and system
      .replace(/\$env:([A-Z_]+)="([^"]+)"/g, 'export $1="$2"')
      .replace(/\$env:([A-Z_]+)/g, '$$$1')
      .replace(/Get-Command\s+"?([^"\\s]+)"?/g, 'which "$1"')
      .replace(/\$env:USERNAME/g, '$(whoami)')
      .replace(/Get-Location/g, 'pwd')
      
      // Control flow
      .replace(/;\s*if\s*\(\$\?\)\s*\{/g, ' &&')
      .replace(/\}\s*else\s*\{/g, ' ||')
      .replace(/\}/g, '') // Remove remaining braces
      
      // Path separators
      .replace(/\\\\/g, '/');
  }

  /**
   * Convert Batch script to Shell
   */
  private convertBatchToShell(script: string): string {
    return script
      // Directory operations
      .replace(/mkdir\s+([^\\s&|]+)/gi, 'mkdir -p "$1"')
      .replace(/rmdir\s+\/s\s+([^\\s&|]+)/gi, 'rm -rf "$1"')
      .replace(/del\s+([^\\s&|]+)/gi, 'rm "$1"')
      
      // Output operations
      .replace(/echo\s+(.+)/gi, 'echo $1')
      .replace(/@echo\s+off/gi, '# Echo off equivalent')
      
      // File operations
      .replace(/copy\s+([^\\s&|]+)\s+([^\\s&|]+)/gi, 'cp "$1" "$2"')
      .replace(/move\s+([^\\s&|]+)\s+([^\\s&|]+)/gi, 'mv "$1" "$2"')
      .replace(/type\s+([^\\s&|]+)/gi, 'cat "$1"')
      
      // Directory listing
      .replace(/dir\s+([^\\s&|]+)/gi, 'ls "$1"')
      .replace(/dir$/gi, 'ls')
      
      // Environment variables
      .replace(/%([A-Z_]+)%/g, '$$$1')
      .replace(/set\s+([A-Z_]+)=([^\\s&|]+)/gi, 'export $1="$2"')
      
      // Control flow
      .replace(/if\s+exist\s+([^\\s&|]+)/gi, 'if [ -e "$1" ]')
      .replace(/goto\s+([^\\s&|]+)/gi, '# goto $1 - not directly supported in shell')
      
      // Path separators
      .replace(/\\\\/g, '/');
  }

  /**
   * Adjust interpreter-based scripts for Unix
   */
  private adjustForUnix(script: string, type: string): string {
    let adjusted = script;
    
    if (type === 'python') {
      adjusted = adjusted
        // Virtual environment activation
        .replace(/venv\\\\Scripts\\\\activate/g, 'venv/bin/activate')
        .replace(/source\s+venv\\\\Scripts\\\\activate/g, 'source venv/bin/activate')
        // Path separators
        .replace(/\\\\/g, '/');
    }
    
    if (type === 'nodejs') {
      adjusted = adjusted
        // npm/yarn commands work the same
        // Path separators
        .replace(/\\\\/g, '/');
    }
    
    return adjusted;
  }

  /**
   * Adjust interpreter-based scripts for Windows
   */
  private adjustForWindows(script: string, type: string): string {
    let adjusted = script;
    
    if (type === 'python') {
      adjusted = adjusted
        // Virtual environment activation
        .replace(/venv\/bin\/activate/g, 'venv\\\\Scripts\\\\activate')
        .replace(/source\s+venv\/bin\/activate/g, 'venv\\\\Scripts\\\\activate.bat')
        // Path separators
        .replace(/\//g, '\\\\');
    }
    
    if (type === 'nodejs') {
      adjusted = adjusted
        // npm/yarn commands work the same
        // Path separators
        .replace(/\//g, '\\\\');
    }
    
    return adjusted;
  }

  /**
   * Generate a cross-platform script using abstracted commands
   */
  private generateCrossPlatformScript(script: string, originalType: string): string {
    // For now, create a simplified cross-platform version with comments
    const lines = script.split('\n');
    const crossPlatformLines: string[] = [];
    
    crossPlatformLines.push('# Cross-platform script - automatically generated');
    crossPlatformLines.push('# Original type: ' + originalType);
    crossPlatformLines.push('');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
        crossPlatformLines.push(line);
        continue;
      }
      
      // Convert common operations to cross-platform comments
      if (trimmed.includes('mkdir')) {
        crossPlatformLines.push('# Create directory: ' + this.extractPath(trimmed));
      } else if (trimmed.includes('touch') || trimmed.includes('New-Item') && trimmed.includes('File')) {
        crossPlatformLines.push('# Create file: ' + this.extractPath(trimmed));
      } else if (trimmed.includes('echo') || trimmed.includes('Write-Output') || trimmed.includes('Write-Host')) {
        crossPlatformLines.push('# Output: ' + this.extractMessage(trimmed));
      } else if (trimmed.includes('ls') || trimmed.includes('Get-ChildItem') || trimmed.includes('dir')) {
        crossPlatformLines.push('# List directory: ' + this.extractPath(trimmed));
      } else {
        crossPlatformLines.push('# Execute: ' + trimmed);
      }
    }
    
    return crossPlatformLines.join('\n');
  }

  /**
   * Extract file/directory path from command
   */
  private extractPath(command: string): string {
    const pathMatch = command.match(/["']([^"']+)["']/) || command.match(/\s+([^\\s]+)$/);
    return pathMatch ? pathMatch[1] : 'unknown';
  }

  /**
   * Extract message from echo/output command
   */
  private extractMessage(command: string): string {
    const messageMatch = command.match(/echo\s+"([^"]+)"/) || 
                        command.match(/echo\s+'([^']+)'/) ||
                        command.match(/Write-Output\s+"([^"]+)"/) ||
                        command.match(/Write-Host\s+"([^"]+)"/);
    return messageMatch ? messageMatch[1] : command.replace(/^.*echo\s+|^.*Write-Output\s+|^.*Write-Host\s+/, '');
  }

  /**
   * Get the best script version for current platform
   */
  getBestScriptForPlatform(command: any, currentPlatform: string): string {
    const isWindows = currentPlatform === 'win32';
    
    // Priority order for script selection
    if (isWindows) {
      if (command.script_windows) return command.script_windows;
      if (command.script_cross_platform) return command.script_cross_platform;
      return command.script_original;
    } else {
      if (command.script_unix) return command.script_unix;
      if (command.script_cross_platform) return command.script_cross_platform;
      return command.script_original;
    }
  }
}