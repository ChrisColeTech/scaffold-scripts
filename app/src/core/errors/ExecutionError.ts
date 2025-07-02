/**
 * Script execution errors
 * 
 * Extracted from app_old/src/scriptExecutor.ts ScriptExecutor error handling
 * Handles script execution failures with exit codes and command context
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.3 for migration details
 */

import { ScaffoldError, ErrorContext } from './ScaffoldError.js'
import { Platform } from '../models/Platform.js'

export class ExecutionError extends ScaffoldError {
  // Migrate from ScriptExecutor error handling
  public readonly exitCode: number
  public readonly command: string[]
  public readonly platform: Platform
  public readonly stdout?: string
  public readonly stderr?: string

  constructor(
    message: string,
    exitCode: number,
    command: string[],
    platform: Platform,
    context: ErrorContext = {},
    stdout?: string,
    stderr?: string,
    suggestion?: string
  ) {
    const enhancedContext = {
      ...context,
      command,
      platform: platform.toString(),
      operation: context.operation || 'script execution'
    }

    super(
      message, 
      'EXECUTION_ERROR', 
      enhancedContext,
      suggestion || 'Check the script syntax and required dependencies'
    )

    this.exitCode = exitCode
    this.command = command
    this.platform = platform
    this.stdout = stdout
    this.stderr = stderr
  }

  // Legacy error patterns from scriptExecutor.ts
  static fromProcessFailure(
    exitCode: number,
    command: string[],
    platform: Platform,
    scriptType?: string,
    stdout?: string,
    stderr?: string
  ): ExecutionError {
    const typePrefix = scriptType ? `${scriptType} script` : 'Script'
    const message = `${typePrefix} execution failed with exit code ${exitCode}`
    
    return new ExecutionError(
      message,
      exitCode,
      command,
      platform,
      { operation: 'process execution' },
      stdout,
      stderr,
      'Check the script for syntax errors and ensure all dependencies are installed'
    )
  }

  static fromInterpreterMissing(
    interpreters: string[],
    command: string[],
    platform: Platform
  ): ExecutionError {
    const message = `Required interpreters not found: ${interpreters.join(', ')}. Please install them first.`
    
    return new ExecutionError(
      message,
      127, // Command not found
      command,
      platform,
      { operation: 'interpreter check' },
      undefined,
      undefined,
      `Install the required interpreters: ${interpreters.join(', ')}`
    )
  }

  static fromProcessError(
    error: Error,
    command: string[],
    platform: Platform,
    scriptType?: string
  ): ExecutionError {
    const typePrefix = scriptType ? `${scriptType} script` : 'Script'
    const message = `${typePrefix} execution failed: ${error.message}`
    
    return new ExecutionError(
      message,
      1,
      command,
      platform,
      { operation: 'process spawn' },
      undefined,
      undefined,
      'Check that the script file exists and has proper permissions'
    )
  }

  getFormattedMessage(): string {
    let formatted = super.getFormattedMessage()
    
    if (this.command.length > 0) {
      formatted += `\nCommand: ${this.command.join(' ')}`
    }
    
    if (this.exitCode !== 0) {
      formatted += `\nExit Code: ${this.exitCode}`
    }
    
    if (this.stderr) {
      formatted += `\nSTDERR: ${this.stderr}`
    }
    
    return formatted
  }

  toJSON() {
    return {
      ...super.toJSON(),
      exitCode: this.exitCode,
      command: this.command,
      platform: this.platform,
      stdout: this.stdout,
      stderr: this.stderr
    }
  }
}

export default ExecutionError
