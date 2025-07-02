# Scaffold Scripts CLI - Comprehensive Testing Strategy

## Executive Summary

This document outlines the complete testing strategy for the refactored Scaffold Scripts CLI application. The strategy ensures comprehensive coverage across all layers of the Clean Architecture while maintaining backward compatibility and validating performance improvements.

**Testing Pyramid:**
- **Unit Tests**: 70% of test effort - Individual component testing
- **Integration Tests**: 20% of test effort - Component interaction testing  
- **E2E Tests**: 10% of test effort - Full workflow validation
- **Performance Tests**: Continuous - Regression prevention and optimization validation

**Coverage Targets:**
- **Overall Coverage**: >80% line coverage, >75% branch coverage
- **Core Business Logic**: >95% coverage
- **Critical Paths**: 100% coverage (script execution, data persistence)

---

## Test Architecture Overview

### Test Organization Structure
```
tests/
├── unit/                    # Isolated component testing
│   ├── core/               # Core layer components
│   ├── services/           # Service layer components  
│   ├── repositories/       # Data access layer
│   ├── commands/           # Command handlers
│   ├── cli/                # CLI infrastructure
│   └── utils/              # Utility functions
├── integration/            # Component interaction testing
│   ├── services/           # Service integration
│   ├── repositories/       # Database integration
│   ├── commands/           # Command workflows
│   └── cli/                # CLI integration
├── e2e/                    # End-to-end workflow testing
├── performance/            # Performance and load testing
├── mocks/                  # Mock implementations
├── helpers/                # Test utilities and builders
├── fixtures/               # Test data and configurations
└── legacy/                 # Legacy test migration
```

### Test Configuration
- **Jest Configurations**: Separate configs for each test type
- **Test Isolation**: Each test runs in isolated environment
- **Mock Strategy**: Comprehensive mocks for external dependencies
- **Test Data**: Builders and fixtures for consistent test data

---

## Unit Testing Strategy (70% of effort)

### Core Layer Testing (`tests/unit/core/`)

#### Domain Models Testing
**File**: `tests/unit/core/models/Script.test.ts`
**Source Logic**: Test business logic from database schema and version selection
```typescript
describe('Script', () => {
  describe('constructor', () => {
    test('should create script with all required properties', () => {
      // Test script creation with validation
    })
    
    test('should validate script name format', () => {
      // Test name validation rules
    })
  })
  
  describe('getVersionForPlatform', () => {
    test('should return correct version for each platform', () => {
      // Test platform version selection logic
    })
    
    test('should return null for unavailable platforms', () => {
      // Test graceful handling of missing versions
    })
  })
  
  describe('getBestAvailableVersion', () => {
    test('should select best version based on system capabilities', () => {
      // Test version selection algorithm from legacy code
    })
    
    test('should fallback appropriately when preferred version unavailable', () => {
      // Test fallback logic from handleScriptCommand()
    })
  })
})
```

**File**: `tests/unit/core/models/ScriptMetadata.test.ts`
**Testing Focus**: Metadata validation and platform compatibility
```typescript
describe('ScriptMetadata', () => {
  describe('isCompatibleWith', () => {
    test('should correctly identify platform compatibility', () => {
      // Test compatibility logic
    })
  })
  
  describe('getRecommendedVersion', () => {
    test('should recommend optimal version for execution context', () => {
      // Test recommendation algorithm
    })
  })
})
```

#### Processor Testing
**File**: `tests/unit/core/processors/InteractiveInputProcessor.test.ts`
**Source Logic**: Test interactive input fixes from `scriptProcessor.ts`
```typescript
describe('InteractiveInputProcessor', () => {
  describe('fixPowerShellInputs', () => {
    test('should convert Read-Host to param blocks correctly', () => {
      const input = '$name = Read-Host "Enter name"'
      const expected = 'param([string]$name = "Enter name")'
      // Test exact conversion logic from legacy processor
    })
    
    test('should handle multiple Read-Host commands', () => {
      // Test complex scenarios from legacy code
    })
    
    test('should preserve script functionality after conversion', () => {
      // Test that converted scripts work identically
    })
  })
  
  describe('fixBashInputs', () => {
    test('should convert read commands to argument parsing', () => {
      // Test bash read command conversion
    })
  })
  
  describe('performance optimization', () => {
    test('should process large scripts efficiently', () => {
      // Test O(n) vs O(n²) performance improvement
      const largeScript = generateLargeScript(1000) // 1000 lines
      const startTime = Date.now()
      await processor.fixPowerShellInputs(largeScript)
      const endTime = Date.now()
      expect(endTime - startTime).toBeLessThan(100) // Should be fast
    })
  })
})
```

