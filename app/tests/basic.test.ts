/**
 * Basic tests to verify the setup is working
 */

describe('Basic Setup Tests', () => {
  test('Node.js environment is working', () => {
    expect(process.version).toBeDefined();
    expect(process.platform).toBeDefined();
  });

  test('Jest is configured correctly', () => {
    expect(typeof describe).toBe('function');
    expect(typeof test).toBe('function');
    expect(typeof expect).toBe('function');
  });

  test('TypeScript compilation works', () => {
    interface TestInterface {
      name: string;
      value: number;
    }
    
    const obj: TestInterface = {
      name: 'test',
      value: 42
    };
    
    expect(obj.name).toBe('test');
    expect(obj.value).toBe(42);
  });

  test('Mock implementations can be imported', async () => {
    const { MockScriptRepository } = await import('./mocks/MockScriptRepository');
    const { MockSystemCapabilities } = await import('./mocks/MockSystemCapabilities');
    
    expect(MockScriptRepository).toBeDefined();
    expect(MockSystemCapabilities).toBeDefined();
    
    const repo = new MockScriptRepository();
    const capabilities = new MockSystemCapabilities();
    
    expect(repo).toBeDefined();
    expect(capabilities).toBeDefined();
  });

  test('Environment variables are set correctly', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.LOG_LEVEL).toBe('error');
    expect(process.env.DB_PATH).toBe(':memory:');
  });
});