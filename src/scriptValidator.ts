import { readFileSync } from 'fs';
import { resolve, extname } from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedScript: string;
}

export interface ValidationOptions {
  strict?: boolean;
  allowNetworkAccess?: boolean;
  allowSystemModification?: boolean;
}

export class ScriptValidator {
  private allowedExtensions = [
    '.sh', '.bash', '.zsh', '.fish',           // Shell scripts
    '.ps1', '.psm1',                           // PowerShell
    '.py', '.py3',                             // Python
    '.js', '.mjs', '.ts',                      // JavaScript/TypeScript
    '.rb',                                     // Ruby
    '.pl',                                     // Perl
    '.bat', '.cmd',                            // Batch/CMD
    '.txt', '.text',                           // Plain text
    ''                                         // No extension (common for shell scripts)
  ];

  private binaryExtensions = [
    '.exe', '.dll', '.so', '.dylib',           // Executables/Libraries
    '.bin', '.com', '.msi', '.deb', '.rpm',    // Binary packages
    '.jpg', '.jpeg', '.png', '.gif', '.bmp',   // Images
    '.mp3', '.wav', '.mp4', '.avi', '.mov',    // Media
    '.zip', '.tar', '.gz', '.7z', '.rar',      // Archives
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',  // Documents
    '.class', '.jar',                          // Compiled Java
    '.o', '.obj', '.a', '.lib'                 // Compiled objects
  ];

  private dangerousCommands = [
    // Destructive operations
    'rm -rf', 'del /s', 'rmdir /s', 'format', 'fdisk',
    // System modification
    'sudo', 'runas', 'net user', 'useradd', 'passwd',
    // Network operations (can be allowed with flag)
    'curl', 'wget', 'invoke-webrequest', 'net use',
    // Registry modification
    'reg add', 'reg delete', 'regedit',
    // Service management
    'sc create', 'sc delete', 'systemctl',
    // Package management (potentially dangerous)
    'apt-get remove', 'yum remove', 'choco uninstall'
  ];

  private allowedCommands = [
    // Directory operations
    'mkdir', 'ni -itemtype directory', 'cd', 'pushd', 'popd',
    // File operations
    'touch', 'ni -itemtype file', 'echo', 'write-output',
    // Package management (safe)
    'npm', 'yarn', 'pnpm', 'dotnet', 'pip install', 'apt-get install',
    'choco install', 'brew install',
    // Git operations
    'git clone', 'git init', 'git add', 'git commit',
    // Build tools
    'cmake', 'make', 'msbuild', 'gradle', 'mvn'
  ];

