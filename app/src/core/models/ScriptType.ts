/**
 * Script type enumeration
 * 
 * Defines supported script types across the application
 * Extracted from type detection logic in legacy app_old/src/
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.2 for migration details
 */

export enum ScriptType {
  SHELL = 'shell',
  BATCH = 'batch',
  POWERSHELL = 'powershell',
  PYTHON = 'python',
  NODEJS = 'nodejs',
  UNKNOWN = 'unknown'
}

export const SCRIPT_TYPE_EXTENSIONS: Record<ScriptType, string[]> = {
  [ScriptType.SHELL]: ['.sh', '.bash', '.zsh'],
  [ScriptType.BATCH]: ['.bat', '.cmd'],
  [ScriptType.POWERSHELL]: ['.ps1'],
  [ScriptType.PYTHON]: ['.py'],
  [ScriptType.NODEJS]: ['.js', '.mjs'],
  [ScriptType.UNKNOWN]: []
}

export const SCRIPT_TYPE_EXECUTORS: Record<ScriptType, string[]> = {
  [ScriptType.SHELL]: ['bash', 'sh', 'zsh'],
  [ScriptType.BATCH]: ['cmd'],
  [ScriptType.POWERSHELL]: ['powershell', 'pwsh'],
  [ScriptType.PYTHON]: ['python3', 'python'],
  [ScriptType.NODEJS]: ['node'],
  [ScriptType.UNKNOWN]: []
}

export function getScriptTypeFromExtension(extension: string): ScriptType {
  for (const [type, extensions] of Object.entries(SCRIPT_TYPE_EXTENSIONS)) {
    if (extensions.includes(extension.toLowerCase())) {
      return type as ScriptType
    }
  }
  return ScriptType.UNKNOWN
}

export function getScriptTypeFromPath(filePath: string): ScriptType {
  const extension = filePath.substring(filePath.lastIndexOf('.'))
  return getScriptTypeFromExtension(extension)
}

export default ScriptType
