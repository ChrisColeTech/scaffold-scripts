/**
 * Mock System Capabilities
 * 
 * Provides configurable system capability mocking for tests
 * without requiring actual system checks.
 * 
 * @see TESTING_STRATEGY.md for usage guidelines
 */

export class MockSystemCapabilities {
  private capabilities = new Map<string, boolean>()
  private interpreters: string[] = []

  constructor() {
    // Default capabilities for common scenarios
    this.setDefaults()
  }

  private setDefaults(): void {
    // Common interpreters available by default
    this.capabilities.set('node', true)
    this.capabilities.set('bash', true)
    this.capabilities.set('sh', true)
    this.capabilities.set('powershell', false) // Typically false in CI
    this.capabilities.set('python', true)
    this.capabilities.set('python3', true)
    
    this.interpreters = ['node', 'bash', 'sh', 'python', 'python3']
  }

  isAvailable(capability: string): boolean {
    return this.capabilities.get(capability) || false
  }

  getAvailableInterpreters(): string[] {
    return [...this.interpreters]
  }

  getBestExecutorFor(scriptType: string): string | null {
    switch (scriptType.toLowerCase()) {
      case 'shell':
      case 'bash':
        return this.isAvailable('bash') ? 'bash' : (this.isAvailable('sh') ? 'sh' : null)
      case 'powershell':
        return this.isAvailable('powershell') ? 'powershell' : null
      case 'python':
        return this.isAvailable('python3') ? 'python3' : (this.isAvailable('python') ? 'python' : null)
      case 'node':
      case 'javascript':
        return this.isAvailable('node') ? 'node' : null
      default:
        return null
    }
  }

  async refreshCapabilities(): Promise<void> {
    // Mock implementation - no actual refresh needed
    return Promise.resolve()
  }

  getCachedCapabilities(): Record<string, boolean> {
    return Object.fromEntries(this.capabilities)
  }

  // Test utilities
  setCapability(capability: string, available: boolean): void {
    this.capabilities.set(capability, available)
    if (available && !this.interpreters.includes(capability)) {
      this.interpreters.push(capability)
    } else if (!available) {
      this.interpreters = this.interpreters.filter(i => i !== capability)
    }
  }

  setWindowsEnvironment(): void {
    this.capabilities.set('powershell', true)
    this.capabilities.set('bash', false)
    this.capabilities.set('sh', false)
    this.interpreters = ['node', 'powershell', 'python', 'python3']
  }

  setUnixEnvironment(): void {
    this.capabilities.set('powershell', false)
    this.capabilities.set('bash', true)
    this.capabilities.set('sh', true)
    this.interpreters = ['node', 'bash', 'sh', 'python', 'python3']
  }

  reset(): void {
    this.capabilities.clear()
    this.interpreters = []
    this.setDefaults()
  }
}
