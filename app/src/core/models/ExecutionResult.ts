/**
 * Script execution result model
 * 
 * Extracted from app_old/src/scriptExecutor.ts return patterns
 * Contains execution results from script execution with real-time output streaming
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.2 for migration details
 */

export class ExecutionResult {
  // Migrate from ScriptExecutor return values
  public readonly success: boolean
  public readonly exitCode: number
  public readonly stdout: string
  public readonly stderr: string
  public readonly executionTime: number
  public readonly command: string[]
  public readonly error?: Error
  public readonly startTime: Date
  public readonly endTime: Date

  constructor(params: {
    success: boolean
    exitCode: number
    stdout: string
    stderr: string
    executionTime: number
    command: string[]
    error?: Error
    startTime?: Date
    endTime?: Date
  }) {
    this.success = params.success
    this.exitCode = params.exitCode
    this.stdout = params.stdout
    this.stderr = params.stderr
    this.executionTime = params.executionTime
    this.command = params.command
    this.error = params.error
    this.startTime = params.startTime || new Date()
    this.endTime = params.endTime || new Date()
  }

  // Utility methods from executor logic
  hasOutput(): boolean {
    return this.stdout.length > 0 || this.stderr.length > 0
  }

  getFormattedOutput(): string {
    let output = ''
    
    if (this.stdout) {
      output += `STDOUT:\n${this.stdout}\n`
    }
    
    if (this.stderr) {
      output += `STDERR:\n${this.stderr}\n`
    }
    
    if (this.error) {
      output += `ERROR: ${this.error.message}\n`
    }
    
    output += `Exit Code: ${this.exitCode}\n`
    output += `Execution Time: ${this.executionTime}ms\n`
    
    return output
  }

  wasKilled(): boolean {
    // Process was killed if exit code is 128 + signal number or specific termination codes
    return this.exitCode === 130 || // SIGINT (Ctrl+C)
           this.exitCode === 143 || // SIGTERM
           this.exitCode === 137 || // SIGKILL
           this.exitCode === 1      // General termination
  }

  toJSON() {
    return {
      success: this.success,
      exitCode: this.exitCode,
      stdout: this.stdout,
      stderr: this.stderr,
      executionTime: this.executionTime,
      command: this.command,
      error: this.error?.message,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString()
    }
  }

  static createSuccess(params: {
    stdout: string
    stderr?: string
    executionTime: number
    command: string[]
    startTime?: Date
    endTime?: Date
  }): ExecutionResult {
    return new ExecutionResult({
      success: true,
      exitCode: 0,
      stdout: params.stdout,
      stderr: params.stderr || '',
      executionTime: params.executionTime,
      command: params.command,
      startTime: params.startTime,
      endTime: params.endTime
    })
  }

  static createFailure(params: {
    exitCode: number
    stdout?: string
    stderr?: string
    executionTime: number
    command: string[]
    error?: Error
    startTime?: Date
    endTime?: Date
  }): ExecutionResult {
    return new ExecutionResult({
      success: false,
      exitCode: params.exitCode,
      stdout: params.stdout || '',
      stderr: params.stderr || '',
      executionTime: params.executionTime,
      command: params.command,
      error: params.error,
      startTime: params.startTime,
      endTime: params.endTime
    })
  }
}

export default ExecutionResult
