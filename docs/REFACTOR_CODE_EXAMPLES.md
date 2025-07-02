# Scaffold Scripts CLI - Refactor Code Examples

This document contains code examples and implementation patterns extracted from the legacy codebase to guide the refactor implementation.

## Phase 1: Foundation & Core Abstractions

### 1.1 Core Interfaces Implementation

#### `src/core/interfaces/IScriptRepository.ts`
**Source**: Extract from `app_old/src/database.ts`
**Implementation Details**:
```typescript
export interface IScriptRepository {
  // Migrate from ScaffoldDatabase class
  addScript(script: Script): Promise<void>
  updateScript(name: string, script: Script): Promise<void>
  removeScript(name: string): Promise<void>
  getScript(name: string): Promise<Script | null>
  getAllScripts(): Promise<Script[]>
  clearAll(): Promise<void>
  scriptExists(name: string): Promise<boolean>
  
  // Database management
  initialize(): Promise<void>
  close(): Promise<void>
  runMigrations(): Promise<void>
}
```

#### `src/core/interfaces/IScriptProcessor.ts`
**Source**: Extract from `app_old/src/scriptProcessor.ts`
**Implementation Details**:
```typescript
export interface IScriptProcessor {
  // Migrate from ScriptProcessor class
  processScript(scriptPath: string, options: ProcessingOptions): Promise<ProcessingResult>
  fixInteractiveInputs(content: string, scriptType: ScriptType): Promise<string>
  generateMultiPlatformVersions(script: Script): Promise<Script>
  validateAndProcess(content: string, options: ProcessingOptions): Promise<ProcessingResult>
}
```

#### `src/core/interfaces/IScriptExecutor.ts`
**Source**: Extract from `app_old/src/scriptExecutor.ts`
**Implementation Details**:
```typescript
export interface IScriptExecutor {
  // Migrate from ScriptExecutor class
  executeScript(script: Script, context: ExecutionContext): Promise<ExecutionResult>
  canExecute(scriptType: ScriptType): boolean
  getExecutionCommand(script: Script): string[]
  streamExecution(script: Script, outputHandler: (data: string) => void): Promise<ExecutionResult>
}
```

#### `src/core/interfaces/ISystemCapabilities.ts`
**Source**: Extract from `app_old/src/systemCapabilities.ts`
**Implementation Details**:
```typescript
export interface ISystemCapabilities {
  // Migrate from SystemCapabilityChecker singleton
  isAvailable(capability: string): boolean
  getAvailableInterpreters(): string[]
  getBestExecutorFor(scriptType: ScriptType): string | null
  refreshCapabilities(): Promise<void>
  getCachedCapabilities(): CapabilityMap
}
```

#### `src/core/interfaces/IScriptValidator.ts`
**Source**: Extract from `app_old/src/scriptValidator.ts`
**Implementation Details**:
```typescript
export interface IScriptValidator {
  // Migrate from ScriptValidator class
  validateScript(content: string, options: ValidationOptions): Promise<ValidationResult>
  checkSecurity(content: string): SecurityValidationResult
  validateSyntax(content: string, scriptType: ScriptType): SyntaxValidationResult
  isFileValid(filePath: string): Promise<boolean>
}
```

#### `src/core/interfaces/IScriptConverter.ts`
**Source**: Extract from `app_old/src/scriptConverter.ts`
**Implementation Details**:
```typescript
export interface IScriptConverter {
  // Migrate from converter functions
  convertToTargetPlatform(script: string, from: Platform, to: Platform): Promise<string>
  generateCrossPlatformVersion(script: string, originalPlatform: Platform): Promise<string>
  canConvert(from: Platform, to: Platform): boolean
  getConversionStrategy(from: Platform, to: Platform): ConversionStrategy
}
```

### 1.2 Domain Models Implementation

#### `src/core/models/Script.ts`
**Source**: Extract from database schema and usage patterns
**Implementation Details**:
```typescript
export class Script {
  // Migrate from database record structure
  public readonly name: string
  public readonly originalScript: string
  public readonly windowsScript?: string  
  public readonly unixScript?: string
  public readonly crossPlatformScript?: string
  public readonly metadata: ScriptMetadata
  
  constructor(params: ScriptParams) {
    // Migrate creation logic from addCommand()
    // Preserve all multi-platform storage logic
  }
  
  // Business logic methods
  getVersionForPlatform(platform: Platform): string | null
  hasVersion(platform: Platform): boolean
  getBestAvailableVersion(capabilities: ISystemCapabilities): string
  getExecutableVersion(flags: VersionSelectionFlags): string
}
```

#### `src/core/models/ScriptMetadata.ts`
**Source**: Extract from database metadata fields
**Implementation Details**:
```typescript
export class ScriptMetadata {
  // Migrate from database metadata columns
  public readonly scriptType: ScriptType
  public readonly originalPlatform: Platform
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly description?: string
  public readonly tags: string[]
  public readonly validationLevel: ValidationLevel
  
  // Business logic from version selection
  isCompatibleWith(platform: Platform): boolean
  getRecommendedVersion(context: ExecutionContext): Platform
}
```

#### `src/core/models/ExecutionResult.ts`
**Source**: Extract from `scriptExecutor.ts` return patterns
**Implementation Details**:
```typescript
export class ExecutionResult {
  // Migrate from ScriptExecutor return values
  public readonly success: boolean
  public readonly exitCode: number
  public readonly stdout: string
  public readonly stderr: string
  public readonly executionTime: number
  public readonly command: string[]
  public readonly error?: Error
  
  // Utility methods from executor logic
  hasOutput(): boolean
  getFormattedOutput(): string
  wasKilled(): boolean
}
```

