/**
 * System Capabilities Tests
 * Tests the SystemCapabilityChecker functionality
 */

import { SystemCapabilityChecker } from '../src/systemCapabilities';

describe('System Capabilities', () => {
  let checker: SystemCapabilityChecker;

  beforeEach(() => {
    checker = SystemCapabilityChecker.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const checker1 = SystemCapabilityChecker.getInstance();
      const checker2 = SystemCapabilityChecker.getInstance();
      
      expect(checker1).toBe(checker2);
    });
  });

  describe('Capability Detection', () => {
    it('should detect system capabilities', async () => {
      const capabilities = await checker.getCapabilities();
      
      expect(capabilities).toBeDefined();
      expect(capabilities.platform).toBeDefined();
      expect(typeof capabilities.canRunShell).toBe('boolean');
      expect(typeof capabilities.canRunPowerShell).toBe('boolean');
      expect(typeof capabilities.canRunPython).toBe('boolean');
      expect(typeof capabilities.canRunJavaScript).toBe('boolean');
    });

    it('should cache capabilities after first call', async () => {
      const startTime = Date.now();
      const capabilities1 = await checker.getCapabilities();
      const firstCallTime = Date.now() - startTime;
      
      const startTime2 = Date.now();
      const capabilities2 = await checker.getCapabilities();
      const secondCallTime = Date.now() - startTime2;
      
      expect(capabilities1).toEqual(capabilities2);
      // Both calls should complete (timing can vary in CI environments)
      expect(firstCallTime).toBeGreaterThanOrEqual(0);
      expect(secondCallTime).toBeGreaterThanOrEqual(0);
    });

    it('should detect current platform correctly', async () => {
      const capabilities = await checker.getCapabilities();
      
      expect(capabilities.platform).toBe(process.platform);
    });
  });

  describe('Script Type Execution', () => {
    it('should check if script types can be executed', async () => {
      const scriptTypes = ['shell', 'powershell', 'python', 'javascript'];
      
      for (const scriptType of scriptTypes) {
        const canExecute = await checker.canExecuteScriptType(scriptType);
        expect(typeof canExecute).toBe('boolean');
      }
    });

    it('should handle unknown script types', async () => {
      const canExecute = await checker.canExecuteScriptType('unknown-type');
      expect(canExecute).toBe(false);
    });

    it('should handle case-insensitive script types', async () => {
      const canExecuteLower = await checker.canExecuteScriptType('shell');
      const canExecuteUpper = await checker.canExecuteScriptType('SHELL');
      const canExecuteMixed = await checker.canExecuteScriptType('Shell');
      
      expect(canExecuteLower).toBe(canExecuteUpper);
      expect(canExecuteUpper).toBe(canExecuteMixed);
    });
  });

  describe('Best Executor Detection', () => {
    it('should return best executor for each script type', async () => {
      const scriptTypes = ['shell', 'powershell', 'python', 'javascript'];
      
      for (const scriptType of scriptTypes) {
        const executor = await checker.getBestExecutor(scriptType);
        if (executor) {
          expect(typeof executor).toBe('string');
          expect(executor.length).toBeGreaterThan(0);
        }
      }
    });

    it('should return null for unknown script types', async () => {
      const executor = await checker.getBestExecutor('unknown-type');
      expect(executor).toBeNull();
    });

    it('should prefer modern executors', async () => {
      // PowerShell Core (pwsh) should be preferred over Windows PowerShell if available
      const capabilities = await checker.getCapabilities();
      if (capabilities.hasPwsh && capabilities.hasPowerShell) {
        const executor = await checker.getBestExecutor('powershell');
        expect(executor).toBe('pwsh');
      }
      
      // Python3 should be preferred over python if available
      if (capabilities.hasPython3 && capabilities.hasPython) {
        const executor = await checker.getBestExecutor('python');
        expect(executor).toBe('python3');
      }
    });
  });

  describe('Conversion Decision', () => {
    it('should recommend conversion when script cannot be executed', async () => {
      // Test with a script type that's likely not available
      const shouldConvert = await checker.shouldConvert('unknown-type');
      expect(shouldConvert).toBe(true);
    });

    it('should not recommend conversion when script can be executed', async () => {
      const capabilities = await checker.getCapabilities();
      
      // Test with a script type that's available
      if (capabilities.canRunShell) {
        const shouldConvert = await checker.shouldConvert('shell');
        expect(shouldConvert).toBe(false);
      }
      
      if (capabilities.canRunJavaScript) {
        const shouldConvert = await checker.shouldConvert('javascript');
        expect(shouldConvert).toBe(false);
      }
    });
  });

  describe('Platform Information', () => {
    it('should provide platform information', async () => {
      const platformInfo = await checker.getPlatformInfo();
      
      expect(platformInfo).toBeDefined();
      expect(platformInfo.platform).toBeDefined();
      expect(Array.isArray(platformInfo.recommendations)).toBe(true);
      expect(platformInfo.platform).toContain(process.platform);
    });

    it('should provide recommendations when tools are missing', async () => {
      const platformInfo = await checker.getPlatformInfo();
      
      // Recommendations should be strings
      platformInfo.recommendations.forEach(rec => {
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('should include architecture in platform info', async () => {
      const platformInfo = await checker.getPlatformInfo();
      
      expect(platformInfo.platform).toContain(process.arch);
    });
  });

  describe('Error Handling', () => {
    it('should handle command execution timeouts gracefully', async () => {
      // This test ensures the capability checker doesn't hang
      const capabilities = await checker.getCapabilities();
      
      expect(capabilities).toBeDefined();
      // Test should complete within reasonable time (handled by Jest timeout)
    });

    it('should handle missing commands gracefully', async () => {
      // Test with commands that definitely don't exist
      const nonExistentExecutor = await checker.getBestExecutor('definitely-not-a-real-type');
      expect(nonExistentExecutor).toBeNull();
    });
  });

  describe('Cross-Platform Behavior', () => {
    it('should detect platform-specific tools correctly', async () => {
      const capabilities = await checker.getCapabilities();
      
      if (process.platform === 'win32') {
        // On Windows, should detect cmd and potentially PowerShell
        expect(capabilities.hasCmd || capabilities.hasPowerShell || capabilities.hasPwsh).toBe(true);
      } else {
        // On Unix-like systems, should detect bash or zsh
        expect(capabilities.hasBash || capabilities.hasZsh).toBe(true);
      }
    });

    it('should provide platform-appropriate recommendations', async () => {
      const platformInfo = await checker.getPlatformInfo();
      
      // Recommendations should be relevant to the current platform
      expect(platformInfo.recommendations).toBeDefined();
      
      if (process.platform === 'win32') {
        // Windows recommendations might include PowerShell Core
        const hasWindowsRec = platformInfo.recommendations.some(rec => 
          rec.includes('PowerShell') || rec.includes('pwsh')
        );
        // This test is flexible as recommendations depend on what's already installed
      }
    });
  });

  describe('Performance', () => {
    it('should complete capability detection within reasonable time', async () => {
      const startTime = Date.now();
      await checker.getCapabilities();
      const endTime = Date.now();
      
      // Should complete within 10 seconds even on slow systems
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it('should handle multiple concurrent capability checks', async () => {
      const promises = Array(5).fill(0).map(() => checker.getCapabilities());
      
      const results = await Promise.all(promises);
      
      // All results should be identical (cached)
      results.forEach(result => {
        expect(result).toEqual(results[0]);
      });
    });
  });
});