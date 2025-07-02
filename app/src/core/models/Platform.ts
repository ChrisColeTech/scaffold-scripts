/**
 * Platform enumeration
 * 
 * Defines supported platforms for script execution
 * Extracted from platform detection logic in legacy app_old/src/
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.2 for migration details
 */

export enum Platform {
  WINDOWS = 'windows',
  UNIX = 'unix',
  MACOS = 'macos',
  LINUX = 'linux',
  CROSS_PLATFORM = 'cross-platform'
}

export const PLATFORM_ALIASES: Record<string, Platform> = {
  'win32': Platform.WINDOWS,
  'win': Platform.WINDOWS,
  'windows': Platform.WINDOWS,
  'unix': Platform.UNIX,
  'linux': Platform.LINUX,
  'darwin': Platform.MACOS,
  'mac': Platform.MACOS,
  'macos': Platform.MACOS,
  'cross': Platform.CROSS_PLATFORM,
  'universal': Platform.CROSS_PLATFORM
}

export function getCurrentPlatform(): Platform {
  const platform = process.platform
  switch (platform) {
    case 'win32':
      return Platform.WINDOWS
    case 'darwin':
      return Platform.MACOS
    case 'linux':
      return Platform.LINUX
    default:
      return Platform.UNIX
  }
}

export function getPlatformFromString(platformStr: string): Platform {
  const normalized = platformStr.toLowerCase()
  return PLATFORM_ALIASES[normalized] || Platform.UNIX
}

export function isPlatformCompatible(scriptPlatform: Platform, targetPlatform: Platform): boolean {
  if (scriptPlatform === Platform.CROSS_PLATFORM) return true
  if (scriptPlatform === targetPlatform) return true
  
  // Unix-like compatibility
  if (scriptPlatform === Platform.UNIX && (targetPlatform === Platform.LINUX || targetPlatform === Platform.MACOS)) {
    return true
  }
  
  return false
}

export default Platform
