/**
 * Script processing abstraction interface
 * 
 * Extracted from app_old/src/scriptProcessor.ts ScriptProcessor class
 * Handles script processing pipeline with interactive input fixes
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for migration details
 */

import { Script } from '../models/Script.js'
import { ScriptType } from '../models/ScriptType.js'

export interface ProcessingOptions {
  generateMultiPlatform?: boolean
  fixInteractiveInputs?: boolean
  validateSyntax?: boolean
}

export interface ProcessingResult {
  success: boolean
  processedScript: Script
  warnings: string[]
  errors: string[]
}

export interface IScriptProcessor {
  // Migrate from ScriptProcessor class
  processScript(scriptPath: string, options: ProcessingOptions): Promise<ProcessingResult>
  fixInteractiveInputs(content: string, scriptType: ScriptType): Promise<string>
  generateMultiPlatformVersions(script: Script): Promise<Script>
  validateAndProcess(content: string, options: ProcessingOptions): Promise<ProcessingResult>
}

export default IScriptProcessor
