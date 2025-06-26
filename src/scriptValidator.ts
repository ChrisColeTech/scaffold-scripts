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

    // 2. Check for dangerous commands
    const dangerousFound = this.checkDangerousCommands(result.sanitizedScript);
    if (dangerousFound.length > 0) {
      if (options.strict) {
        result.errors.push(`Dangerous commands detected: ${dangerousFound.join(', ')}`);
        result.isValid = false;
      } else {
        result.warnings.push(`Potentially dangerous commands: ${dangerousFound.join(', ')}`);
      }
    }

    // 3. Check for network access
    const networkCommands = this.checkNetworkCommands(result.sanitizedScript);
    if (networkCommands.length > 0 && !options.allowNetworkAccess) {
      if (options.strict) {
        result.errors.push(`Network commands not allowed: ${networkCommands.join(', ')}`);
        result.isValid = false;
      } else {
        result.warnings.push(`Network access detected: ${networkCommands.join(', ')}`);
      }
    }

    // 4. Check for system modifications
    const systemMods = this.checkSystemModifications(result.sanitizedScript);
    if (systemMods.length > 0 && !options.allowSystemModification) {
      if (options.strict) {
        result.errors.push(`System modifications not allowed: ${systemMods.join(', ')}`);
        result.isValid = false;
      } else {
        result.warnings.push(`System modifications detected: ${systemMods.join(', ')}`);
      }
    }

    // 5. Validate script structure
    const structureErrors = this.validateStructure(result.sanitizedScript);
    if (structureErrors.length > 0) {
      result.errors.push(...structureErrors);
      result.isValid = false;
    }

    // 6. Cross-platform compatibility check
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
  private checkDangerousCommands(script: string): string[] {
    const found: string[] = [];
    const lowerScript = script.toLowerCase();
    
    for (const cmd of this.dangerousCommands) {
      if (lowerScript.includes(cmd.toLowerCase())) {
        found.push(cmd);
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
  private checkSystemModifications(script: string): string[] {
    const systemCommands = ['sudo', 'runas', 'reg add', 'reg delete', 'sc create', 'systemctl'];
    const found: string[] = [];
    const lowerScript = script.toLowerCase();
    
    for (const cmd of systemCommands) {
      if (lowerScript.includes(cmd)) {
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

    // Check for balanced quotes
    const singleQuotes = (script.match(/'/g) || []).length;
    const doubleQuotes = (script.match(/"/g) || []).length;
    
    if (singleQuotes % 2 !== 0) {
      errors.push('Unbalanced single quotes detected');
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push('Unbalanced double quotes detected');
    }

    // Check for basic command structure
    const lines = script.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      errors.push('Script contains no executable commands');
    }

    return errors;
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