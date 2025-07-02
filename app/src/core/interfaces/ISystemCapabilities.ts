/**
 * System capabilities detection interface
 * 
 * Extracted from app_old/src/systemCapabilities.ts SystemCapabilityChecker singleton
 * Environment detection singleton with caching
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for migration details
 */

import { ScriptType } from '../models/ScriptType.js'

export interface CapabilityMap {
  [capability: string]: boolean
}

export interface ISystemCapabilities {
  // Migrate from SystemCapabilityChecker singleton
  isAvailable(capability: string): boolean
  getAvailableInterpreters(): string[]
  getBestExecutorFor(scriptType: ScriptType): string | null
  refreshCapabilities(): Promise<void>
  getCachedCapabilities(): CapabilityMap
}

export default ISystemCapabilities
