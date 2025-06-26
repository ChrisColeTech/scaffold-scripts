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
export declare class ScriptValidator {
    private dangerousCommands;
    private allowedCommands;
    /**
     * Validate and sanitize a script
     */
    validate(script: string, options?: ValidationOptions): ValidationResult;
    /**
     * Load and validate script from file
     */
    validateFromFile(filePath: string, options?: ValidationOptions): ValidationResult;
    /**
     * Basic script sanitization
     */
    private sanitizeScript;
    /**
     * Check for dangerous commands
     */
    private checkDangerousCommands;
    /**
     * Check for network commands
     */
    private checkNetworkCommands;
    /**
     * Check for system modifications
     */
    private checkSystemModifications;
    /**
     * Validate script structure
     */
    private validateStructure;
    /**
     * Check cross-platform compatibility
     */
    private checkCrossPlatformCompatibility;
    /**
     * Get validation summary for display
     */
    getValidationSummary(result: ValidationResult): string;
}
//# sourceMappingURL=scriptValidator.d.ts.map