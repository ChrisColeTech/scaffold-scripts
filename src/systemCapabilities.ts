/**
 * System Capabilities Checker
 * Detects available execution programs and system capabilities
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface SystemCapabilities {
  hasNode: boolean
  hasPython: boolean
  hasPython3: boolean
  hasBash: boolean
  hasZsh: boolean
  hasPowerShell: boolean
  hasPwsh: boolean
  hasCmd: boolean
  platform: NodeJS.Platform
  canRunShell: boolean
  canRunPowerShell: boolean
  canRunPython: boolean
  canRunJavaScript: boolean
}

export class SystemCapabilityChecker {
  private static instance: SystemCapabilityChecker
  private capabilities: SystemCapabilities | null = null

  private constructor() {}

  public static getInstance(): SystemCapabilityChecker {
    if (!SystemCapabilityChecker.instance) {
      SystemCapabilityChecker.instance = new SystemCapabilityChecker()
    }
    return SystemCapabilityChecker.instance
  }

  /**
   * Check if a command is available in the system
   */
  private async checkCommand(command: string): Promise<boolean> {
    try {
      await execAsync(`${command} --version`, { timeout: 3000 })
      return true
    } catch {
      try {
        // Try alternative version check
        await execAsync(`${command} -v`, { timeout: 3000 })
        return true
      } catch {
        try {
          // For Windows cmd, try different approach
          if (command === 'cmd') {
            await execAsync('cmd /c ver', { timeout: 3000 })
            return true
          }
          return false
        } catch {
          return false
        }
      }
    }
  }

  /**
   * Get system capabilities (cached after first call)
   */
  public async getCapabilities(): Promise<SystemCapabilities> {
    if (this.capabilities) {
      return this.capabilities
    }

    const platform = process.platform

    // Check for available execution programs
    const [
      hasNode,
      hasPython,
      hasPython3,
      hasBash,
      hasZsh,
      hasPowerShell,
      hasPwsh,
      hasCmd
    ] = await Promise.all([
      this.checkCommand('node'),
      this.checkCommand('python'),
      this.checkCommand('python3'),
      this.checkCommand('bash'),
      this.checkCommand('zsh'),
      this.checkCommand('powershell'),
      this.checkCommand('pwsh'),
      this.checkCommand('cmd')
    ])

    // Determine execution capabilities
    const canRunShell = hasBash || hasZsh || (platform === 'win32' && hasCmd)
    const canRunPowerShell = hasPowerShell || hasPwsh
    const canRunPython = hasPython || hasPython3
    const canRunJavaScript = hasNode

    this.capabilities = {
      hasNode,
      hasPython,
      hasPython3,
      hasBash,
      hasZsh,
      hasPowerShell,
      hasPwsh,
      hasCmd,
      platform,
      canRunShell,
      canRunPowerShell,
      canRunPython,
      canRunJavaScript
    }

    return this.capabilities
  }

  /**
   * Check if we can execute a specific script type
   */
  public async canExecuteScriptType(scriptType: string): Promise<boolean> {
    const caps = await this.getCapabilities()
    
    switch (scriptType.toLowerCase()) {
      case 'shell':
      case 'bash':
      case 'sh':
        return caps.canRunShell
      
      case 'powershell':
      case 'ps1':
        return caps.canRunPowerShell
      
      case 'python':
      case 'py':
        return caps.canRunPython
      
      case 'javascript':
      case 'js':
      case 'node':
        return caps.canRunJavaScript
      
      default:
        return false
    }
  }

  /**
   * Get the best execution command for a script type
   */
  public async getBestExecutor(scriptType: string): Promise<string | null> {
    const caps = await this.getCapabilities()
    
    switch (scriptType.toLowerCase()) {
      case 'shell':
      case 'bash':
      case 'sh':
        if (caps.hasBash) return 'bash'
        if (caps.hasZsh) return 'zsh'
        if (caps.platform === 'win32' && caps.hasCmd) return 'cmd'
        return null
      
      case 'powershell':
      case 'ps1':
        if (caps.hasPwsh) return 'pwsh' // Cross-platform PowerShell preferred
        if (caps.hasPowerShell) return 'powershell'
        return null
      
      case 'python':
      case 'py':
        if (caps.hasPython3) return 'python3'
        if (caps.hasPython) return 'python'
        return null
      
      case 'javascript':
      case 'js':
      case 'node':
        if (caps.hasNode) return 'node'
        return null
      
      default:
        return null
    }
  }

  /**
   * Determine if conversion is needed for current platform
   */
  public async shouldConvert(scriptType: string): Promise<boolean> {
    const canExecute = await this.canExecuteScriptType(scriptType)
    
    // If we can't execute the script natively, we should try to convert
    return !canExecute
  }

  /**
   * Get platform compatibility info
   */
  public async getPlatformInfo(): Promise<{platform: string, recommendations: string[]}> {
    const caps = await this.getCapabilities()
    const recommendations: string[] = []

    if (!caps.canRunShell) {
      recommendations.push('Install bash or zsh for shell script support')
    }
    
    if (!caps.canRunPowerShell) {
      recommendations.push('Install PowerShell Core (pwsh) for cross-platform PowerShell support')
    }
    
    if (!caps.canRunPython) {
      recommendations.push('Install Python for .py script support')
    }
    
    if (!caps.canRunJavaScript) {
      recommendations.push('Install Node.js for .js script support')
    }

    return {
      platform: `${caps.platform} (${process.arch})`,
      recommendations
    }
  }
}