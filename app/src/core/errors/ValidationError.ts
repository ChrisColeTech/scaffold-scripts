/**
 * Validation-specific errors
 * 
 * Extracted from app_old/src/scriptValidator.ts ScriptValidator error handling
 * Handles validation failures with detailed rule and suggestion information
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.3 for migration details
 */

import { ScaffoldError, ErrorContext } from './ScaffoldError.js'

export enum ValidationType {
  SECURITY = 'security',
  SYNTAX = 'syntax',
  FILE_TYPE = 'file_type',
  PERMISSIONS = 'permissions'
}

export interface ValidationRule {
  name: string
  description: string
  severity: 'error' | 'warning'
}

export class ValidationError extends ScaffoldError {
  // Migrate from ScriptValidator error handling
  public readonly validationType: ValidationType
  public readonly failedRules: ValidationRule[]
  public readonly suggestions: string[]

  constructor(
    message: string,
    validationType: ValidationType,
    failedRules: ValidationRule[] = [],
    suggestions: string[] = [],
    context: ErrorContext = {}
  ) {
    const enhancedContext = {
      ...context,
      operation: context.operation || 'script validation'
    }

    const allSuggestions = [
      ...suggestions,
      ...failedRules.map(rule => rule.description)
    ]

    super(
      message,
      'VALIDATION_ERROR',
      enhancedContext,
      allSuggestions.length > 0 ? allSuggestions.join('; ') : undefined
    )

    this.validationType = validationType
    this.failedRules = failedRules
    this.suggestions = suggestions
  }

  // Legacy validation error patterns from scriptValidator.ts
  static fromDangerousCommands(
    dangerousCommands: string[],
    strict: boolean = false,
    context: ErrorContext = {}
  ): ValidationError {
    const message = strict 
      ? `Dangerous commands detected: ${dangerousCommands.join(', ')}`
      : `Potentially dangerous commands: ${dangerousCommands.join(', ')}`

    const rules: ValidationRule[] = dangerousCommands.map(cmd => ({
      name: `dangerous_command_${cmd.replace(/\s+/g, '_')}`,
      description: `Command '${cmd}' may be dangerous`,
      severity: strict ? 'error' : 'warning'
    }))

    return new ValidationError(
      message,
      ValidationType.SECURITY,
      rules,
      [
        'Review the script for potentially harmful operations',
        'Use --allow-dangerous flag if you trust this script',
        'Consider using safer alternatives for system operations'
      ],
      context
    )
  }

  static fromNetworkCommands(
    networkCommands: string[],
    context: ErrorContext = {}
  ): ValidationError {
    const message = `Network operations detected: ${networkCommands.join(', ')}`
    
    const rules: ValidationRule[] = networkCommands.map(cmd => ({
      name: `network_command_${cmd.replace(/\s+/g, '_')}`,
      description: `Command '${cmd}' performs network operations`,
      severity: 'warning'
    }))

    return new ValidationError(
      message,
      ValidationType.SECURITY,
      rules,
      [
        'Use --allow-network flag to permit network access',
        'Ensure you trust the network operations being performed'
      ],
      context
    )
  }

  static fromInvalidFileType(
    filePath: string,
    extension: string,
    allowedExtensions: string[],
    context: ErrorContext = {}
  ): ValidationError {
    const message = `Invalid file type: ${extension}. Allowed extensions: ${allowedExtensions.join(', ')}`
    
    const rule: ValidationRule = {
      name: 'invalid_file_extension',
      description: `File extension '${extension}' is not supported`,
      severity: 'error'
    }

    return new ValidationError(
      message,
      ValidationType.FILE_TYPE,
      [rule],
      [
        `Rename the file to use a supported extension: ${allowedExtensions.join(', ')}`,
        'Ensure the file contains valid script content'
      ],
      { ...context, filePath }
    )
  }

  static fromBinaryFile(
    filePath: string,
    context: ErrorContext = {}
  ): ValidationError {
    const message = 'Binary files are not allowed for security reasons'
    
    const rule: ValidationRule = {
      name: 'binary_file_detected',
      description: 'File appears to be binary content',
      severity: 'error'
    }

    return new ValidationError(
      message,
      ValidationType.SECURITY,
      [rule],
      [
        'Use only text-based script files',
        'Check that the file is not corrupted'
      ],
      { ...context, filePath }
    )
  }

  getFormattedMessage(): string {
    let formatted = super.getFormattedMessage()
    
    if (this.failedRules.length > 0) {
      formatted += '\nFailed Rules:'
      this.failedRules.forEach(rule => {
        formatted += `\n  - ${rule.name}: ${rule.description} (${rule.severity})`
      })
    }
    
    return formatted
  }

  toJSON() {
    return {
      ...super.toJSON(),
      validationType: this.validationType,
      failedRules: this.failedRules,
      suggestions: this.suggestions
    }
  }
}

export default ValidationError
