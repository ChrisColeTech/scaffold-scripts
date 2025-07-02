/**
 * Script validation abstraction interface
 * 
 * Extracted from app_old/src/scriptValidator.ts ScriptValidator class
 * Security validation and dangerous command detection
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for migration details
 */

import { ScriptType } from '../models/ScriptType.js'
import { ValidationResult } from '../models/ValidationResult.js'

export interface ValidationOptions {
  checkSecurity?: boolean
  validateSyntax?: boolean
  strictMode?: boolean
  allowDangerousCommands?: boolean
}

export interface SecurityValidationResult {
  safe: boolean
  dangerousCommands: string[]
  warnings: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

export interface SyntaxValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

export interface IScriptValidator {
  // Migrate from ScriptValidator class
  validateScript(content: string, options: ValidationOptions): Promise<ValidationResult>
  checkSecurity(content: string): SecurityValidationResult
  validateSyntax(content: string, scriptType: ScriptType): SyntaxValidationResult
  isFileValid(filePath: string): Promise<boolean>
}

export default IScriptValidator
