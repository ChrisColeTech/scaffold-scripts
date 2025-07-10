/**
 * Script domain model with business logic
 * 
 * Extracted from app_old/src/database.ts ScaffoldCommand interface
 * Preserves multi-platform script storage and version selection logic
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.2 for migration details
 */

import { ScriptMetadata } from './ScriptMetadata.js'
import { Platform, getCurrentPlatform } from './Platform.js'
import { ScriptType } from './ScriptType.js'

export interface ScriptParams {
  id?: number
  name: string
  originalScript: string
  windowsScript?: string
  unixScript?: string
  crossPlatformScript?: string
  metadata: ScriptMetadata
}

export interface VersionSelectionFlags {
  preferOriginal?: boolean
  forceWindows?: boolean
  forceUnix?: boolean
  forceCrossPlatform?: boolean
}

export class Script {
  // Migrate from database record structure (ScaffoldCommand)
  public readonly id?: number
  public readonly name: string
  public readonly originalScript: string           // script_original
  public readonly windowsScript?: string          // script_windows
  public readonly unixScript?: string             // script_unix
  public readonly crossPlatformScript?: string    // script_cross_platform
  public readonly metadata: ScriptMetadata

  constructor(params: ScriptParams) {
    // Migrate creation logic from addCommand()
    this.id = params.id
    this.name = params.name
    this.originalScript = params.originalScript
    this.windowsScript = params.windowsScript
    this.unixScript = params.unixScript
    this.crossPlatformScript = params.crossPlatformScript
    this.metadata = params.metadata
  }

  // Business logic methods from version selection logic in index.ts
  getVersionForPlatform(platform: Platform): string | null {
    switch (platform) {
      case Platform.WINDOWS:
        return this.windowsScript || this.crossPlatformScript || this.originalScript
      case Platform.UNIX:
      case Platform.LINUX:
      case Platform.MACOS:
        return this.unixScript || this.crossPlatformScript || this.originalScript
      case Platform.CROSS_PLATFORM:
        return this.crossPlatformScript || this.originalScript
      default:
        return this.originalScript
    }
  }

  hasVersion(platform: Platform): boolean {
    return this.getVersionForPlatform(platform) !== null
  }

  getBestAvailableVersion(currentPlatform: Platform): string {
    // Priority: platform-specific > cross-platform > original
    const platformVersion = this.getVersionForPlatform(currentPlatform)
    if (platformVersion) {
      return platformVersion
    }
    
    return this.originalScript
  }

  getExecutableVersion(flags: VersionSelectionFlags): string {
    // Handle version selection flags (from --original, --windows, --unix command line flags)
    if (flags.preferOriginal) {
      return this.originalScript
    }
    
    if (flags.forceWindows && this.windowsScript) {
      return this.windowsScript
    }
    
    if (flags.forceUnix && this.unixScript) {
      return this.unixScript
    }
    
    if (flags.forceCrossPlatform && this.crossPlatformScript) {
      return this.crossPlatformScript
    }
    
    // Default to best available for current platform
    return this.getBestAvailableVersion(getCurrentPlatform())
  }

  // Convert to database format (ScaffoldCommand)
  toScaffoldCommand(): any {
    return {
      id: this.id,
      name: this.name,
      script_original: this.originalScript,
      script_windows: this.windowsScript || null,
      script_unix: this.unixScript || null,
      script_cross_platform: this.crossPlatformScript || null,
      original_platform: this.metadata.originalPlatform,
      script_type: this.metadata.scriptType,
      platform: 'all', // Legacy field
      alias: this.metadata.alias || null,
      description: this.metadata.description || null,
      createdAt: this.metadata.createdAt.toISOString(),
      updatedAt: this.metadata.updatedAt.toISOString()
    }
  }

  static fromScaffoldCommand(command: any): Script {
    const metadata = new ScriptMetadata({
      scriptType: command.script_type as ScriptType,
      originalPlatform: command.original_platform as Platform,
      description: command.description,
      alias: command.alias,
      createdAt: new Date(command.createdAt),
      updatedAt: new Date(command.updatedAt)
    })

    return new Script({
      id: command.id,
      name: command.name,
      originalScript: command.script_original,
      windowsScript: command.script_windows,
      unixScript: command.script_unix,
      crossPlatformScript: command.script_cross_platform,
      metadata
    })
  }
}

export default Script
