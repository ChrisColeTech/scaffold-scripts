import { ScriptTypeInfo } from './scriptTypeDetector.js';
export interface ScriptVersions {
    original: string;
    windows?: string;
    unix?: string;
    crossPlatform?: string;
}
export declare class AdvancedScriptConverter {
    /**
     * Generate all platform versions of a script
     */
    generateVersions(originalScript: string, scriptType: ScriptTypeInfo, originalPlatform: string): ScriptVersions;
    /**
     * Convert Shell script to PowerShell
     */
    private convertShellToPowerShell;
    /**
     * Convert PowerShell script to Shell
     */
    private convertPowerShellToShell;
    /**
     * Convert Batch script to Shell
     */
    private convertBatchToShell;
    /**
     * Adjust interpreter-based scripts for Unix
     */
    private adjustForUnix;
    /**
     * Adjust interpreter-based scripts for Windows
     */
    private adjustForWindows;
    /**
     * Generate a cross-platform script using abstracted commands
     */
    private generateCrossPlatformScript;
    /**
     * Extract file/directory path from command
     */
    private extractPath;
    /**
     * Extract message from echo/output command
     */
    private extractMessage;
    /**
     * Get the best script version for current platform
     */
    getBestScriptForPlatform(command: any, currentPlatform: string): string;
}
//# sourceMappingURL=scriptConverter.d.ts.map