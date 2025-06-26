export declare class ScriptExecutor {
    private isWindows;
    private typeDetector;
    /**
     * Convert script to appropriate platform format
     */
    convertScript(script: string, targetPlatform?: string): string;
    /**
     * Convert script to Windows PowerShell format
     */
    private convertToWindows;
    /**
     * Convert script to Unix/Linux format
     */
    private convertToUnix;
    /**
     * Execute the script in the current directory
     */
    executeScript(script: string, targetPlatform?: string): Promise<{
        stdout: string;
        stderr: string;
    }>;
    /**
     * Execute interpreter-based scripts (Python, Node.js, etc.)
     */
    private executeInterpreterScript;
    /**
     * Preview what the script will look like when converted
     */
    previewScript(script: string, targetPlatform?: string): string;
}
//# sourceMappingURL=scriptExecutor.d.ts.map