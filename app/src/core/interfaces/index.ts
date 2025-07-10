/**
 * Core interfaces barrel export
 * 
 * This barrel export file provides a clean public API
 * for the core abstractions.
 */

// Core interfaces
export { IScriptRepository } from './IScriptRepository.js'
export { IScriptProcessor, ProcessingOptions, ProcessingResult } from './IScriptProcessor.js'
export { IScriptExecutor, ExecutionContext } from './IScriptExecutor.js'
export { ISystemCapabilities, CapabilityMap } from './ISystemCapabilities.js'
export { IScriptValidator, ValidationOptions, SecurityValidationResult, SyntaxValidationResult } from './IScriptValidator.js'
export { IScriptConverter, ConversionStrategy } from './IScriptConverter.js'
export { ICache, CacheOptions, CacheStats } from './ICache.js'