**File**: `tests/unit/core/processors/ConversionProcessor.test.ts`
**Source Logic**: Test script conversion from `scriptConverter.ts`
```typescript
describe('ConversionProcessor', () => {
  describe('convertShellToPowerShell', () => {
    test('should convert basic shell commands', () => {
      const shell = 'echo "Hello World"'
      const expected = 'Write-Host "Hello World"'
      // Test exact mappings from scriptConverter.ts
    })
    
    test('should handle complex shell scripts', () => {
      // Test advanced conversion scenarios
    })
  })
  
  describe('convertPowerShellToShell', () => {
    test('should convert PowerShell arrays correctly', () => {
      // Test array conversion logic
    })
    
    test('should handle PowerShell control structures', () => {
      // Test if/foreach/while conversions
    })
  })
})
```

#### Execution Testing
**File**: `tests/unit/core/execution/ShellExecutor.test.ts`
**Source Logic**: Test execution logic from `scriptExecutor.ts`
```typescript
describe('ShellExecutor', () => {
  let executor: ShellExecutor
  let mockCapabilities: jest.Mocked<ISystemCapabilities>
  
  beforeEach(() => {
    mockCapabilities = createMockSystemCapabilities()
    executor = new ShellExecutor(mockCapabilities)
  })
  
  describe('executeScript', () => {
    test('should execute shell script successfully', async () => {
      const script = createTestScript('echo "test"', ScriptType.Shell)
      const result = await executor.executeScript(script, createExecutionContext())
      
      expect(result.success).toBe(true)
      expect(result.stdout).toContain('test')
      expect(result.exitCode).toBe(0)
    })
    
    test('should handle script execution failures', async () => {
      const script = createTestScript('exit 1', ScriptType.Shell)
      const result = await executor.executeScript(script, createExecutionContext())
      
      expect(result.success).toBe(false)
      expect(result.exitCode).toBe(1)
    })
    
    test('should stream output in real-time', async () => {
      // Test streaming functionality from legacy executor
      const outputChunks: string[] = []
      const script = createTestScript('echo "line1"; echo "line2"', ScriptType.Shell)
      
      await executor.streamExecution(script, (data) => {
        outputChunks.push(data)
      })
      
      expect(outputChunks.length).toBeGreaterThan(1)
    })
  })
  
  describe('canExecute', () => {
    test('should return true for supported script types', () => {
      expect(executor.canExecute(ScriptType.Shell)).toBe(true)
      expect(executor.canExecute(ScriptType.Bash)).toBe(true)
    })
    
    test('should return false for unsupported script types', () => {
      expect(executor.canExecute(ScriptType.PowerShell)).toBe(false)
    })
  })
})
```

#### Validation Testing
**File**: `tests/unit/core/validation/SecurityValidator.test.ts`
**Source Logic**: Test security validation from `scriptValidator.ts`
```typescript
describe('SecurityValidator', () => {
  let validator: SecurityValidator
  
  beforeEach(() => {
    validator = new SecurityValidator()
  })
  
  describe('checkForDangerousCommands', () => {
    test('should detect dangerous rm commands', () => {
      const script = 'rm -rf /'
      const issues = validator.checkForDangerousCommands(script)
      
      expect(issues).toHaveLength(1)
      expect(issues[0].type).toBe(SecurityIssueType.DangerousCommand)
      expect(issues[0].command).toBe('rm -rf')
    })
    
    test('should detect format commands', () => {
      const script = 'format c: /fs:ntfs'
      const issues = validator.checkForDangerousCommands(script)
      
      expect(issues).toHaveLength(1)
      expect(issues[0].severity).toBe(SecuritySeverity.Critical)
    })
    
    test('should allow safe commands', () => {
      const script = 'echo "Hello World"'
      const issues = validator.checkForDangerousCommands(script)
      
      expect(issues).toHaveLength(0)
    })
  })
  
  describe('validateNetworkAccess', () => {
    test('should detect curl/wget commands', () => {
      // Test network access detection
    })
    
    test('should detect PowerShell web requests', () => {
      // Test PowerShell web access detection
    })
  })
})
```

