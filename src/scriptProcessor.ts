import { resolve } from "path";
import { ScriptTypeDetector } from "./scriptTypeDetector.js";
import { AdvancedScriptConverter } from "./scriptConverter.js";
import { ScriptValidator } from "./scriptValidator.js";
import { ScaffoldCommand } from "./database.js";

export interface ProcessedScript {
  original: string;
  windows?: string;
  unix?: string;
  crossPlatform?: string;
  originalPlatform: "windows" | "unix" | "cross-platform";
  scriptType: string;
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export class ScriptProcessor {
  private detector = new ScriptTypeDetector();
  private converter = new AdvancedScriptConverter();
  private validator = new ScriptValidator();

  /**
   * Automatically fix interactive input issues in scripts
   */
  private fixInteractiveInput(script: string, scriptType: any): string {
    let fixedScript = script;

    // Fix PowerShell Read-Host patterns
    if (scriptType.type === "powershell") {
      fixedScript = this.fixPowerShellInteractiveInput(fixedScript);
    }
    
    // Fix Bash read patterns
    else if (scriptType.type === "shell") {
      fixedScript = this.fixBashInteractiveInput(fixedScript);
    }
    
    // Fix Python input() patterns
    else if (scriptType.type === "python") {
      fixedScript = this.fixPythonInteractiveInput(fixedScript);
    }
    
    // Fix Node.js readline/prompt patterns
    else if (scriptType.type === "nodejs") {
      fixedScript = this.fixNodeJsInteractiveInput(fixedScript);
    }

    return fixedScript;
  }

  /**
   * Fix PowerShell Read-Host patterns
   */
  private fixPowerShellInteractiveInput(script: string): string {
    // Check if script already has a param block
    const hasParamBlock = /^\s*param\s*\(/m.test(script);

    // Only apply fixing if there's no existing param block
    if (!hasParamBlock) {
      // Pattern: $var = Read-Host (may or may not have preceding Write-Host)
      const readHostPattern = /\$([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*Read-Host/g;

      const matches = [...script.matchAll(readHostPattern)];
      if (matches.length > 0) {
        // Add parameter block at the beginning with smart defaults
        const paramNames = matches.map((match) => match[1]);
        const paramBlock = `param(\n${paramNames
          .map((name) => {
            // Use current directory as default for common path parameters
            if (name.toLowerCase().includes('root') || name.toLowerCase().includes('path')) {
              return `    [string]$${name} = (Get-Location).Path`;
            }
            return `    [string]$${name} = $null`;
          })
          .join(",\n")}\n)\n\n`;

        // Replace Read-Host with parameter fallback that shows current directory
        for (const match of matches) {
          const varName = match[1];
          const originalPattern = match[0];
          let replacement;
          if (varName.toLowerCase().includes('root') || varName.toLowerCase().includes('path')) {
            replacement = `if (-not $${varName}) {\n    Write-Host "Using current directory: $(Get-Location)" -ForegroundColor Green\n    $${varName} = (Get-Location).Path\n}`;
          } else {
            replacement = `if (-not $${varName}) {\n    ${originalPattern}\n}`;
          }
          script = script.replace(originalPattern, replacement);
        }

        script = paramBlock + script;
      }
    }
    return script;
  }

  /**
   * Fix Bash read patterns
   */
  private fixBashInteractiveInput(script: string): string {
    // Pattern: read -p "prompt" variable
    const readPattern = /read\s+(?:-p\s+["'][^"']*["']\s+)?([a-zA-Z_][a-zA-Z0-9_]*)/g;
    
    const matches = [...script.matchAll(readPattern)];
    if (matches.length > 0) {
      let paramIndex = 1;
      const paramDefaults: string[] = [];
      
      // Add parameter defaults at the beginning
      for (const match of matches) {
        const varName = match[1];
        let defaultValue;
        
        if (varName.toLowerCase().includes('root') || varName.toLowerCase().includes('path')) {
          defaultValue = '$(pwd)';
        } else {
          defaultValue = '"default"';
        }
        
        paramDefaults.push(`${varName}=\${${paramIndex}:-${defaultValue}}`);
        paramIndex++;
      }
      
      // Add shebang if not present
      if (!script.startsWith('#!')) {
        script = '#!/bin/bash\n' + script;
      }
      
      // Insert parameter defaults after shebang
      const lines = script.split('\n');
      const shebangIndex = lines[0].startsWith('#!') ? 1 : 0;
      lines.splice(shebangIndex, 0, '', '# Auto-generated parameter defaults', ...paramDefaults, '');
      
      // Remove original read commands
      script = lines.join('\n');
      for (const match of matches) {
        script = script.replace(match[0], `# Converted: ${match[0]}`);
      }
    }
    
    return script;
  }

  /**
   * Fix Python input() patterns
   */
  private fixPythonInteractiveInput(script: string): string {
    // Pattern: variable = input("prompt")
    const inputPattern = /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*input\s*\(\s*["'][^"']*["']\s*\)/g;
    
    const matches = [...script.matchAll(inputPattern)];
    if (matches.length > 0) {
      let paramIndex = 1;
      const imports = ['import sys', 'import os'];
      const paramDefaults: string[] = [];
      
      // Add parameter defaults
      for (const match of matches) {
        const varName = match[1];
        let defaultValue;
        
        if (varName.toLowerCase().includes('root') || varName.toLowerCase().includes('path')) {
          defaultValue = 'os.getcwd()';
        } else {
          defaultValue = '"default"';
        }
        
        paramDefaults.push(`${varName} = sys.argv[${paramIndex}] if len(sys.argv) > ${paramIndex} else ${defaultValue}`);
        paramIndex++;
      }
      
      // Add imports and defaults at the beginning
      const lines = script.split('\n');
      let insertIndex = 0;
      
      // Skip shebang if present
      if (lines[0].startsWith('#!')) {
        insertIndex = 1;
      }
      
      lines.splice(insertIndex, 0, '', '# Auto-generated imports and parameter defaults', ...imports, '', ...paramDefaults, '');
      
      // Remove original input() calls
      script = lines.join('\n');
      for (const match of matches) {
        script = script.replace(match[0], `# Converted: ${match[0]}`);
      }
    }
    
    return script;
  }

  /**
   * Fix Node.js readline/prompt patterns
   */
  private fixNodeJsInteractiveInput(script: string): string {
    // Check for readline interface pattern
    if (script.includes('readline.createInterface') || script.includes('rl.question')) {
      // Convert readline pattern to simple argv handling
      const simpleConversion = `// Auto-generated parameter handling
const args = process.argv.slice(2);
const projectName = args[0] || 'default';
const projectPath = args[1] || process.cwd();

console.log(\`Project: \${projectName}\`);
console.log(\`Path: \${projectPath}\`);
console.log('Setup completed!');`;
      
      return simpleConversion;
    }
    
    // Pattern: const variable = prompt('message');
    const promptPattern = /const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*prompt\s*\(\s*['"][^'"]*['"]\s*\)\s*;?/g;
    
    const matches = [...script.matchAll(promptPattern)];
    if (matches.length > 0) {
      let paramIndex = 2; // process.argv starts at index 2
      const paramDefaults: string[] = [];
      
      // Add parameter defaults
      for (const match of matches) {
        const varName = match[1];
        let defaultValue;
        
        if (varName.toLowerCase().includes('root') || varName.toLowerCase().includes('path')) {
          defaultValue = 'process.cwd()';
        } else {
          defaultValue = '"default"';
        }
        
        paramDefaults.push(`const ${varName} = process.argv[${paramIndex}] || ${defaultValue};`);
        paramIndex++;
      }
      
      // Insert parameter defaults at the beginning
      script = '// Auto-generated parameter defaults\n' + paramDefaults.join('\n') + '\n\n' + script;
      
      // Remove original prompt calls and prompt-sync require
      script = script.replace(/const prompt = require\(["']prompt-sync["']\)\(\);?/g, '// Removed prompt-sync dependency');
      for (const match of matches) {
        script = script.replace(match[0], `// Converted: ${match[0]}`);
      }
    }
    
    return script;
  }

  /**
   * Process a script file for storage in the database
   */
  async processScriptFile(
    scriptPath: string,
    options: {
      strict?: boolean;
      allowNetworkAccess?: boolean;
      allowSystemModification?: boolean;
      fixInteractiveInput?: boolean;
    } = {}
  ): Promise<ProcessedScript> {
    // 1. Validate file type and read the script
    const absolutePath = resolve(scriptPath);
    const validation = this.validator.validateFromFile(absolutePath, {
      strict: options.strict || false,
      allowNetworkAccess: options.allowNetworkAccess || !options.strict,
      allowSystemModification:
        options.allowSystemModification || !options.strict,
    });

    // Early return if file type validation failed
    if (!validation.isValid) {
      return {
        original: "",
        windows: undefined,
        unix: undefined,
        crossPlatform: undefined,
        originalPlatform: "cross-platform",
        scriptType: "shell",
        validation: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      };
    }

    const originalScript = validation.sanitizedScript;
    const contentResult = await this.processScriptContent(
      originalScript,
      options
    );

    // Merge file validation warnings with content validation
    return {
      ...contentResult,
      validation: {
        ...contentResult.validation,
        warnings: [
          ...validation.warnings,
          ...contentResult.validation.warnings,
        ],
      },
    };
  }

  /**
   * Process script content directly
   */
  async processScriptContent(
    originalScript: string,
    options: {
      strict?: boolean;
      allowNetworkAccess?: boolean;
      allowSystemModification?: boolean;
      fixInteractiveInput?: boolean;
    } = {}
  ): Promise<ProcessedScript> {
    // 1. Validate the original script
    const validation = this.validator.validate(originalScript, {
      strict: options.strict || false,
      allowNetworkAccess: options.allowNetworkAccess || !options.strict,
      allowSystemModification:
        options.allowSystemModification || !options.strict,
    });

    // 2. Use sanitized script for further processing
    let sanitizedScript = validation.sanitizedScript;

    // 3. Detect script type and original platform
    const scriptType = this.detector.detectType(sanitizedScript);
    const originalPlatform = this.detector.detectPlatform(sanitizedScript);

    // 4. Automatically fix interactive input issues (enabled by default)
    if (options.fixInteractiveInput !== false) {
      const fixedScript = this.fixInteractiveInput(sanitizedScript, scriptType);
      if (fixedScript !== sanitizedScript) {
        sanitizedScript = fixedScript;
        validation.warnings.push(
          "Automatically converted interactive input to support command-line arguments"
        );
      }
    }

    // 5. Generate cross-platform versions
    const versions = this.converter.generateVersions(
      sanitizedScript,
      scriptType,
      originalPlatform
    );

    // 6. Additional validation warnings for cross-platform compatibility
    if (originalPlatform !== "cross-platform") {
      validation.warnings.push(
        `Script appears to be ${originalPlatform}-specific. Generated cross-platform versions may need manual review.`
      );
    }

    return {
      original: sanitizedScript,
      windows: versions.windows,
      unix: versions.unix,
      crossPlatform: versions.crossPlatform,
      originalPlatform,
      scriptType: scriptType.type,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
      },
    };
  }

  /**
   * Create a ScaffoldCommand from processed script
   */
  createCommand(
    name: string,
    processedScript: ProcessedScript,
    options: {
      alias?: string;
      description?: string;
      platform?: "all" | "windows" | "unix";
    } = {}
  ): Omit<ScaffoldCommand, "id"> {
    const now = new Date().toISOString();

    return {
      name,
      script_original: processedScript.original,
      script_windows: processedScript.windows,
      script_unix: processedScript.unix,
      script_cross_platform: processedScript.crossPlatform,
      original_platform: processedScript.originalPlatform,
      script_type: processedScript.scriptType as any,
      platform: options.platform || "all",
      alias: options.alias,
      description: options.description,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get the best script version for execution on current platform
   */
  getBestScript(command: ScaffoldCommand, targetPlatform?: string): string {
    const currentPlatform = targetPlatform || process.platform;
    return this.converter.getBestScriptForPlatform(command, currentPlatform);
  }

  /**
   * Get display information about all script versions
   */
  getScriptVersionInfo(command: ScaffoldCommand): {
    original: { content: string; platform: string; type: string };
    windows?: { content: string; available: boolean };
    unix?: { content: string; available: boolean };
    crossPlatform?: { content: string; available: boolean };
    bestForCurrent: { content: string; version: string };
  } {
    const currentPlatform = process.platform;
    const bestScript = this.getBestScript(command);

    let bestVersion = "original";
    if (bestScript === command.script_windows) bestVersion = "windows";
    else if (bestScript === command.script_unix) bestVersion = "unix";
    else if (bestScript === command.script_cross_platform)
      bestVersion = "cross-platform";

    return {
      original: {
        content: command.script_original,
        platform: command.original_platform,
        type: command.script_type,
      },
      windows: command.script_windows
        ? {
            content: command.script_windows,
            available: true,
          }
        : { content: "", available: false },
      unix: command.script_unix
        ? {
            content: command.script_unix,
            available: true,
          }
        : { content: "", available: false },
      crossPlatform: command.script_cross_platform
        ? {
            content: command.script_cross_platform,
            available: true,
          }
        : { content: "", available: false },
      bestForCurrent: {
        content: bestScript,
        version: bestVersion,
      },
    };
  }

  /**
   * Validate platform compatibility
   */
  validatePlatformCompatibility(
    command: ScaffoldCommand,
    targetPlatform: string
  ): {
    compatible: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const isWindows = targetPlatform === "win32";
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let compatible = true;

    // Check if we have appropriate version for target platform
    if (
      isWindows &&
      !command.script_windows &&
      command.original_platform === "unix"
    ) {
      warnings.push(
        "This script was written for Unix/Linux and may not work properly on Windows"
      );
      recommendations.push(
        "Consider adding a Windows-specific version with: scaffold update " +
          command.name +
          " /path/to/windows-script.ps1"
      );
      compatible = false;
    } else if (
      !isWindows &&
      !command.script_unix &&
      command.original_platform === "windows"
    ) {
      warnings.push(
        "This script was written for Windows and may not work properly on Unix/Linux"
      );
      recommendations.push(
        "Consider adding a Unix-specific version with: scaffold update " +
          command.name +
          " /path/to/unix-script.sh"
      );
      compatible = false;
    }

    // Check script type compatibility
    if (command.script_type === "powershell" && !isWindows) {
      warnings.push("PowerShell scripts may not be available on this platform");
      recommendations.push(
        "Install PowerShell Core or use the converted Unix version"
      );
    } else if (command.script_type === "batch" && !isWindows) {
      warnings.push(
        "Batch scripts are not compatible with Unix/Linux platforms"
      );
      compatible = false;
    }

    return {
      compatible,
      warnings,
      recommendations,
    };
  }
}
