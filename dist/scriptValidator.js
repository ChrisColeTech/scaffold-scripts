"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptValidator = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class ScriptValidator {
    constructor() {
        this.dangerousCommands = [
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
        this.allowedCommands = [
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
    }
    /**
     * Validate and sanitize a script
     */
    validate(script, options = {}) {
        const result = {
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
            }
            else {
                result.warnings.push(`Potentially dangerous commands: ${dangerousFound.join(', ')}`);
            }
        }
        // 3. Check for network access
        const networkCommands = this.checkNetworkCommands(result.sanitizedScript);
        if (networkCommands.length > 0 && !options.allowNetworkAccess) {
            if (options.strict) {
                result.errors.push(`Network commands not allowed: ${networkCommands.join(', ')}`);
                result.isValid = false;
            }
            else {
                result.warnings.push(`Network access detected: ${networkCommands.join(', ')}`);
            }
        }
        // 4. Check for system modifications
        const systemMods = this.checkSystemModifications(result.sanitizedScript);
        if (systemMods.length > 0 && !options.allowSystemModification) {
            if (options.strict) {
                result.errors.push(`System modifications not allowed: ${systemMods.join(', ')}`);
                result.isValid = false;
            }
            else {
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
    validateFromFile(filePath, options = {}) {
        try {
            const absolutePath = (0, path_1.resolve)(filePath);
            const script = (0, fs_1.readFileSync)(absolutePath, 'utf-8');
            return this.validate(script, options);
        }
        catch (error) {
            return {
                isValid: false,
                errors: [`Failed to read script file: ${error.message}`],
                warnings: [],
                sanitizedScript: ''
            };
        }
    }
    /**
     * Basic script sanitization
     */
    sanitizeScript(script) {
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
    checkDangerousCommands(script) {
        const found = [];
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
    checkNetworkCommands(script) {
        const networkCommands = ['curl', 'wget', 'invoke-webrequest', 'fetch'];
        const found = [];
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
    checkSystemModifications(script) {
        const systemCommands = ['sudo', 'runas', 'reg add', 'reg delete', 'sc create', 'systemctl'];
        const found = [];
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
    validateStructure(script) {
        const errors = [];
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
    checkCrossPlatformCompatibility(script) {
        const warnings = [];
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
    getValidationSummary(result) {
        const lines = [];
        if (result.isValid) {
            lines.push('✅ Script validation passed');
        }
        else {
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
exports.ScriptValidator = ScriptValidator;
//# sourceMappingURL=scriptValidator.js.map