### Service Layer Testing (`tests/unit/services/`)

#### Script Service Testing
**File**: `tests/unit/services/ScriptService.test.ts`
**Source Logic**: Test business logic from `index.ts` command functions
```typescript
describe('ScriptService', () => {
  let service: ScriptService
  let mockRepository: jest.Mocked<IScriptRepository>
  let mockProcessor: jest.Mocked<IScriptProcessor>
  let mockExecutor: jest.Mocked<IScriptExecutor>
  let mockValidator: jest.Mocked<IScriptValidator>
  let mockCapabilities: jest.Mocked<ISystemCapabilities>
  
  beforeEach(() => {
    mockRepository = createMockRepository()
    mockProcessor = createMockProcessor()
    mockExecutor = createMockExecutor()
    mockValidator = createMockValidator()
    mockCapabilities = createMockCapabilities()
    
    service = new ScriptService(
      mockRepository,
      mockProcessor,
      mockExecutor,
      mockValidator,
      mockCapabilities
    )
  })
  
  describe('addScript', () => {
    test('should add script successfully with validation', async () => {
      // Mock file system
      const scriptPath = '/test/script.sh'
      const scriptContent = 'echo "test"'
      mockFileSystem.readFile.mockResolvedValue(scriptContent)
      
      // Mock processing
      const processedScript = createTestScript(scriptContent, ScriptType.Shell)
      mockProcessor.processScript.mockResolvedValue({
        success: true,
        script: processedScript
      })
      
      // Mock validation
      mockValidator.validateScript.mockResolvedValue({
        isValid: true,
        issues: []
      })
      
      await service.addScript('test-script', scriptPath, {
        platform: 'all',
        validate: true
      })
      
      expect(mockRepository.addScript).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-script',
          originalScript: scriptContent
        })
      )
    })
    
    test('should handle file not found error', async () => {
      mockFileSystem.readFile.mockRejectedValue(new Error('File not found'))
      
      await expect(
        service.addScript('test', '/nonexistent/script.sh', {})
      ).rejects.toThrow('File not found')
    })
    
    test('should handle validation failures', async () => {
      // Test validation error handling from addCommand()
    })
    
    test('should support conversion flag', async () => {
      // Test --convert flag functionality
    })
  })
  
  describe('executeScript', () => {
    test('should execute script with correct version selection', async () => {
      // Test version selection logic from handleScriptCommand()
      const script = createTestScript('echo "test"', ScriptType.Shell)
      script.windowsScript = 'Write-Host "test"'
      script.unixScript = 'echo "test"'
      
      mockRepository.getScript.mockResolvedValue(script)
      mockExecutor.executeScript.mockResolvedValue({
        success: true,
        exitCode: 0,
        stdout: 'test',
        stderr: ''
      })
      
      const result = await service.executeScript('test-script', [], {
        forceWindows: true
      })
      
      expect(mockExecutor.executeScript).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Write-Host "test"'  // Should use Windows version
        }),
        expect.any(Object)
      )
    })
    
    test('should handle script not found', async () => {
      mockRepository.getScript.mockResolvedValue(null)
      
      await expect(
        service.executeScript('nonexistent', [], {})
      ).rejects.toThrow('Script "nonexistent" not found')
    })
  })
})
```

### Repository Layer Testing (`tests/unit/repositories/`)