  /**
   * Validate and sanitize a script
   */
  validate(script: string, options: ValidationOptions = {}): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedScript: script
    };

    // 1. Basic sanitization
    result.sanitizedScript = this.sanitizeScript(script);

    // 2. Check if this is a PowerShell script for adjusted validation
    const isPowerShell = this.isPowerShellScript(script);

    // 3. Check for dangerous commands (more lenient for PowerShell)
    const dangerousFound = this.checkDangerousCommands(result.sanitizedScript, isPowerShell);
    if (dangerousFound.length > 0) {
      if (options.strict && !isPowerShell) {
        result.errors.push(`Dangerous commands detected: ${dangerousFound.join(', ')}`);
        result.isValid = false;
      } else {
        result.warnings.push(`Potentially dangerous commands: ${dangerousFound.join(', ')}`);
      }
    }

    // 4. Check for network access
    const networkCommands = this.checkNetworkCommands(result.sanitizedScript);
    if (networkCommands.length > 0 && !options.allowNetworkAccess) {
      if (options.strict && !isPowerShell) {
        result.errors.push(`Network commands not allowed: ${networkCommands.join(', ')}`);
        result.isValid = false;
      } else {
        result.warnings.push(`Network access detected: ${networkCommands.join(', ')}`);
      }
    }

    // 5. Check for system modifications (more lenient for PowerShell)
    const systemMods = this.checkSystemModifications(result.sanitizedScript, isPowerShell);
    if (systemMods.length > 0 && !options.allowSystemModification) {
      if (options.strict && !isPowerShell) {
        result.errors.push(`System modifications not allowed: ${systemMods.join(', ')}`);
        result.isValid = false;
      } else {
        result.warnings.push(`System modifications detected: ${systemMods.join(', ')}`);
      }
    }

    // 6. Validate script structure (PowerShell-aware)
    const structureErrors = this.validateStructure(result.sanitizedScript);
    if (structureErrors.length > 0) {
      // For PowerShell scripts, only fail on critical structure errors
      if (isPowerShell) {
        const criticalErrors = structureErrors.filter(error => 
          error.includes('Script cannot be empty') || 
          error.includes('no executable commands')
        );
        if (criticalErrors.length > 0) {
          result.errors.push(...criticalErrors);
          result.isValid = false;
        } else {
          result.warnings.push(...structureErrors);
        }
      } else {
        result.errors.push(...structureErrors);
        result.isValid = false;
      }
    }

    // 7. Cross-platform compatibility check
    const compatibilityWarnings = this.checkCrossPlatformCompatibility(result.sanitizedScript);
    result.warnings.push(...compatibilityWarnings);

    return result;
  }

  /**
   * Load and validate script from file
   */
  validateFromFile(filePath: string, options: ValidationOptions = {}): ValidationResult {
    try {
      const absolutePath = resolve(filePath);
      
      // Validate file type before reading
      const fileTypeValidation = this.validateFileType(absolutePath);
      if (!fileTypeValidation.isValid) {
        return fileTypeValidation;
      }
      
      const script = readFileSync(absolutePath, 'utf-8');
      
      // Validate content
      const contentValidation = this.validate(script, options);
      
      // Merge file type warnings with content validation
      return {
        ...contentValidation,
        warnings: [...fileTypeValidation.warnings, ...contentValidation.warnings]
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Failed to read script file: ${error.message}`],
        warnings: [],
        sanitizedScript: ''
      };
    }
  }

  /**
   * Validate file type and extension
   */
  private validateFileType(filePath: string): ValidationResult {
    const ext = extname(filePath).toLowerCase();
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedScript: ''
    };

    // Check for binary file extensions
    if (this.binaryExtensions.includes(ext)) {
      result.isValid = false;
      result.errors.push(`Binary file type not supported: ${ext}`);
      return result;
    }

    // Check for allowed extensions
    if (!this.allowedExtensions.includes(ext)) {
      result.warnings.push(`Unusual file extension for script: ${ext}. Consider using .sh, .ps1, .py, .js, or .bat`);
    }

    // Additional check for files that might contain binary data
    try {
      const buffer = readFileSync(filePath);
      if (this.isBinaryContent(buffer)) {
        result.isValid = false;
        result.errors.push('File appears to contain binary data, not text');
        return result;
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Cannot read file: ${error}`);
      return result;
    }

    return result;
  }

  /**
   * Check if buffer contains binary data
   */
  private isBinaryContent(buffer: Buffer): boolean {
    // Check for null bytes (common in binary files)
    if (buffer.includes(0)) {
      return true;
    }

    // Check for high percentage of non-printable characters
    let nonPrintable = 0;
    const sampleSize = Math.min(buffer.length, 1024); // Check first 1KB
    
    for (let i = 0; i < sampleSize; i++) {
      const byte = buffer[i];
      // Allow printable ASCII, newline, tab, carriage return
      if (!(byte >= 32 && byte <= 126) && byte !== 10 && byte !== 13 && byte !== 9) {
        nonPrintable++;
      }
    }

    // If more than 30% non-printable characters, likely binary
    return (nonPrintable / sampleSize) > 0.3;
  }

  /**
   * Basic script sanitization
   */
  private sanitizeScript(script: string): string {
    return script
      // Remove dangerous path traversals
      .replace(/\.\.\//g, '')
      .replace(/\.\.\\]/g, '')
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive whitespace
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      // Trim the entire script
      .trim();
  }

  /**
   * Check for dangerous commands
   */
  private checkDangerousCommands(script: string, isPowerShell: boolean = false): string[] {
    const found: string[] = [];
    const lowerScript = script.toLowerCase();
    
    // Create filtered list for PowerShell scripts
    const commandsToCheck = isPowerShell 
      ? this.dangerousCommands.filter(cmd => 
          !cmd.includes('rm -rf') && // PowerShell uses Remove-Item
          !cmd.includes('del /s') && // Less relevant for PowerShell
          !cmd.includes('sudo') // PowerShell uses different elevation
        )
      : this.dangerousCommands;
    
    for (const cmd of commandsToCheck) {
      if (lowerScript.includes(cmd.toLowerCase())) {
        found.push(cmd);
      }
    }
    
    // Add PowerShell-specific dangerous commands
    if (isPowerShell) {
      const powershellDangerous = [
        'Remove-Item -Recurse -Force',
        'Remove-Item.*-Recurse.*-Force',
        'Start-Process.*-Verb RunAs',
        'Invoke-Expression',
        'iex '
      ];
      
      for (const cmd of powershellDangerous) {
        if (lowerScript.match(new RegExp(cmd.toLowerCase(), 'i'))) {
          found.push(cmd);
        }
      }
    }
    
    return found;
  }

  /**
   * Check for network commands
   */
  private checkNetworkCommands(script: string): string[] {
    const networkCommands = ['curl', 'wget', 'invoke-webrequest', 'fetch'];
    const found: string[] = [];
    const lowerScript = script.toLowerCase();
    
    for (const cmd of networkCommands) {
      if (lowerScript.includes(cmd)) {
        found.push(cmd);
      }
    }
    
    return found;
  }

  /**
   * Check for system modifications
   */
  private checkSystemModifications(script: string, isPowerShell: boolean = false): string[] {
    const systemCommands = isPowerShell 
      ? ['runas', 'reg add', 'reg delete', 'sc create', 'Start-Process -Verb RunAs']
      : ['sudo', 'runas', 'reg add', 'reg delete', 'sc create', 'systemctl'];
    
    const found: string[] = [];
    const lowerScript = script.toLowerCase();
    
    for (const cmd of systemCommands) {
      if (lowerScript.includes(cmd.toLowerCase())) {
        found.push(cmd);
      }
    }
    
    return found;
  }

  /**
   * Validate script structure
   */
  private validateStructure(script: string): string[] {
    const errors: string[] = [];
    
    // Check if script is not empty
    if (!script.trim()) {
      errors.push('Script cannot be empty');
      return errors;
    }

    // Check for balanced quotes with improved logic for PowerShell
    const quoteErrors = this.validateQuotes(script);
    errors.push(...quoteErrors);

    // Check for basic command structure
    const lines = script.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      errors.push('Script contains no executable commands');
    }

    return errors;
  }

  /**
   * Improved quote validation that handles PowerShell arrays and here-strings
   */
  private validateQuotes(script: string): string[] {
    const errors: string[] = [];
    
    // Remove comments and here-strings before quote validation
    let cleanScript = this.removeCommentsAndHereStrings(script);
    
    // Check for balanced single quotes (excluding escaped quotes)
    const singleQuoteMatches = cleanScript.match(/(?<!\\)'/g);
    const singleQuoteCount = singleQuoteMatches ? singleQuoteMatches.length : 0;
    
    // Check for balanced double quotes (excluding escaped quotes)
    const doubleQuoteMatches = cleanScript.match(/(?<!\\)"/g);
    const doubleQuoteCount = doubleQuoteMatches ? doubleQuoteMatches.length : 0;
    
    // For PowerShell arrays, we need more sophisticated validation
    if (this.isPowerShellScript(script)) {
      // PowerShell arrays use @('item1', 'item2') syntax
      // This creates multiple single quotes that are actually balanced
      const arrayQuoteValidation = this.validatePowerShellArrayQuotes(cleanScript);
      if (!arrayQuoteValidation.valid && arrayQuoteValidation.error) {
        errors.push(arrayQuoteValidation.error);
      }
    } else {
      // Standard quote validation for other script types
      if (singleQuoteCount % 2 !== 0) {
        errors.push('Unbalanced single quotes detected');
      }
      if (doubleQuoteCount % 2 !== 0) {
        errors.push('Unbalanced double quotes detected');
      }
    }
    
    return errors;
  }

  /**
   * Remove comments and here-strings that might contain unbalanced quotes
   */
  private removeCommentsAndHereStrings(script: string): string {
    // Remove PowerShell comments
    let cleaned = script.replace(/#[^\r\n]*/g, '');
    
    // Remove here-strings @"..."@ and @'...'@
    cleaned = cleaned.replace(/@"[\s\S]*?"@/g, '');
    cleaned = cleaned.replace(/@'[\s\S]*?'@/g, '');
    
    // Remove shell comments
    cleaned = cleaned.replace(/^\s*#[^\r\n]*/gm, '');
    
    return cleaned;
  }

  /**
   * Check if script appears to be PowerShell
   */
  private isPowerShellScript(script: string): boolean {
    const powershellIndicators = [
      'Write-Host',
      'Write-Output',
      'Get-Location',
      'Set-Location',
      'New-Item',
      '$env:',
      '@(',
      'param(',
      '-ForegroundColor',
      '-ItemType'
    ];
    
    return powershellIndicators.some(indicator => 
      script.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Validate PowerShell array quotes specifically
   */
  private validatePowerShellArrayQuotes(script: string): { valid: boolean; error?: string } {
    try {
      // Stack-based quote validation for PowerShell
      const stack: string[] = [];
      let i = 0;
      
      while (i < script.length) {
        const char = script[i];
        const nextChar = script[i + 1];
        
        // Skip escaped quotes
        if (char === '\\' && (nextChar === '"' || nextChar === "'")) {
          i += 2;
          continue;
        }
        
        if (char === '"' || char === "'") {
          // If stack is empty or top doesn't match, push
          if (stack.length === 0 || stack[stack.length - 1] !== char) {
            stack.push(char);
          } else {
            // Matching quote found, pop from stack
            stack.pop();
          }
        }
        
        i++;
      }
      
      if (stack.length === 0) {
        return { valid: true };
      } else {
        return { 
          valid: false, 
          error: `Unbalanced quotes detected: ${stack.length} unclosed quote(s)` 
        };
      }
    } catch (error) {
      // If validation fails, be permissive for PowerShell
      return { valid: true };
    }
  }

  /**
   * Check cross-platform compatibility
   */
  private checkCrossPlatformCompatibility(script: string): string[] {
    const warnings: string[] = [];
    
    // Check for Windows-specific paths
    if (script.includes('C:\\') || script.includes('D:\\')) {
      warnings.push('Windows-specific drive paths detected - may not work on Unix systems');
    }
    
    // Check for Unix-specific paths
    if (script.includes('/usr/') || script.includes('/home/')) {
      warnings.push('Unix-specific paths detected - may not work on Windows');
    }
    
    // Check for platform-specific commands
    if (script.includes('ni -ItemType') && !script.includes('mkdir')) {
      warnings.push('PowerShell-specific commands detected - consider adding Unix alternatives');
    }
    
    if (script.includes('mkdir -p') && !script.includes('ni -ItemType')) {
      warnings.push('Unix-specific commands detected - consider adding Windows alternatives');
    }
    
    return warnings;
  }

  /**
   * Get validation summary for display
   */
  getValidationSummary(result: ValidationResult): string {
    const lines: string[] = [];
    
    if (result.isValid) {
      lines.push('✅ Script validation passed');
    } else {
      lines.push('❌ Script validation failed');
    }
    
    if (result.errors.length > 0) {
      lines.push('\nErrors:');
      result.errors.forEach(error => lines.push(`  • ${error}`));
    }
    
    if (result.warnings.length > 0) {
      lines.push('\nWarnings:');
      result.warnings.forEach(warning => lines.push(`  • ${warning}`));
    }
    
    return lines.join('\n');
  }
}