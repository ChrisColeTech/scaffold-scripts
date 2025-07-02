/**
 * Script metadata model
 * 
 * Extracted from app_old/src/database.ts ScaffoldCommand interface
 * Contains script metadata fields from database schema
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.2 for migration details
 */

import { ScriptType } from './ScriptType.js'
import { Platform, getCurrentPlatform } from './Platform.js'

export enum ValidationLevel {
  NONE = 'none',
  BASIC = 'basic',
  STRICT = 'strict'
}

export interface ExecutionContext {
  workingDirectory?: string
  arguments?: string[]
  environment?: Record<string, string>
  timeout?: number
}

export class ScriptMetadata {
  // Migrate from database metadata columns
  public readonly scriptType: ScriptType
  public readonly originalPlatform: Platform
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly description?: string
  public readonly tags: string[]
  public readonly validationLevel: ValidationLevel
  public readonly alias?: string

  constructor(params: {
    scriptType: ScriptType
    originalPlatform: Platform
    description?: string
    tags?: string[]
    validationLevel?: ValidationLevel
    alias?: string
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.scriptType = params.scriptType
    this.originalPlatform = params.originalPlatform
    this.description = params.description
    this.tags = params.tags || []
    this.validationLevel = params.validationLevel || ValidationLevel.BASIC
    this.alias = params.alias
    this.createdAt = params.createdAt || new Date()
    this.updatedAt = params.updatedAt || new Date()
  }

  // Business logic from version selection
  isCompatibleWith(platform: Platform): boolean {
    if (this.originalPlatform === Platform.CROSS_PLATFORM) return true
    if (this.originalPlatform === platform) return true
    
    // Unix-like compatibility (from legacy platform detection)
    if (this.originalPlatform === Platform.UNIX && 
        (platform === Platform.LINUX || platform === Platform.MACOS)) {
      return true
    }
    
    return false
  }

  getRecommendedVersion(context: ExecutionContext): Platform {
    const currentPlatform = getCurrentPlatform()
    
    // If script is cross-platform compatible, use current platform
    if (this.originalPlatform === Platform.CROSS_PLATFORM) {
      return currentPlatform
    }
    
    // If script is compatible with current platform, use it
    if (this.isCompatibleWith(currentPlatform)) {
      return currentPlatform
    }
    
    // Fall back to original platform
    return this.originalPlatform
  }

  toJSON() {
    return {
      scriptType: this.scriptType,
      originalPlatform: this.originalPlatform,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      description: this.description,
      tags: this.tags,
      validationLevel: this.validationLevel,
      alias: this.alias
    }
  }
}

export default ScriptMetadata
