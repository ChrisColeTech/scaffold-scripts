/**
 * Script conversion abstraction interface
 * 
 * Extracted from app_old/src/scriptConverter.ts conversion functions
 * Cross-platform script conversion logic
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for migration details
 */

import { Platform } from '../models/Platform.js'

export interface ConversionStrategy {
  name: string
  description: string
  isLossless: boolean
  confidence: number
}

export interface IScriptConverter {
  // Migrate from converter functions
  convertToTargetPlatform(script: string, from: Platform, to: Platform): Promise<string>
  generateCrossPlatformVersion(script: string, originalPlatform: Platform): Promise<string>
  canConvert(from: Platform, to: Platform): boolean
  getConversionStrategy(from: Platform, to: Platform): ConversionStrategy
}

export default IScriptConverter
