/**
 * Base error class for all application errors
 * 
 * Standardizes error handling from legacy try/catch blocks throughout app_old/src/
 * Provides consistent error context and formatting
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.3 for migration details
 */

export interface ErrorContext {
  operation?: string
  filePath?: string
  scriptName?: string
  platform?: string
  command?: string[]
  metadata?: Record<string, any>
}

export abstract class ScaffoldError extends Error {
  public readonly code: string
  public readonly context: ErrorContext
  public readonly timestamp: Date
  public readonly suggestion?: string

  constructor(
    message: string,
    code: string,
    context: ErrorContext = {},
    suggestion?: string
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.context = context
    this.timestamp = new Date()
    this.suggestion = suggestion
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  // Standardize error display format (from UsageHelper.displayError patterns)
  getFormattedMessage(): string {
    let formatted = `${this.name}: ${this.message}`
    
    if (this.context.operation) {
      formatted += ` (during ${this.context.operation})`
    }
    
    if (this.context.scriptName) {
      formatted += ` [script: ${this.context.scriptName}]`
    }
    
    if (this.context.filePath) {
      formatted += ` [file: ${this.context.filePath}]`
    }
    
    return formatted
  }

  getSuggestionMessage(): string | undefined {
    return this.suggestion
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      suggestion: this.suggestion,
      stack: this.stack
    }
  }
}

export default ScaffoldError
