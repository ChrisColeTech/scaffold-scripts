/**
 * Core abstraction for script repository
 * 
 * Extracted from app_old/src/database.ts ScaffoldDatabase class
 * Provides data access layer abstraction following Clean Architecture
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for migration details
 */

import { Script } from '../models/Script.js'

export interface IScriptRepository {
  // Core script operations - migrated from ScaffoldDatabase class
  addScript(script: Script): Promise<void>
  updateScript(name: string, script: Script): Promise<void>
  removeScript(name: string): Promise<void>
  getScript(name: string): Promise<Script | null>
  getAllScripts(): Promise<Script[]>
  clearAll(): Promise<void>
  scriptExists(name: string): Promise<boolean>
  
  // Database management - migrated from ScaffoldDatabase lifecycle
  initialize(): Promise<void>
  close(): Promise<void>
  runMigrations(): Promise<void>
}

export default IScriptRepository
