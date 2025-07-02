/**
 * Script validation result model
 * 
 * Extracted from app_old/src/scriptValidator.ts ValidationResult interface
 * Contains validation results from script security and syntax validation
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.2 for migration details
 */

export class ValidationResult {
  // Migrate from ScriptValidator ValidationResult interface
  public readonly isValid: boolean
  public readonly errors: string[]
  public readonly warnings: string[]
  public readonly sanitizedScript: string

  constructor(params: {
    isValid: boolean
    errors: string[]
    warnings: string[]
    sanitizedScript: string
  }) {
    this.isValid = params.isValid
    this.errors = params.errors
    this.warnings = params.warnings
    this.sanitizedScript = params.sanitizedScript
  }

  // Utility methods
  hasErrors(): boolean {
    return this.errors.length > 0
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0
  }

  getFormattedErrors(): string {
    if (this.errors.length === 0) return ''
    return `Errors:\n${this.errors.map(e => `  - ${e}`).join('\n')}`
  }

  getFormattedWarnings(): string {
    if (this.warnings.length === 0) return ''
    return `Warnings:\n${this.warnings.map(w => `  - ${w}`).join('\n')}`
  }

  getFormattedResults(): string {
    let result = `Validation ${this.isValid ? 'PASSED' : 'FAILED'}\n`
    
    if (this.hasErrors()) {
      result += `\n${this.getFormattedErrors()}`
    }
    
    if (this.hasWarnings()) {
      result += `\n${this.getFormattedWarnings()}`
    }
    
    return result
  }

  toJSON() {
    return {
      isValid: this.isValid,
      errors: this.errors,
      warnings: this.warnings,
      sanitizedScript: this.sanitizedScript
    }
  }

  static createValid(sanitizedScript: string, warnings: string[] = []): ValidationResult {
    return new ValidationResult({
      isValid: true,
      errors: [],
      warnings,
      sanitizedScript
    })
  }

  static createInvalid(errors: string[], warnings: string[] = [], sanitizedScript: string = ''): ValidationResult {
    return new ValidationResult({
      isValid: false,
      errors,
      warnings,
      sanitizedScript
    })
  }
}

export default ValidationResult
