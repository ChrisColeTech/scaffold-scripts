# Scaffold Scripts CLI - Refactored Project Structure

## Overview

This document outlines the complete refactored project structure following Clean Architecture principles as defined in [ARCHITECTURE.md](./ARCHITECTURE.md). The structure emphasizes separation of concerns, testability, and maintainability.

---

## Project Structure

```
scaffold-scripts/
├── docs/                                    # Documentation
│   ├── ARCHITECTURE.md                      # Architecture guide
│   ├── REFACTOR_PLAN.md                     # Refactoring plan
│   ├── PROJECT_STRUCTURE.md                 # This document
│   ├── API_REFERENCE.md                     # API documentation
│   └── init-refactored-structure.sh         # Structure initialization script
├── src/                                     # Source code
│   ├── core/                                # Core business logic layer
│   │   ├── interfaces/                      # Core abstractions
│   │   │   ├── IScriptRepository.ts         # Script storage abstraction
│   │   │   ├── IScriptProcessor.ts          # Script processing abstraction
│   │   │   ├── IScriptExecutor.ts           # Script execution abstraction
│   │   │   ├── ISystemCapabilities.ts       # System capabilities abstraction
│   │   │   ├── IScriptValidator.ts          # Validation abstraction
│   │   │   ├── IScriptConverter.ts          # Conversion abstraction
│   │   │   ├── ICache.ts                    # Caching abstraction
│   │   │   └── index.ts                     # Barrel export
│   │   ├── models/                          # Domain models
│   │   │   ├── Script.ts                    # Script domain model
│   │   │   ├── ScriptMetadata.ts            # Script metadata model
│   │   │   ├── ExecutionResult.ts           # Execution result model
│   │   │   ├── ValidationResult.ts          # Validation result model
│   │   │   ├── ProcessingResult.ts          # Processing result model
│   │   │   ├── SystemInfo.ts                # System information model
│   │   │   ├── ScriptType.ts                # Script type enumeration
│   │   │   ├── Platform.ts                  # Platform enumeration
│   │   │   └── index.ts                     # Barrel export
│   │   ├── errors/                          # Error hierarchy
│   │   │   ├── ScaffoldError.ts             # Base error class
│   │   │   ├── ValidationError.ts           # Validation errors
│   │   │   ├── ExecutionError.ts            # Execution errors
│   │   │   ├── ProcessingError.ts           # Processing errors
│   │   │   ├── SecurityError.ts             # Security errors
│   │   │   ├── ResourceError.ts             # Resource errors
│   │   │   └── index.ts                     # Barrel export
│   │   ├── processors/                      # Processing engines
│   │   │   ├── IScriptProcessor.ts          # Processing interface
│   │   │   ├── BaseScriptProcessor.ts       # Base processor implementation
│   │   │   ├── InteractiveInputProcessor.ts # Interactive input handling
│   │   │   ├── ConversionProcessor.ts       # Script conversion logic
│   │   │   ├── ProcessorPipeline.ts         # Processing pipeline
│   │   │   ├── ProcessorFactory.ts          # Processor factory
│   │   │   └── index.ts                     # Barrel export
│   │   ├── execution/                       # Execution engines
│   │   │   ├── IScriptExecutor.ts           # Execution interface
│   │   │   ├── BaseScriptExecutor.ts        # Base executor implementation
│   │   │   ├── ShellExecutor.ts             # Shell script executor
│   │   │   ├── PowerShellExecutor.ts        # PowerShell script executor
│   │   │   ├── PythonExecutor.ts            # Python script executor
│   │   │   ├── NodeExecutor.ts              # Node.js script executor
│   │   │   ├── BatchExecutor.ts             # Batch script executor
│   │   │   ├── ExecutorFactory.ts           # Executor factory
│   │   │   ├── ExecutionContext.ts          # Execution context
│   │   │   └── index.ts                     # Barrel export
│   │   ├── validation/                      # Validation engines
│   │   │   ├── IValidator.ts                # Validation interface
│   │   │   ├── ScriptValidator.ts           # Main script validator
│   │   │   ├── SecurityValidator.ts         # Security validation
│   │   │   ├── SyntaxValidator.ts           # Syntax validation
│   │   │   ├── ValidationRule.ts            # Individual validation rule
│   │   │   ├── ValidationPipeline.ts        # Validation pipeline
│   │   │   ├── ValidatorFactory.ts          # Validator factory
│   │   │   └── index.ts                     # Barrel export
│   │   ├── caching/                         # Caching infrastructure
│   │   │   ├── ICache.ts                    # Cache interface
│   │   │   ├── LRUCache.ts                  # LRU cache implementation
│   │   │   ├── CacheManager.ts              # Cache management
│   │   │   ├── CacheKey.ts                  # Cache key generation
│   │   │   ├── CacheConfig.ts               # Cache configuration
│   │   │   └── index.ts                     # Barrel export
│   │   ├── performance/                     # Performance optimizations
│   │   │   ├── ObjectPool.ts                # Object pooling
│   │   │   ├── StringProcessor.ts           # Optimized string operations
│   │   │   ├── PerformanceMonitor.ts        # Performance monitoring
│   │   │   ├── MemoryManager.ts             # Memory management
│   │   │   └── index.ts                     # Barrel export
│   │   ├── di/                              # Dependency injection
│   │   │   ├── Container.ts                 # DI container
│   │   │   ├── ServiceRegistry.ts           # Service registry
│   │   │   ├── ServiceLifetime.ts           # Service lifetime management
│   │   │   ├── interfaces.ts                # DI interfaces
│   │   │   └── index.ts                     # Barrel export
│   │   └── index.ts                         # Core layer barrel export
│   ├── services/                            # Service layer (business logic)
│   │   ├── IScriptService.ts                # Script service interface
│   │   ├── ScriptService.ts                 # Main script service
│   │   ├── IInteractiveService.ts           # Interactive service interface
│   │   ├── InteractiveService.ts            # Interactive mode service
│   │   ├── ISystemService.ts                # System service interface
│   │   ├── SystemService.ts                 # System integration service
│   │   ├── IExportService.ts                # Export service interface
│   │   ├── ExportService.ts                 # Script export service
│   │   ├── ServiceBase.ts                   # Base service class
│   │   └── index.ts                         # Barrel export
│   ├── repositories/                        # Data access layer
│   │   ├── IScriptRepository.ts             # Repository interface
│   │   ├── SqliteScriptRepository.ts        # SQLite implementation
│   │   ├── CachedScriptRepository.ts        # Cached repository decorator
│   │   ├── MemoryScriptRepository.ts        # In-memory implementation (testing)
│   │   ├── RepositoryBase.ts                # Base repository class
│   │   ├── migrations/                      # Database migrations
│   │   │   ├── Migration.ts                 # Migration interface
│   │   │   ├── MigrationRunner.ts           # Migration execution
│   │   │   ├── 001_InitialSchema.ts         # Initial database schema
│   │   │   ├── 002_AddMetadata.ts           # Add metadata support
│   │   │   └── index.ts                     # Migration exports
│   │   └── index.ts                         # Barrel export
│   ├── commands/                            # Command handlers
│   │   ├── ICommandHandler.ts               # Command handler interface
│   │   ├── CommandBase.ts                   # Base command handler
│   │   ├── AddCommandHandler.ts             # Add script command
│   │   ├── ListCommandHandler.ts            # List scripts command
│   │   ├── ExecuteCommandHandler.ts         # Execute script command
│   │   ├── RemoveCommandHandler.ts          # Remove script command
│   │   ├── UpdateCommandHandler.ts          # Update script command
│   │   ├── ViewCommandHandler.ts            # View script command
│   │   ├── ClearCommandHandler.ts           # Clear all scripts command
│   │   ├── ExportCommandHandler.ts          # Export scripts command
│   │   ├── UninstallCommandHandler.ts       # Uninstall command
│   │   ├── CommandContext.ts                # Command execution context
│   │   ├── CommandResult.ts                 # Command result model
│   │   └── index.ts                         # Barrel export
│   ├── cli/                                 # CLI infrastructure
│   │   ├── CommandLineInterface.ts          # Main CLI class
│   │   ├── CommandRegistry.ts               # Command registration
│   │   ├── ArgumentParser.ts                # Argument parsing
│   │   ├── OutputFormatter.ts               # Output formatting
│   │   ├── InputValidator.ts                # Input validation
│   │   ├── HelpProvider.ts                  # Help system
│   │   ├── InteractiveMenu.ts               # Interactive menu
│   │   ├── ProgressBar.ts                   # Progress indication
│   │   └── index.ts                         # Barrel export
│   ├── utils/                               # Utility functions
│   │   ├── FileSystemHelper.ts              # File system operations
│   │   ├── PathResolver.ts                  # Path resolution utilities
│   │   ├── ProcessHelper.ts                 # Process execution utilities
│   │   ├── Logger.ts                        # Logging utilities
│   │   ├── StringUtils.ts                   # String manipulation utilities
│   │   ├── ValidationUtils.ts               # Validation utilities
│   │   ├── PromiseUtils.ts                  # Promise utilities
│   │   ├── TypeGuards.ts                    # Type guard functions
│   │   └── index.ts                         # Barrel export
│   ├── config/                              # Configuration management
│   │   ├── AppConfiguration.ts              # Main application configuration
│   │   ├── DatabaseConfig.ts                # Database configuration
│   │   ├── ExecutionConfig.ts               # Execution configuration
│   │   ├── ValidationConfig.ts              # Validation configuration
│   │   ├── CacheConfig.ts                   # Cache configuration
│   │   ├── PerformanceConfig.ts             # Performance configuration
│   │   ├── ConfigLoader.ts                  # Configuration loading
│   │   ├── ConfigValidator.ts               # Configuration validation
│   │   └── index.ts                         # Barrel export
│   ├── legacy/                              # Legacy code (temporary during migration)
│   │   ├── database.ts                      # Legacy database implementation
│   │   ├── scriptConverter.ts               # Legacy converter
│   │   ├── scriptTypeDetector.ts            # Legacy type detector
│   │   ├── systemCapabilities.ts            # Legacy system capabilities
│   │   ├── usageHelper.ts                   # Legacy usage helper
│   │   ├── symbols.ts                       # Legacy symbols (to be migrated)
│   │   └── README.md                        # Migration notes
│   ├── Application.ts                       # Application composition root
│   ├── ApplicationBuilder.ts                # Application builder
│   └── index.ts                             # Entry point (minimal)
├── tests/                                   # Test files
│   ├── unit/                                # Unit tests
│   │   ├── core/                            # Core layer tests
│   │   │   ├── models/                      # Domain model tests
│   │   │   │   ├── Script.test.ts           # Script model tests
│   │   │   │   ├── ScriptMetadata.test.ts   # Metadata tests
│   │   │   │   ├── ExecutionResult.test.ts  # Execution result tests
│   │   │   │   ├── ValidationResult.test.ts # Validation result tests
│   │   │   │   └── SystemInfo.test.ts       # System info tests
│   │   │   ├── processors/                  # Processor tests
│   │   │   │   ├── InteractiveInputProcessor.test.ts # Interactive input tests
│   │   │   │   ├── ConversionProcessor.test.ts       # Conversion tests
│   │   │   │   ├── ProcessorPipeline.test.ts         # Pipeline tests
│   │   │   │   └── ProcessorFactory.test.ts          # Factory tests
│   │   │   ├── execution/                   # Execution tests
│   │   │   │   ├── ShellExecutor.test.ts    # Shell executor tests
│   │   │   │   ├── PowerShellExecutor.test.ts # PowerShell tests
│   │   │   │   ├── PythonExecutor.test.ts   # Python executor tests
│   │   │   │   ├── NodeExecutor.test.ts     # Node executor tests
│   │   │   │   └── ExecutorFactory.test.ts  # Executor factory tests
│   │   │   ├── validation/                  # Validation tests
│   │   │   │   ├── ScriptValidator.test.ts  # Script validator tests
│   │   │   │   ├── SecurityValidator.test.ts # Security tests
│   │   │   │   ├── ValidationRule.test.ts   # Validation rule tests
│   │   │   │   └── ValidationPipeline.test.ts # Pipeline tests
│   │   │   └── caching/                     # Caching tests
│   │   │       ├── LRUCache.test.ts         # LRU cache tests
│   │   │       ├── CacheManager.test.ts     # Cache manager tests
│   │   │       └── CacheKey.test.ts         # Cache key tests
│   │   ├── services/                        # Service layer tests
│   │   │   ├── ScriptService.test.ts        # Script service tests
│   │   │   ├── InteractiveService.test.ts   # Interactive service tests
│   │   │   ├── SystemService.test.ts        # System service tests
│   │   │   └── ExportService.test.ts        # Export service tests
│   │   ├── repositories/                    # Repository tests
│   │   │   ├── SqliteScriptRepository.test.ts # SQLite repository tests
│   │   │   ├── CachedScriptRepository.test.ts # Cached repository tests
│   │   │   └── MemoryScriptRepository.test.ts # Memory repository tests
│   │   ├── commands/                        # Command handler tests
│   │   │   ├── AddCommandHandler.test.ts    # Add command tests
│   │   │   ├── ListCommandHandler.test.ts   # List command tests
│   │   │   ├── ExecuteCommandHandler.test.ts # Execute command tests
│   │   │   ├── RemoveCommandHandler.test.ts # Remove command tests
│   │   │   ├── UpdateCommandHandler.test.ts # Update command tests
│   │   │   ├── ViewCommandHandler.test.ts   # View command tests
│   │   │   └── ClearCommandHandler.test.ts  # Clear command tests
│   │   ├── cli/                             # CLI infrastructure tests
│   │   │   ├── CommandLineInterface.test.ts # CLI tests
│   │   │   ├── CommandRegistry.test.ts      # Command registry tests
│   │   │   ├── ArgumentParser.test.ts       # Argument parser tests
│   │   │   └── OutputFormatter.test.ts      # Output formatter tests
│   │   └── utils/                           # Utility tests
│   │       ├── FileSystemHelper.test.ts     # File system tests
│   │       ├── PathResolver.test.ts         # Path resolver tests
│   │       ├── ProcessHelper.test.ts        # Process helper tests
│   │       └── StringUtils.test.ts          # String utility tests
│   ├── integration/                         # Integration tests
│   │   ├── services/                        # Service integration tests
│   │   │   ├── ScriptServiceIntegration.test.ts # Script service integration
│   │   │   └── SystemServiceIntegration.test.ts # System service integration
│   │   ├── repositories/                    # Repository integration tests
│   │   │   └── ScriptRepositoryIntegration.test.ts # Repository integration
│   │   ├── commands/                        # Command integration tests
│   │   │   ├── AddCommandIntegration.test.ts # Add command integration
│   │   │   ├── ExecuteCommandIntegration.test.ts # Execute integration
│   │   │   └── WorkflowIntegration.test.ts  # Full workflow tests
│   │   └── cli/                             # CLI integration tests
│   │       └── CLIIntegration.test.ts       # Full CLI integration
│   ├── e2e/                                 # End-to-end tests
│   │   ├── AddScript.e2e.test.ts            # Add script E2E
│   │   ├── ExecuteScript.e2e.test.ts        # Execute script E2E
│   │   ├── InteractiveMode.e2e.test.ts      # Interactive mode E2E
│   │   └── CrossPlatform.e2e.test.ts        # Cross-platform E2E
│   ├── performance/                         # Performance tests
│   │   ├── ScriptProcessing.perf.test.ts    # Processing performance
│   │   ├── DatabaseOperations.perf.test.ts  # Database performance
│   │   ├── CachePerformance.perf.test.ts    # Cache performance
│   │   └── MemoryUsage.perf.test.ts         # Memory usage tests
│   ├── mocks/                               # Mock implementations
│   │   ├── MockScriptRepository.ts          # Mock repository
│   │   ├── MockSystemCapabilities.ts        # Mock system capabilities
│   │   ├── MockFileSystem.ts                # Mock file system
│   │   ├── MockProcessRunner.ts             # Mock process runner
│   │   └── index.ts                         # Mock exports
│   ├── helpers/                             # Test helpers
│   │   ├── TestDataBuilder.ts               # Test data creation
│   │   ├── TestEnvironment.ts               # Test environment setup
│   │   ├── AssertionHelpers.ts              # Custom assertions
│   │   ├── MockFactory.ts                   # Mock factory
│   │   └── index.ts                         # Helper exports
│   ├── fixtures/                            # Test fixtures
│   │   ├── scripts/                         # Sample scripts
│   │   │   ├── simple.sh                    # Simple shell script
│   │   │   ├── complex.ps1                  # Complex PowerShell script
│   │   │   ├── interactive.py               # Interactive Python script
│   │   │   └── node-app.js                  # Node.js application
│   │   ├── configs/                         # Test configurations
│   │   │   ├── test.config.json             # Test configuration
│   │   │   └── minimal.config.json          # Minimal configuration
│   │   └── data/                            # Test data
│   │       ├── scripts.json                 # Sample script data
│   │       └── metadata.json                # Sample metadata
│   ├── legacy/                              # Legacy test files (temporary)
│   │   ├── aliases.test.ts                  # Legacy alias tests
│   │   ├── basic.test.ts                    # Legacy basic tests
│   │   ├── clear-functionality.test.ts      # Legacy clear tests
│   │   ├── convert-feature-integration.test.ts # Legacy convert tests
│   │   ├── hanging-prevention.test.ts       # Legacy hanging tests
│   │   ├── interactive-input-fix.test.ts    # Legacy interactive tests
│   │   ├── multi-language-interactive-fix.test.ts # Legacy multi-lang tests
│   │   ├── regression-hanging.test.ts       # Legacy regression tests
│   │   ├── script-processor-autofix.test.ts # Legacy processor tests
│   │   ├── system-capabilities.test.ts      # Legacy capabilities tests
│   │   ├── version-selection.test.ts        # Legacy version tests
│   │   ├── windows-conversion-fix.test.ts   # Legacy Windows tests
│   │   ├── test-isolation.ts                # Legacy test isolation
│   │   └── test-utils.ts                    # Legacy test utilities
│   ├── jest.config.js                       # Jest configuration
│   ├── jest.unit.config.js                  # Unit test configuration
│   ├── jest.integration.config.js           # Integration test configuration
│   ├── jest.e2e.config.js                   # E2E test configuration
│   └── jest.performance.config.js           # Performance test configuration
├── scripts/                                 # Build and deployment scripts
│   ├── build.sh                             # Build script
│   ├── test.sh                              # Test script
│   ├── coverage.sh                          # Coverage script
│   ├── lint.sh                              # Linting script
│   ├── install.sh                           # Installation script
│   ├── install.ps1                          # Windows installation script
│   ├── uninstall.sh                         # Uninstall script
│   ├── uninstall.ps1                        # Windows uninstall script
│   ├── setup-github-ssh.sh                  # GitHub SSH setup
│   ├── setup-github-ssh.ps1                 # Windows GitHub SSH setup
│   └── migrate-legacy.sh                    # Legacy migration script
├── dist/                                    # Compiled JavaScript (generated)
├── coverage/                                # Test coverage reports (generated)
├── node_modules/                            # Dependencies (generated)
├── bin/                                     # Binary files
│   └── scaffold-scripts                     # CLI executable
├── package.json                             # Package configuration
├── package-lock.json                        # Dependency lock file
├── tsconfig.json                            # TypeScript configuration
├── tsconfig.build.json                      # Build TypeScript configuration
├── eslint.config.js                         # ESLint configuration
├── prettier.config.js                       # Prettier configuration
├── jest.config.js                           # Main Jest configuration
├── .gitignore                               # Git ignore rules
├── .npmignore                               # NPM ignore rules
├── .github/                                 # GitHub configuration
│   ├── workflows/                           # GitHub Actions
│   │   ├── ci.yml                           # Continuous integration
│   │   ├── release.yml                      # Release workflow
│   │   └── performance.yml                  # Performance testing
│   ├── ISSUE_TEMPLATE/                      # Issue templates
│   │   ├── bug_report.md                    # Bug report template
│   │   └── feature_request.md               # Feature request template
│   └── pull_request_template.md             # PR template
├── CHANGELOG.md                             # Change log
├── CONTRIBUTING.md                          # Contributing guidelines
├── README.md                                # Project README
├── README-full.md                           # Detailed README
├── RELEASE-PROCESS.md                       # Release process
├── SECURITY.md                              # Security policy
└── LICENSE                                  # MIT License
```

