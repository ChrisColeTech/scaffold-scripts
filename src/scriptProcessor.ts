import { resolve } from 'path';
import { ScriptTypeDetector } from './scriptTypeDetector.js';
import { AdvancedScriptConverter } from './scriptConverter.js';
import { ScriptValidator } from './scriptValidator.js';
import { ScaffoldCommand } from './database.js';

export interface ProcessedScript {
  original: string;
  windows?: string;
  unix?: string;
  crossPlatform?: string;
  originalPlatform: 'windows' | 'unix' | 'cross-platform';
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
   * Process a script file for storage in the database
   */
  async processScriptFile(scriptPath: string, options: {
    strict?: boolean;
    allowNetworkAccess?: boolean;
    allowSystemModification?: boolean;
  } = {}): Promise<ProcessedScript> {
    
    // 1. Validate file type and read the script
    const absolutePath = resolve(scriptPath);
    const validation = this.validator.validateFromFile(absolutePath, {
      strict: options.strict || false,
      allowNetworkAccess: options.allowNetworkAccess || !options.strict,
      allowSystemModification: options.allowSystemModification || !options.strict
    });

    // Early return if file type validation failed
    if (!validation.isValid) {
      return {
        original: '',
        windows: undefined,
        unix: undefined,
        crossPlatform: undefined,
        originalPlatform: 'cross-platform',
        scriptType: 'shell',
        validation: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings
        }
      };
    }

    const originalScript = validation.sanitizedScript;
    const contentResult = await this.processScriptContent(originalScript, options);
    
    // Merge file validation warnings with content validation
    return {
      ...contentResult,
      validation: {
        ...contentResult.validation,
        warnings: [...validation.warnings, ...contentResult.validation.warnings]
      }
    };
  }

  /**
   * Process script content directly
   */
  async processScriptContent(originalScript: string, options: {
    strict?: boolean;
    allowNetworkAccess?: boolean;
    allowSystemModification?: boolean;
  } = {}): Promise<ProcessedScript> {

    // 1. Validate the original script
    const validation = this.validator.validate(originalScript, {
      strict: options.strict || false,
      allowNetworkAccess: options.allowNetworkAccess || !options.strict,
      allowSystemModification: options.allowSystemModification || !options.strict
    });

    // 2. Use sanitized script for further processing
    const sanitizedScript = validation.sanitizedScript;

    // 3. Detect script type and original platform
    const scriptType = this.detector.detectType(sanitizedScript);
    const originalPlatform = this.detector.detectPlatform(sanitizedScript);

    // 4. Generate cross-platform versions
    const versions = this.converter.generateVersions(sanitizedScript, scriptType, originalPlatform);

    // 5. Additional validation warnings for cross-platform compatibility
    if (originalPlatform !== 'cross-platform') {
      validation.warnings.push(`Script appears to be ${originalPlatform}-specific. Generated cross-platform versions may need manual review.`);
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
        warnings: validation.warnings
      }
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
      platform?: 'all' | 'windows' | 'unix';
    } = {}
  ): Omit<ScaffoldCommand, 'id'> {
    
    const now = new Date().toISOString();
    
    return {
      name,
      script_original: processedScript.original,
      script_windows: processedScript.windows,
      script_unix: processedScript.unix,
      script_cross_platform: processedScript.crossPlatform,
      original_platform: processedScript.originalPlatform,
      script_type: processedScript.scriptType as any,
      platform: options.platform || 'all',
      alias: options.alias,
      description: options.description,
      createdAt: now,
      updatedAt: now
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
    
    let bestVersion = 'original';
    if (bestScript === command.script_windows) bestVersion = 'windows';
    else if (bestScript === command.script_unix) bestVersion = 'unix';
    else if (bestScript === command.script_cross_platform) bestVersion = 'cross-platform';

    return {
      original: {
        content: command.script_original,
        platform: command.original_platform,
        type: command.script_type
      },
      windows: command.script_windows ? {
        content: command.script_windows,
        available: true
      } : { content: '', available: false },
      unix: command.script_unix ? {
        content: command.script_unix,
        available: true
      } : { content: '', available: false },
      crossPlatform: command.script_cross_platform ? {
        content: command.script_cross_platform,
        available: true
      } : { content: '', available: false },
      bestForCurrent: {
        content: bestScript,
        version: bestVersion
      }
    };
  }

  /**
   * Validate platform compatibility
   */
  validatePlatformCompatibility(command: ScaffoldCommand, targetPlatform: string): {
    compatible: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const isWindows = targetPlatform === 'win32';
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let compatible = true;

    // Check if we have appropriate version for target platform
    if (isWindows && !command.script_windows && command.original_platform === 'unix') {
      warnings.push('This script was written for Unix/Linux and may not work properly on Windows');
      recommendations.push('Consider adding a Windows-specific version with: scaffold update ' + 
                          command.name + ' /path/to/windows-script.ps1');
      compatible = false;
    } else if (!isWindows && !command.script_unix && command.original_platform === 'windows') {
      warnings.push('This script was written for Windows and may not work properly on Unix/Linux');
      recommendations.push('Consider adding a Unix-specific version with: scaffold update ' + 
                          command.name + ' /path/to/unix-script.sh');
      compatible = false;
    }

    // Check script type compatibility
    if (command.script_type === 'powershell' && !isWindows) {
      warnings.push('PowerShell scripts may not be available on this platform');
      recommendations.push('Install PowerShell Core or use the converted Unix version');
    } else if (command.script_type === 'batch' && !isWindows) {
      warnings.push('Batch scripts are not compatible with Unix/Linux platforms');
      compatible = false;
    }

    return {
      compatible,
      warnings,
      recommendations
    };
  }
}