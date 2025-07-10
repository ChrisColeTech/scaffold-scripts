/**
 * Caching abstraction interface
 * 
 * Generic caching interface for performance optimization
 * Used for system capabilities caching and script validation caching
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 1.1 for implementation details
 */

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum cache size
}

export interface ICache<K = string, V = any> {
  // Core cache operations
  get(key: K): V | undefined
  set(key: K, value: V, options?: CacheOptions): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
  
  // Cache statistics
  size(): number
  keys(): K[]
  values(): V[]
  
  // Cache management
  cleanup(): void
  getStats(): CacheStats
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  maxSize: number
  hitRate: number
}

export default ICache
