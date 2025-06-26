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
export declare class ScriptProcessor {
    private detector;
    private converter;
    private validator;
    /**
     * Process a script file for storage in the database
     */
    processScriptFile(scriptPath: string, options?: {
        strict?: boolean;
        allowNetworkAccess?: boolean;
        allowSystemModification?: boolean;
    }): Promise<ProcessedScript>;
    /**
     * Process script content directly
     */
    processScriptContent(originalScript: string, options?: {
        strict?: boolean;
        allowNetworkAccess?: boolean;
        allowSystemModification?: boolean;
    }): Promise<ProcessedScript>;
    /**
     * Create a ScaffoldCommand from processed script
     */
    createCommand(type: 'frontend' | 'backend' | 'init', name: string, processedScript: ProcessedScript, options?: {
        alias?: string;
        description?: string;
        platform?: 'all' | 'windows' | 'unix';
    }): Omit<ScaffoldCommand, 'id'>;
    /**
     * Get the best script version for execution on current platform
     */
    getBestScript(command: ScaffoldCommand, targetPlatform?: string): string;
    /**
     * Get display information about all script versions
     */
    getScriptVersionInfo(command: ScaffoldCommand): {
        original: {
            content: string;
            platform: string;
            type: string;
        };
        windows?: {
            content: string;
            available: boolean;
        };
        unix?: {
            content: string;
            available: boolean;
        };
        crossPlatform?: {
            content: string;
            available: boolean;
        };
        bestForCurrent: {
            content: string;
            version: string;
        };
    };
    /**
     * Validate platform compatibility
     */
    validatePlatformCompatibility(command: ScaffoldCommand, targetPlatform: string): {
        compatible: boolean;
        warnings: string[];
        recommendations: string[];
    };
}
//# sourceMappingURL=scriptProcessor.d.ts.map