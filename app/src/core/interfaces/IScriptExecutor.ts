/**
 * Script execution abstraction interface
 * 
 * Extracted from app_old/src/scriptExecutor.ts ScriptExecutor class
 * Cross-platform execution engine with real-time streaming
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for migration details
 */

import { Script } from '../models/Script.js'
import { ScriptType } from '../models/ScriptType.js'
import { ExecutionResult } from '../models/ExecutionResult.js'

export interface ExecutionContext {
  workingDirectory?: string
  arguments?: string[]
  environment?: Record<string, string>
  timeout?: number
  streamOutput?: boolean
}

export interface IScriptExecutor {
  // Migrate from ScriptExecutor class
  executeScript(script: Script, context: ExecutionContext): Promise<ExecutionResult>
  canExecute(scriptType: ScriptType): boolean
  getExecutionCommand(script: Script): string[]
  streamExecution(script: Script, outputHandler: (data: string) => void): Promise<ExecutionResult>
}

export default IScriptExecutor