#### SQLite Repository Testing
**File**: `tests/unit/repositories/SqliteScriptRepository.test.ts`
**Source Logic**: Test database operations from `database.ts`
```typescript
describe('SqliteScriptRepository', () => {
  let repository: SqliteScriptRepository
  let testDbPath: string
  
  beforeEach(async () => {
    testDbPath = createTempDatabase()
    repository = new SqliteScriptRepository(testDbPath)
    await repository.initialize()
  })
  
  afterEach(async () => {
    await repository.close()
    cleanupTempDatabase(testDbPath)
  })
  
  describe('addScript', () => {
    test('should add script with all platform versions', async () => {
      const script = createTestScript('echo "test"', ScriptType.Shell)
      script.windowsScript = 'Write-Host "test"'
      script.unixScript = 'echo "test"'
      
      await repository.addScript(script)
      
      const retrieved = await repository.getScript('test-script')
      expect(retrieved).not.toBeNull()
      expect(retrieved!.originalScript).toBe('echo "test"')
      expect(retrieved!.windowsScript).toBe('Write-Host "test"')
      expect(retrieved!.unixScript).toBe('echo "test"')
    })
    
    test('should prevent duplicate script names', async () => {
      const script = createTestScript('echo "test"', ScriptType.Shell)
      await repository.addScript(script)
      
      await expect(
        repository.addScript(script)
      ).rejects.toThrow('Script already exists')
    })
  })
  
  describe('database migrations', () => {
    test('should migrate from old schema to new schema', async () => {
      // Test migration logic from ScaffoldDatabase
      const oldDbPath = createOldSchemaDatabase()
      const newRepository = new SqliteScriptRepository(oldDbPath)
      
      await newRepository.initialize()
      
      // Verify migration preserved data
      const scripts = await newRepository.getAllScripts()
      expect(scripts.length).toBeGreaterThan(0)
      
      // Verify new schema structure
      expect(scripts[0].metadata).toBeDefined()
    })
  })
  
  describe('performance', () => {
    test('should handle large script storage efficiently', async () => {
      const scripts = Array.from({ length: 1000 }, (_, i) => 
        createTestScript(`echo "script ${i}"`, ScriptType.Shell)
      )
      
      const startTime = Date.now()
      for (const script of scripts) {
        await repository.addScript(script)
      }
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(5000) // Should complete in 5 seconds
    })
  })
})
```

### Command Handler Testing (`tests/unit/commands/`)

#### Add Command Handler Testing
**File**: `tests/unit/commands/AddCommandHandler.test.ts`
**Source Logic**: Test command logic from `add` command in `index.ts`
```typescript
describe('AddCommandHandler', () => {
  let handler: AddCommandHandler
  let mockScriptService: jest.Mocked<IScriptService>
  
  beforeEach(() => {
    mockScriptService = createMockScriptService()
    handler = new AddCommandHandler(mockScriptService)
  })
  
  describe('execute', () => {
    test('should execute add command successfully', async () => {
      const context = createCommandContext({
        args: {
          name: 'test-script',
          scriptPath: '/test/script.sh'
        },
        options: {
          platform: 'all',
          convert: false,
          strict: false,
          validate: true
        }
      })
      
      mockScriptService.addScript.mockResolvedValue()
      
      const result = await handler.execute(context)
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('test-script')
      expect(mockScriptService.addScript).toHaveBeenCalledWith(
        'test-script',
        '/test/script.sh',
        {
          platform: 'all',
          convert: false,
          strict: false,
          validate: true
        }
      )
    })
    
    test('should handle service errors gracefully', async () => {
      const context = createCommandContext({
        args: { name: 'test', scriptPath: '/invalid/path' }
      })
      
      mockScriptService.addScript.mockRejectedValue(new Error('File not found'))
      
      const result = await handler.execute(context)
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('File not found')
      expect(result.errorCode).toBe('CHECK_SCRIPT_PATH')
    })
  })
  
  describe('getCommandDefinition', () => {
    test('should return correct command definition', () => {
      const definition = handler.getCommandDefinition()
      
      expect(definition.name).toBe('add')
      expect(definition.aliases).toContain('a')
      expect(definition.arguments).toHaveLength(2)
      expect(definition.options.map(o => o.flag)).toContain('-p, --platform <platform>')
    })
  })
})
```

---

## Integration Testing Strategy (20% of effort)

### Service Integration Testing (`tests/integration/services/`)