---

## Layer Descriptions

### Core Layer (`src/core/`)
**Purpose:** Contains business logic and domain models  
**Dependencies:** None (innermost layer)  
**Key Principles:**
- No dependencies on external frameworks
- Contains interfaces for all abstractions
- Implements domain logic and business rules
- Houses error hierarchy and domain models

### Services Layer (`src/services/`)
**Purpose:** Orchestrates business operations  
**Dependencies:** Core layer only  
**Key Principles:**
- Implements use cases and workflows
- Coordinates between repositories and processors
- Contains application-specific business logic
- No knowledge of CLI or external concerns

### Repositories Layer (`src/repositories/`)
**Purpose:** Data access and persistence  
**Dependencies:** Core layer  
**Key Principles:**
- Implements data storage abstractions
- Handles database operations and migrations
- Provides caching and optimization
- No business logic

### Commands Layer (`src/commands/`)
**Purpose:** Command handlers for CLI operations  
**Dependencies:** Services and Core layers  
**Key Principles:**
- One handler per CLI command
- Validates input and formats output
- Delegates to services for business logic
- Minimal logic, maximum delegation

### CLI Layer (`src/cli/`)
**Purpose:** Command-line interface infrastructure  
**Dependencies:** Commands layer  
**Key Principles:**
- Argument parsing and validation
- Output formatting and display
- Interactive mode handling
- No business logic

