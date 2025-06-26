"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptExecutor = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const os_1 = require("os");
const scriptTypeDetector_js_1 = require("./scriptTypeDetector.js");
const fs_1 = require("fs");
const path_1 = require("path");
const os_2 = require("os");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ScriptExecutor {
    constructor() {
        this.isWindows = (0, os_1.platform)() === 'win32';
        this.typeDetector = new scriptTypeDetector_js_1.ScriptTypeDetector();
    }
    /**
     * Convert script to appropriate platform format
     */
    convertScript(script, targetPlatform) {
        const shouldConvertToWindows = targetPlatform === 'windows' ||
            (targetPlatform === 'all' && this.isWindows);
        if (shouldConvertToWindows) {
            return this.convertToWindows(script);
        }
        else {
            return this.convertToUnix(script);
        }
    }
    /**
     * Convert script to Windows PowerShell format
     */
    convertToWindows(script) {
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
            const pathList = paths.split(',').map((p) => p.trim()).map((p) => {
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
    convertToUnix(script) {
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
     * Execute the script in the current directory
     */
    async executeScript(script, targetPlatform) {
        const scriptType = this.typeDetector.detectType(script);
        console.log(`Detected script type: ${scriptType.type}`);
        // Check if required interpreters are available
        const availability = await this.typeDetector.checkInterpreterAvailability(scriptType);
        if (availability.available.length === 0 && availability.missing.length > 0) {
            throw new Error(`Required interpreters not found: ${availability.missing.join(', ')}. Please install them first.`);
        }
        // For Python, Node.js, or other interpreter-based scripts, create a temporary file
        if (['python', 'nodejs'].includes(scriptType.type)) {
            return this.executeInterpreterScript(script, scriptType);
        }
        // For shell/batch scripts, use the converted approach
        const convertedScript = this.convertScript(script, targetPlatform);
        console.log('\\n--- Executing Script ---');
        console.log(convertedScript);
        console.log('--- End Script ---\\n');
        try {
            const shell = this.isWindows ? 'powershell.exe' : '/bin/bash';
            const result = await execAsync(convertedScript, {
                shell,
                cwd: process.cwd(),
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            return result;
        }
        catch (error) {
            throw new Error(`Script execution failed: ${error.message}`);
        }
    }
    /**
     * Execute interpreter-based scripts (Python, Node.js, etc.)
     */
    async executeInterpreterScript(script, scriptType) {
        // Create temporary directory
        const tempDir = (0, path_1.join)((0, os_2.tmpdir)(), 'scaffold-scripts');
        (0, fs_1.mkdirSync)(tempDir, { recursive: true });
        // Create temporary script file
        const extension = scriptType.extensions[0];
        const tempFile = (0, path_1.join)(tempDir, `temp_script${extension}`);
        (0, fs_1.writeFileSync)(tempFile, script);
        console.log(`\\n--- Executing ${scriptType.type} Script ---`);
        console.log(script);
        console.log('--- End Script ---\\n');
        try {
            const command = this.typeDetector.getExecutionCommand(scriptType, tempFile);
            const result = await execAsync(command, {
                cwd: process.cwd(),
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            return result;
        }
        catch (error) {
            throw new Error(`${scriptType.type} script execution failed: ${error.message}`);
        }
    }
    /**
     * Preview what the script will look like when converted
     */
    previewScript(script, targetPlatform) {
        return this.convertScript(script, targetPlatform);
    }
}
exports.ScriptExecutor = ScriptExecutor;
//# sourceMappingURL=scriptExecutor.js.map