#### Script Service Integration
**File**: `tests/integration/services/ScriptServiceIntegration.test.ts`
**Purpose**: Test service layer with real repositories and processors
```typescript
describe('ScriptService Integration', () => {
  let service: ScriptService
  let testDbPath: string
  
  beforeEach(async () => {
    // Create real dependencies, not mocks
    testDbPath = createTempDatabase()
    const repository = new SqliteScriptRepository(testDbPath)
    const processor = new ScriptProcessor(
      new ScriptValidator(),
      new ScriptConverter(),
      new ScriptTypeDetector()
    )
    const executor = new ScriptExecutor()
    const validator = new ScriptValidator()
    const capabilities = SystemCapabilityChecker.getInstance()
    
    service = new ScriptService(repository, processor, executor, validator, capabilities)
    await repository.initialize()
  })
  
  describe('full workflow integration', () => {
    test('should add, process, and execute script end-to-end', async () => {
      // Create real test script file
      const scriptPath = createTempScript('echo "integration test"')
      
      // Add script through service
      await service.addScript('integration-test', scriptPath, {
        platform: 'all',
        convert: true
      })
      
      // Verify script was processed and stored
      const script = await service.getScriptInfo('integration-test')
      expect(script).not.toBeNull()
      expect(script!.windowsScript).toBeDefined()
      expect(script!.unixScript).toBeDefined()
      
      // Execute script
      const result = await service.executeScript('integration-test', [], {})
      expect(result.success).toBe(true)
      expect(result.stdout).toContain('integration test')
    })
    
    test('should handle interactive input conversion in real scenario', async () => {
      // Test real PowerShell script with Read-Host
      const psScript = createTempScript(`
        $name = Read-Host "Enter your name"
        Write-Host "Hello, $name"
      `)
      
      await service.addScript('interactive-test', psScript, {
        platform: 'all',
        convert: true
      })
      
      const script = await service.getScriptInfo('interactive-test')
      expect(script!.originalScript).toContain('Read-Host')
      expect(script!.windowsScript).toContain('param(')
      expect(script!.windowsScript).not.toContain('Read-Host')
    })
  })
})
```

### Database Integration Testing (`tests/integration/repositories/`)

#### Repository Integration with Migrations
**File**: `tests/integration/repositories/ScriptRepositoryIntegration.test.ts`
**Purpose**: Test database operations with real SQLite
```typescript
describe('ScriptRepository Integration', () => {
  describe('database migration scenarios', () => {
    test('should migrate from v1 to current schema preserving data', async () => {
      // Create v1 database with test data
      const v1DbPath = createV1Database([
        { name: 'old-script', content: 'echo "old"', type: 'shell' }
      ])
      
      // Initialize new repository (triggers migration)
      const repository = new SqliteScriptRepository(v1DbPath)
      await repository.initialize()
      
      // Verify data preserved and schema updated
      const scripts = await repository.getAllScripts()
      expect(scripts).toHaveLength(1)
      expect(scripts[0].name).toBe('old-script')
      expect(scripts[0].metadata).toBeDefined()
      
      // Verify new functionality works
      const newScript = createTestScript('echo "new"', ScriptType.Shell)
      await repository.addScript(newScript)
      
      const allScripts = await repository.getAllScripts()
      expect(allScripts).toHaveLength(2)
    })
  })
})
```

---

## End-to-End Testing Strategy (10% of effort)

### Full Workflow Testing (`tests/e2e/`)

#### Complete User Workflows
**File**: `tests/e2e/AddScript.e2e.test.ts`
**Purpose**: Test complete add script workflow from CLI to execution
```typescript
describe('Add Script E2E', () => {
  let testDbPath: string
  
  beforeEach(() => {
    testDbPath = createTempDatabase()
    process.env.SCAFFOLD_DB_PATH = testDbPath
  })
  
  test('should add and execute script through CLI', async () => {
    // Create test script file
    const scriptPath = createTempScript('echo "e2e test"')
    
    // Execute CLI command
    const addResult = await executeCLI(['add', 'e2e-test', scriptPath])
    expect(addResult.exitCode).toBe(0)
    expect(addResult.stdout).toContain('added successfully')
    
    // Execute the script
    const execResult = await executeCLI(['e2e-test'])
    expect(execResult.exitCode).toBe(0)
    expect(execResult.stdout).toContain('e2e test')
  })
  
  test('should handle conversion flag end-to-end', async () => {
    const psScript = createTempScript(`
      $name = Read-Host "Enter name"
      Write-Host "Hello, $name"
    `)
    
    // Add with conversion
    const addResult = await executeCLI(['add', 'ps-test', psScript, '--convert'])
    expect(addResult.exitCode).toBe(0)
    
    // Verify versions created
    const listResult = await executeCLI(['list', '--detailed'])
    expect(listResult.stdout).toContain('windows, unix, cross-platform')
  })
})
```