### Utils Layer (`src/utils/`)
**Purpose:** Shared utilities and helpers  
**Dependencies:** None (pure functions)  
**Key Principles:**
- Stateless utility functions
- No dependencies on other layers
- Reusable across the application
- Well-tested and documented

---

## File Organization Standards

### Naming Conventions
- **Classes:** PascalCase (`ScriptService.ts`)
- **Interfaces:** PascalCase with 'I' prefix (`IScriptService.ts`)
- **Files:** PascalCase matching primary export
- **Directories:** kebab-case (`script-processing/`)
- **Tests:** Same as source with `.test.ts` suffix

### Module Structure
Each module follows this pattern:
```typescript
/**
 * Module Description
 */

// External dependencies
import external from 'external-package'

// Internal dependencies
import { Internal } from '../internal'

// Types and interfaces
interface LocalInterface { }

// Constants
const CONSTANTS = { }

// Main implementation
export class ModuleName implements IModuleName {
  // Implementation
}

// Default export (if applicable)
export default ModuleName
```

### Barrel Exports
Each directory has an `index.ts` file that exports all public APIs:
```typescript
// src/core/models/index.ts
export { Script } from './Script'
export { ScriptMetadata } from './ScriptMetadata'
export { ExecutionResult } from './ExecutionResult'
// ... other exports
```