### 1.3 Error Hierarchy Implementation

#### `src/core/errors/ScaffoldError.ts`
**Base error class with error context**
```typescript
export abstract class ScaffoldError extends Error {
  public readonly code: string
  public readonly context: ErrorContext
  public readonly timestamp: Date
  
  // Standardize error handling from current try/catch blocks
}
```

#### `src/core/errors/ValidationError.ts`
**Source**: Extract from validation failures in `scriptValidator.ts`
```typescript
export class ValidationError extends ScaffoldError {
  // Migrate from ScriptValidator error handling
  public readonly validationType: ValidationType
  public readonly failedRules: ValidationRule[]
  public readonly suggestions: string[]
}
```

#### `src/core/errors/ExecutionError.ts`
**Source**: Extract from execution failures in `scriptExecutor.ts`
```typescript
export class ExecutionError extends ScaffoldError {
  // Migrate from ScriptExecutor error handling
  public readonly exitCode: number
  public readonly command: string[]
  public readonly platform: Platform
}
```

## Phase 2: Service Layer Implementation

### 2.1 Script Service Implementation

#### `src/services/IScriptService.ts`
**Purpose**: Main business logic orchestration interface
```typescript
export interface IScriptService {
  // High-level operations from index.ts command handlers
  addScript(name: string, scriptPath: string, options: AddScriptOptions): Promise<void>
  updateScript(name: string, scriptPath: string, options: UpdateScriptOptions): Promise<void>
  removeScript(name: string): Promise<void>
  listScripts(detailed: boolean): Promise<Script[]>
  executeScript(name: string, args: string[], options: ExecutionOptions): Promise<ExecutionResult>
  getScriptInfo(name: string): Promise<Script | null>
  clearAllScripts(): Promise<void>
}
```

#### `src/services/ScriptService.ts`
**Source**: Extract business logic from `index.ts` command functions
**Implementation Details**:
```typescript
export class ScriptService implements IScriptService {
  constructor(
    private repository: IScriptRepository,
    private processor: IScriptProcessor,
    private executor: IScriptExecutor,
    private validator: IScriptValidator,
    private capabilities: ISystemCapabilities
  ) {}
  
  async addScript(name: string, scriptPath: string, options: AddScriptOptions): Promise<void> {
    // Migrate exact logic from addCommand() function in index.ts
    // 1. Validate file exists and is readable
    // 2. Process script through processor pipeline
    // 3. Generate multi-platform versions if requested
    // 4. Validate all versions
    // 5. Store in repository
    
    // Preserve all error handling and user feedback
  }
  
  async executeScript(name: string, args: string[], options: ExecutionOptions): Promise<ExecutionResult> {
    // Migrate exact logic from handleScriptCommand() in index.ts
    // 1. Retrieve script from repository
    // 2. Apply version selection logic (--original, --windows, --unix, etc.)
    // 3. Check system capabilities
    // 4. Execute with appropriate executor
    // 5. Handle real-time output streaming
  }
  
  // Implement all other methods with exact business logic migration
}
```

### 2.2 Interactive Service Implementation

#### `src/services/InteractiveService.ts`
**Source**: Extract from `selectScriptInteractively()` in `index.ts`
**Implementation Details**:
```typescript
export class InteractiveService implements IInteractiveService {
  async selectScript(): Promise<string | null> {
    // Migrate exact logic from selectScriptInteractively()
    // 1. Get available scripts
    // 2. Add special options (list, add, clear, exit)
    // 3. Present interactive menu with prompts
    // 4. Handle user selection and cancellation
    
    // Preserve exact UI/UX from current implementation
  }
  
  async confirmDangerousOperation(operation: string): Promise<boolean> {
    // Extract confirmation logic from clearAllCommands()
  }
}
```

### 2.3 Repository Pattern Implementation

#### `src/repositories/SqliteScriptRepository.ts`
**Source**: Direct migration from `database.ts`
**Implementation Details**:
```typescript
export class SqliteScriptRepository implements IScriptRepository {
  // Migrate entire ScaffoldDatabase class
  private db: Database
  
  constructor(dbPath: string) {
    // Migrate exact database initialization from ScaffoldDatabase
  }
  
  async initialize(): Promise<void> {
    // Migrate exact schema creation and migration logic
    // Preserve all migration steps from v1 to current schema
  }
  
  async addScript(script: Script): Promise<void> {
    // Migrate exact SQL from addScript() method
    // Preserve transaction handling and error recovery
  }
  
  async runMigrations(): Promise<void> {
    // Migrate exact migration logic for schema upgrades
    // Preserve backward compatibility and data preservation
  }
  
  // Migrate all other methods with exact SQL preservation
}
```

## Migration Guidelines

1. **Read Legacy Code First**: Always examine the legacy implementation before writing new code
2. **Preserve Business Logic**: Keep exact validation, error handling, and processing logic
3. **Maintain Compatibility**: Ensure database schemas, command interfaces, and user experience remain unchanged
4. **Extract, Don't Rewrite**: Move existing functionality rather than creating new implementations
5. **Test Legacy Behavior**: Ensure migrated components behave identically to legacy versions