"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptProcessor = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const scriptTypeDetector_js_1 = require("./scriptTypeDetector.js");
const scriptConverter_js_1 = require("./scriptConverter.js");
const scriptValidator_js_1 = require("./scriptValidator.js");
class ScriptProcessor {
    constructor() {
        this.detector = new scriptTypeDetector_js_1.ScriptTypeDetector();
        this.converter = new scriptConverter_js_1.AdvancedScriptConverter();
        this.validator = new scriptValidator_js_1.ScriptValidator();
    }
    /**
     * Process a script file for storage in the database
     */
    async processScriptFile(scriptPath, options = {}) {
        // 1. Read the original script
        const absolutePath = (0, path_1.resolve)(scriptPath);
        const originalScript = (0, fs_1.readFileSync)(absolutePath, 'utf-8');
        return this.processScriptContent(originalScript, options);
    }
    /**
     * Process script content directly
     */
    async processScriptContent(originalScript, options = {}) {
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
    createCommand(type, name, processedScript, options = {}) {
        const now = new Date().toISOString();
        return {
            type,
            name,
            script_original: processedScript.original,
            script_windows: processedScript.windows,
            script_unix: processedScript.unix,
            script_cross_platform: processedScript.crossPlatform,
            original_platform: processedScript.originalPlatform,
            script_type: processedScript.scriptType,
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
    getBestScript(command, targetPlatform) {
        const currentPlatform = targetPlatform || process.platform;
        return this.converter.getBestScriptForPlatform(command, currentPlatform);
    }
    /**
     * Get display information about all script versions
     */
    getScriptVersionInfo(command) {
        const currentPlatform = process.platform;
        const bestScript = this.getBestScript(command);
        let bestVersion = 'original';
        if (bestScript === command.script_windows)
            bestVersion = 'windows';
        else if (bestScript === command.script_unix)
            bestVersion = 'unix';
        else if (bestScript === command.script_cross_platform)
            bestVersion = 'cross-platform';
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
    validatePlatformCompatibility(command, targetPlatform) {
        const isWindows = targetPlatform === 'win32';
        const warnings = [];
        const recommendations = [];
        let compatible = true;
        // Check if we have appropriate version for target platform
        if (isWindows && !command.script_windows && command.original_platform === 'unix') {
            warnings.push('This script was written for Unix/Linux and may not work properly on Windows');
            recommendations.push('Consider adding a Windows-specific version with: scaffold update ' +
                command.type + ' ' + command.name + ' /path/to/windows-script.ps1');
            compatible = false;
        }
        else if (!isWindows && !command.script_unix && command.original_platform === 'windows') {
            warnings.push('This script was written for Windows and may not work properly on Unix/Linux');
            recommendations.push('Consider adding a Unix-specific version with: scaffold update ' +
                command.type + ' ' + command.name + ' /path/to/unix-script.sh');
            compatible = false;
        }
        // Check script type compatibility
        if (command.script_type === 'powershell' && !isWindows) {
            warnings.push('PowerShell scripts may not be available on this platform');
            recommendations.push('Install PowerShell Core or use the converted Unix version');
        }
        else if (command.script_type === 'batch' && !isWindows) {
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
exports.ScriptProcessor = ScriptProcessor;
//# sourceMappingURL=scriptProcessor.js.map