---

## Testing Organization

### Test Structure
- **Unit Tests:** Test individual components in isolation
- **Integration Tests:** Test component interactions
- **E2E Tests:** Test complete user workflows
- **Performance Tests:** Test performance characteristics

### Test Naming
```typescript
describe('ScriptService', () => {
  describe('addScript', () => {
    describe('when script is valid', () => {
      test('should add script successfully', () => {
        // Test implementation
      })
    })
    
    describe('when script is invalid', () => {
      test('should throw ValidationError', () => {
        // Test implementation
      })
    })
  })
})
```

### Mock Organization
- **Mocks:** Fake implementations for testing
- **Helpers:** Utilities for test setup and assertions
- **Fixtures:** Sample data and configurations
- **Builders:** Fluent APIs for test data creation

---

## Build and Deployment

### Scripts
- **build.sh:** Compiles TypeScript and prepares distribution
- **test.sh:** Runs all test suites with coverage
- **lint.sh:** Runs ESLint and Prettier
- **coverage.sh:** Generates and opens coverage reports

### Configuration Files
- **tsconfig.json:** Main TypeScript configuration
- **tsconfig.build.json:** Production build configuration
- **jest.config.js:** Main test configuration
- **eslint.config.js:** Linting rules and configuration

### GitHub Actions
- **ci.yml:** Continuous integration workflow
- **release.yml:** Automated release process
- **performance.yml:** Performance regression testing

---

## Migration Strategy

### Legacy Code
During refactoring, legacy code is moved to `src/legacy/` and gradually replaced:
1. Create new implementation following architecture
2. Add feature flag to toggle between old/new
3. Migrate tests to new structure
4. Remove legacy code once fully replaced

### Incremental Migration
Each phase of the refactor plan creates new components while maintaining compatibility:
1. **Phase 1:** Core interfaces and models
2. **Phase 2:** Service layer implementation
3. **Phase 3:** Command handlers
4. **Phase 4:** Core processors and executors
5. **Phase 5:** Performance optimizations
6. **Phase 6:** Complete test coverage

### Validation
Each migration step includes:
- All existing tests must pass
- New tests for new components
- Performance benchmarks
- Code coverage metrics
- Documentation updates

---

This structure ensures clean separation of concerns, high testability, and maintainable code that follows the architectural principles defined in the project.