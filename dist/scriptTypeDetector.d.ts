export interface ScriptTypeInfo {
    type: 'shell' | 'python' | 'nodejs' | 'powershell' | 'batch' | 'mixed';
    interpreters: string[];
    extensions: string[];
    shebang?: string;
}
export declare class ScriptTypeDetector {
    /**
     * Detect script type from content
     */
    detectType(script: string): ScriptTypeInfo;
    /**
     * Detect the original platform of the script
     */
    detectPlatform(script: string): 'windows' | 'unix' | 'cross-platform';
    /**
     * Detect from shebang line
     */
    private detectFromShebang;
    /**
     * Detect from script content patterns
     */
    private detectFromContent;
    /**
     * Count pattern matches in script
     */
    private countMatches;
    /**
     * Generate appropriate execution command for script type
     */
    getExecutionCommand(scriptType: ScriptTypeInfo, scriptPath: string): string;
    /**
     * Check if required interpreters are available
     */
    checkInterpreterAvailability(scriptType: ScriptTypeInfo): Promise<{
        available: string[];
        missing: string[];
    }>;
}
//# sourceMappingURL=scriptTypeDetector.d.ts.map