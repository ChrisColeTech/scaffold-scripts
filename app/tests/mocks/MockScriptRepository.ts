/**
 * In-Memory Mock Script Repository
 * 
 * Fast, lightweight repository implementation for testing
 * that doesn't require SQLite or file system setup.
 * 
 * @see TESTING_STRATEGY.md for usage guidelines
 */

export interface MockScript {
  name: string
  originalScript: string
  windowsScript?: string
  unixScript?: string
  crossPlatformScript?: string
  metadata: {
    scriptType: string
    originalPlatform: string
    createdAt: Date
    updatedAt: Date
  }
}

export class MockScriptRepository {
  private scripts = new Map<string, MockScript>()
  private isInitialized = false

  async initialize(): Promise<void> {
    this.isInitialized = true
  }

  async close(): Promise<void> {
    this.scripts.clear()
    this.isInitialized = false
  }

  async addScript(script: MockScript): Promise<void> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    if (this.scripts.has(script.name)) {
      throw new Error(`Script '${script.name}' already exists`)
    }
    this.scripts.set(script.name, { ...script })
  }

  async updateScript(name: string, script: MockScript): Promise<void> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    if (!this.scripts.has(name)) {
      throw new Error(`Script '${name}' not found`)
    }
    this.scripts.set(name, { ...script, name })
  }

  async removeScript(name: string): Promise<void> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    if (!this.scripts.delete(name)) {
      throw new Error(`Script '${name}' not found`)
    }
  }

  async getScript(name: string): Promise<MockScript | null> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    return this.scripts.get(name) || null
  }

  async getAllScripts(): Promise<MockScript[]> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    return Array.from(this.scripts.values())
  }

  async clearAll(): Promise<void> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    this.scripts.clear()
  }

  async scriptExists(name: string): Promise<boolean> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    return this.scripts.has(name)
  }

  // Test utilities
  getScriptCount(): number {
    return this.scripts.size
  }

  reset(): void {
    this.scripts.clear()
  }
}