#### Interactive Mode Testing
**File**: `tests/e2e/InteractiveMode.e2e.test.ts`
**Purpose**: Test interactive script selection
```typescript
describe('Interactive Mode E2E', () => {
  test('should allow script selection in interactive mode', async () => {
    // Setup test scripts
    await addTestScripts(['script1', 'script2', 'script3'])
    
    // Mock user input
    const mockPrompts = jest.fn()
      .mockResolvedValueOnce({ script: 'script2' })
    
    // Execute interactive mode
    const result = await executeCLIWithInput([], mockPrompts)
    
    expect(result.stdout).toContain('script2 output')
    expect(mockPrompts).toHaveBeenCalledWith(
      expect.objectContaining({
        choices: expect.arrayContaining([
          expect.objectContaining({ title: 'script1' }),
          expect.objectContaining({ title: 'script2' }),
          expect.objectContaining({ title: 'script3' })
        ])
      })
    )
  })
})
```

---

## Performance Testing Strategy

### Performance Regression Testing (`tests/performance/`)

#### Script Processing Performance
**File**: `tests/performance/ScriptProcessing.perf.test.ts`
**Purpose**: Validate performance improvements and prevent regressions
```typescript
describe('Script Processing Performance', () => {
  test('should process large scripts efficiently', async () => {
    const largeScript = generateScriptWithReadHosts(100) // 100 Read-Host commands
    const processor = new InteractiveInputProcessor()
    
    const startTime = performance.now()
    await processor.fixPowerShellInputs(largeScript)
    const endTime = performance.now()
    
    const processingTime = endTime - startTime
    expect(processingTime).toBeLessThan(50) // Should be <50ms (was >1000ms in legacy)
  })
  
  test('should demonstrate O(n) vs O(n²) improvement', async () => {
    const testSizes = [10, 50, 100, 200]
    const times: number[] = []
    
    for (const size of testSizes) {
      const script = generateScriptWithReadHosts(size)
      const startTime = performance.now()
      await processor.fixPowerShellInputs(script)
      const endTime = performance.now()
      times.push(endTime - startTime)
    }
    
    // Verify linear growth (O(n)) not quadratic (O(n²))
    const growthRatio = times[3] / times[0] // 200 vs 10 elements
    expect(growthRatio).toBeLessThan(25) // Linear: 20x, Quadratic: 400x
  })
})
```

#### Database Performance
**File**: `tests/performance/DatabaseOperations.perf.test.ts`
**Purpose**: Test database operation performance
```typescript
describe('Database Performance', () => {
  test('should handle bulk operations efficiently', async () => {
    const repository = new SqliteScriptRepository(createTempDatabase())
    await repository.initialize()
    
    const scripts = Array.from({ length: 1000 }, (_, i) => 
      createTestScript(`echo "script ${i}"`, ScriptType.Shell)
    )
    
    const startTime = performance.now()
    for (const script of scripts) {
      await repository.addScript(script)
    }
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(5000) // <5 seconds for 1000 scripts
  })
})
```

---

## Mock Infrastructure (`tests/mocks/`)

### Repository Mocks
**File**: `tests/mocks/MockScriptRepository.ts`
```typescript
export function createMockRepository(): jest.Mocked<IScriptRepository> {
  return {
    addScript: jest.fn(),
    updateScript: jest.fn(),
    removeScript: jest.fn(),
    getScript: jest.fn(),
    getAllScripts: jest.fn(),
    clearAll: jest.fn(),
    scriptExists: jest.fn(),
    initialize: jest.fn(),
    close: jest.fn(),
    runMigrations: jest.fn()
  }
}
```

### System Capabilities Mocks
**File**: `tests/mocks/MockSystemCapabilities.ts`
```typescript
export function createMockSystemCapabilities(): jest.Mocked<ISystemCapabilities> {
  return {
    isAvailable: jest.fn(),
    getAvailableInterpreters: jest.fn(),
    getBestExecutorFor: jest.fn(),
    refreshCapabilities: jest.fn(),
    getCachedCapabilities: jest.fn()
  }
}
```

---

## Test Helpers and Utilities (`tests/helpers/`)

### Test Data Builders
**File**: `tests/helpers/TestDataBuilder.ts`
```typescript
export class TestDataBuilder {
  static createScript(name: string, content: string, type: ScriptType): Script {
    return new Script({
      name,
      originalScript: content,
      metadata: new ScriptMetadata({
        scriptType: type,
        originalPlatform: Platform.Unix,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    })
  }
  
  static createExecutionContext(options: Partial<ExecutionContext> = {}): ExecutionContext {
    return new ExecutionContext({
      platform: Platform.Unix,
      workingDirectory: process.cwd(),
      environment: {},
      streamOutput: false,
      ...options
    })
  }
}
```

### Test Environment Setup
**File**: `tests/helpers/TestEnvironment.ts`
```typescript
export class TestEnvironment {
  static createTempDatabase(): string {
    const tempDir = os.tmpdir()
    const dbPath = path.join(tempDir, `test-${Date.now()}.db`)
    return dbPath
  }
  
  static createTempScript(content: string, extension = '.sh'): string {
    const tempDir = os.tmpdir()
    const scriptPath = path.join(tempDir, `script-${Date.now()}${extension}`)
    fs.writeFileSync(scriptPath, content)
    return scriptPath
  }
  
  static cleanupTempFiles(paths: string[]): void {
    paths.forEach(path => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path)
      }
    })
  }
}
```

---

## Test Configuration Files

### Unit Test Configuration
**File**: `tests/jest.unit.config.js`
```javascript
module.exports = {
  displayName: 'Unit Tests',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts' // Entry point excluded
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/core/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
}
```

### Integration Test Configuration
**File**: `tests/jest.integration.config.js`
```javascript
module.exports = {
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 30000, // Longer timeout for integration tests
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/integration-setup.ts']
}
```

### E2E Test Configuration
**File**: `tests/jest.e2e.config.js`
```javascript
module.exports = {
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
  testTimeout: 60000, // Longest timeout for E2E tests
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/e2e-setup.ts']
}
```

---

## Testing Implementation Timeline

### Phase 1: Foundation Testing (Week 1-2)
- [ ] Core interface mocks created
- [ ] Domain model unit tests (>95% coverage)
- [ ] Error hierarchy tests
- [ ] Test data builders implemented

### Phase 2: Service Testing (Week 3-4)
- [ ] Service layer unit tests (>85% coverage)
- [ ] Repository unit tests with real SQLite
- [ ] Service integration tests
- [ ] Database migration tests

### Phase 3: Command Testing (Week 5-6)
- [ ] Command handler unit tests
- [ ] CLI infrastructure tests
- [ ] Command integration tests
- [ ] E2E CLI workflow tests

### Phase 4: Core Testing (Week 7-8)
- [ ] Processor unit tests with performance validation
- [ ] Executor unit tests with real execution
- [ ] Validator unit tests with security scenarios
- [ ] Core integration tests

### Phase 5: Performance Testing (Week 9-10)
- [ ] Performance regression tests
- [ ] Load testing for database operations
- [ ] Memory usage tests
- [ ] Algorithm optimization validation

### Phase 6: Complete Coverage (Week 11-12)
- [ ] >80% overall coverage achieved
- [ ] All legacy functionality tested
- [ ] Performance improvements validated
- [ ] E2E workflows complete

## Success Criteria

### Coverage Targets
- [ ] >80% line coverage overall
- [ ] >75% branch coverage overall  
- [ ] >95% coverage for core business logic
- [ ] 100% coverage for critical paths (execution, persistence)

### Performance Validation
- [ ] String processing 20-48x faster than legacy
- [ ] Database operations maintain or improve performance
- [ ] Memory usage optimized
- [ ] No performance regressions in any area

### Quality Assurance
- [ ] All existing functionality preserved
- [ ] All CLI commands work identically
- [ ] Database migrations work flawlessly
- [ ] Error handling maintains user experience
- [ ] Interactive mode fully functional

This comprehensive testing strategy ensures that the refactored application maintains all existing functionality while delivering significant architectural and performance improvements.