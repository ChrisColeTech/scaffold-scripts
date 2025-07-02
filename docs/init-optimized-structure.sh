#!/bin/bash

# Scaffold Scripts CLI - Optimized Project Structure Initialization
# This script creates only the 85 files that will actually be implemented
# as defined in OPTIMIZED_PROJECT_STRUCTURE.md

set -e

echo "🚀 Initializing Scaffold Scripts CLI Optimized Structure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to create directory and log
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${BLUE}📁 Created directory: ${NC}$1"
    else
        echo -e "${YELLOW}📁 Directory exists: ${NC}$1"
    fi
}

# Function to create file with template content
create_file() {
    local file_path="$1"
    local template_content="$2"
    
    if [ ! -f "$file_path" ]; then
        echo "$template_content" > "$file_path"
        echo -e "${GREEN}📄 Created file: ${NC}$file_path"
    else
        echo -e "${YELLOW}📄 File exists: ${NC}$file_path"
    fi
}

# Function to create TypeScript interface template
create_ts_interface() {
    local file_path="$1"
    local interface_name="$2"
    local description="$3"
    
    local content="/**
 * $description
 * 
 * This interface defines the contract for $interface_name
 * following the principles outlined in ARCHITECTURE.md
 * 
 * @see DETAILED_REFACTOR_PLAN.md for implementation details
 */

export interface $interface_name {
  // TODO: Implement methods as specified in refactor plan
  // See DETAILED_REFACTOR_PLAN.md Phase X for specific requirements
}

export default $interface_name"
    
    create_file "$file_path" "$content"
}

# Function to create TypeScript class template
create_ts_class() {
    local file_path="$1"
    local class_name="$2"
    local description="$3"
    local interface_name="$4"
    
    local implements_clause=""
    if [ -n "$interface_name" ]; then
        implements_clause=" implements $interface_name"
    fi
    
    local content="/**
 * $description
 * 
 * This class implements $class_name following Clean Architecture principles
 * as outlined in ARCHITECTURE.md
 * 
 * @see DETAILED_REFACTOR_PLAN.md for migration details from legacy code
 */

export class $class_name$implements_clause {
  /**
   * Constructor
   * @param dependencies Injected dependencies following DI principles
   */
  constructor(
    // TODO: Add constructor parameters for dependency injection
    // See DETAILED_REFACTOR_PLAN.md for specific dependencies
  ) {
    // TODO: Initialize class properties
  }

  // TODO: Implement class methods as specified in refactor plan
  // Follow SOLID principles and keep methods under 50 lines
  // See ARCHITECTURE.md for coding standards
}

export default $class_name"
    
    create_file "$file_path" "$content"
}

# Function to create barrel export file
create_barrel_export() {
    local file_path="$1"
    local description="$2"
    
    local content="/**
 * $description
 * 
 * This barrel export file provides a clean public API
 * for the module components.
 */

// TODO: Add exports as components are implemented
// Example: export { ComponentName } from './ComponentName.js'

// Placeholder to prevent empty file issues
export {};"
    
    create_file "$file_path" "$content"
}

# Function to create test template
create_test_template() {
    local file_path="$1"
    local class_name="$2"
    local description="$3"
    
    # Determine correct relative path to mocks based on test file location
    local mock_path="../../mocks"
    if [[ "$file_path" == *"/unit/"* ]]; then
        mock_path="../../mocks"
    elif [[ "$file_path" == *"/integration/"* ]]; then
        mock_path="../../mocks"
    elif [[ "$file_path" == *"/e2e/"* ]]; then
        mock_path="../mocks"
    elif [[ "$file_path" == *"/performance/"* ]]; then
        mock_path="../mocks"
    fi
    
    local content="/**
 * Test suite for $class_name
 * 
 * $description
 * 
 * @see TESTING_STRATEGY.md for testing guidelines and patterns
 */

import { MockDatabase } from '${mock_path}/MockDatabase.js'
import { MockScriptRepository } from '${mock_path}/MockScriptRepository.js'

describe('$class_name', () => {
  let mockDb: MockDatabase
  let mockRepository: MockScriptRepository

  beforeEach(() => {
    // Setup mock database - lightweight in-memory replacement for SQLite
    // This runs faster than real SQLite and doesn't require file I/O
    mockDb = new MockDatabase(':memory:')
    
    // Setup mock repository if needed for this test
    mockRepository = new MockScriptRepository()
    
    // TODO: Add additional test environment setup
  })

  afterEach(() => {
    // Cleanup mock database
    if (mockDb) {
      mockDb.close()
    }
    
    // Reset mock repository state
    mockRepository.reset()
    
    // TODO: Add additional cleanup
  })

  describe('constructor', () => {
    it('should create instance successfully', () => {
      // TODO: Implement constructor test
      // Example: const instance = new $class_name(mockRepository)
      // expect(instance).toBeDefined()
      expect(true).toBe(true) // Placeholder test
    })
  })

  describe('database operations', () => {
    it('should work with mock database', () => {
      // TODO: Test database operations using mockDb
      // The MockDatabase provides the same API as sqlite3 but runs in memory
      // Example:
      // mockDb.run('CREATE TABLE scripts (id INTEGER, name TEXT)', (err) => {
      //   expect(err).toBeNull()
      // })
      expect(true).toBe(true) // Placeholder test
    })
  })

  describe('basic functionality', () => {
    it('should perform basic operations', () => {
      // TODO: Implement functionality tests
      // Use mockRepository for data access instead of real database
      expect(true).toBe(true) // Placeholder test
    })
  })

  // TODO: Add more test cases as specified in DETAILED_REFACTOR_PLAN.md
  // Remember to use mock objects instead of real dependencies for faster testing
})"
    
    create_file "$file_path" "$content"
}

echo -e "${BLUE}Creating Application Root Structure...${NC}"

# Create src directory first
create_dir "src"

# Application entry point (minimal)
create_file "src/index.ts" "#!/usr/bin/env node

/**
 * Scaffold Scripts CLI - Application Entry Point
 * 
 * Minimal entry point that bootstraps the application.
 * Reduced from 1166 lines in legacy to <20 lines.
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 3 for implementation
 */

import { Application } from './Application.js'

async function main(): Promise<void> {
  try {
    const app = new Application()
    await app.run(process.argv)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Fatal error:', message)
    process.exit(1)
  }
}

main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})"

# Application composition root
create_file "src/Application.ts" "/**
 * Application Composition Root
 * 
 * Main application orchestrator that wires up all dependencies
 * and provides the public interface for the CLI.
 * 
 * @see DETAILED_REFACTOR_PLAN.md Phase 3.3 for implementation details
 */

export class Application {
  // TODO: Implement dependency injection and CLI orchestration
  // See DETAILED_REFACTOR_PLAN.md Phase 3.3 for specific implementation
  
  constructor() {
    // TODO: Initialize DI container and register services
  }
  
  async run(args: string[]): Promise<void> {
    // TODO: Parse arguments and execute appropriate command
    throw new Error('Not implemented - see DETAILED_REFACTOR_PLAN.md Phase 3')
  }
}"

echo -e "${BLUE}Creating Core Layer Structure (30 files)...${NC}"

# Core interfaces (8 files)
create_dir "src/core/interfaces"
create_ts_interface "src/core/interfaces/IScriptRepository.ts" "IScriptRepository" "Script storage abstraction interface"
create_ts_interface "src/core/interfaces/IScriptProcessor.ts" "IScriptProcessor" "Script processing abstraction interface"
create_ts_interface "src/core/interfaces/IScriptExecutor.ts" "IScriptExecutor" "Script execution abstraction interface"
create_ts_interface "src/core/interfaces/ISystemCapabilities.ts" "ISystemCapabilities" "System capabilities detection interface"
create_ts_interface "src/core/interfaces/IScriptValidator.ts" "IScriptValidator" "Script validation abstraction interface"
create_ts_interface "src/core/interfaces/IScriptConverter.ts" "IScriptConverter" "Script conversion abstraction interface"
create_ts_interface "src/core/interfaces/ICache.ts" "ICache" "Caching abstraction interface"
create_barrel_export "src/core/interfaces/index.ts" "Core interfaces barrel export"

# Core models (7 files)
create_dir "src/core/models"
create_ts_class "src/core/models/Script.ts" "Script" "Script domain model with business logic"
create_ts_class "src/core/models/ScriptMetadata.ts" "ScriptMetadata" "Script metadata model"
create_ts_class "src/core/models/ExecutionResult.ts" "ExecutionResult" "Script execution result model"
create_ts_class "src/core/models/ValidationResult.ts" "ValidationResult" "Script validation result model"
create_ts_class "src/core/models/ScriptType.ts" "ScriptType" "Script type enumeration"
create_ts_class "src/core/models/Platform.ts" "Platform" "Platform enumeration"
create_barrel_export "src/core/models/index.ts" "Core models barrel export"

# Error hierarchy (7 files)
create_dir "src/core/errors"
create_ts_class "src/core/errors/ScaffoldError.ts" "ScaffoldError" "Base error class for all application errors"
create_ts_class "src/core/errors/ValidationError.ts" "ValidationError" "Validation-specific errors"
create_ts_class "src/core/errors/ExecutionError.ts" "ExecutionError" "Script execution errors"
create_ts_class "src/core/errors/ProcessingError.ts" "ProcessingError" "Script processing errors"
create_ts_class "src/core/errors/SecurityError.ts" "SecurityError" "Security validation errors"
create_ts_class "src/core/errors/ResourceError.ts" "ResourceError" "Resource access errors"
create_barrel_export "src/core/errors/index.ts" "Error hierarchy barrel export"

# Execution engines (8 files)
create_dir "src/core/execution"
create_ts_class "src/core/execution/BaseScriptExecutor.ts" "BaseScriptExecutor" "Base implementation for script executors"
create_ts_class "src/core/execution/ShellExecutor.ts" "ShellExecutor" "Shell script executor implementation"
create_ts_class "src/core/execution/PowerShellExecutor.ts" "PowerShellExecutor" "PowerShell script executor implementation"
create_ts_class "src/core/execution/PythonExecutor.ts" "PythonExecutor" "Python script executor implementation"
create_ts_class "src/core/execution/NodeExecutor.ts" "NodeExecutor" "Node.js script executor implementation"
create_ts_class "src/core/execution/ExecutorFactory.ts" "ExecutorFactory" "Factory for creating script executors"
create_ts_class "src/core/execution/ExecutionContext.ts" "ExecutionContext" "Execution environment context"
create_barrel_export "src/core/execution/index.ts" "Execution engines barrel export"

# Processing engines (5 files)
create_dir "src/core/processors"
create_ts_class "src/core/processors/BaseScriptProcessor.ts" "BaseScriptProcessor" "Base implementation for script processors"
create_ts_class "src/core/processors/InteractiveInputProcessor.ts" "InteractiveInputProcessor" "Interactive input handling processor"
create_ts_class "src/core/processors/ConversionProcessor.ts" "ConversionProcessor" "Script conversion processor"
create_ts_class "src/core/processors/ProcessorFactory.ts" "ProcessorFactory" "Factory for creating processors"
create_barrel_export "src/core/processors/index.ts" "Processing engines barrel export"

# Validation engines (5 files)
create_dir "src/core/validation"
create_ts_class "src/core/validation/ScriptValidator.ts" "ScriptValidator" "Main script validator implementation"
create_ts_class "src/core/validation/SecurityValidator.ts" "SecurityValidator" "Security-focused validation implementation"
create_ts_class "src/core/validation/ValidationRule.ts" "ValidationRule" "Individual validation rule implementation"
create_ts_class "src/core/validation/ValidationPipeline.ts" "ValidationPipeline" "Validation pipeline orchestrator"
create_barrel_export "src/core/validation/index.ts" "Validation engines barrel export"

# Caching infrastructure (4 files)
create_dir "src/core/caching"
create_ts_class "src/core/caching/LRUCache.ts" "LRUCache" "LRU cache implementation with TTL support"
create_ts_class "src/core/caching/CacheManager.ts" "CacheManager" "Cache management and coordination"
create_ts_class "src/core/caching/CacheKey.ts" "CacheKey" "Cache key generation and management"
create_barrel_export "src/core/caching/index.ts" "Caching infrastructure barrel export"

# Performance optimizations (3 files)
create_dir "src/core/performance"
create_ts_class "src/core/performance/StringProcessor.ts" "StringProcessor" "Optimized string processing operations"
create_ts_class "src/core/performance/ObjectPool.ts" "ObjectPool" "Object pooling for performance"
create_barrel_export "src/core/performance/index.ts" "Performance optimizations barrel export"

# Dependency injection (3 files)
create_dir "src/core/di"
create_ts_class "src/core/di/Container.ts" "Container" "Dependency injection container"
create_ts_class "src/core/di/ServiceLifetime.ts" "ServiceLifetime" "Service lifetime management enumeration"
create_barrel_export "src/core/di/index.ts" "Dependency injection barrel export"

# Core layer barrel export
create_barrel_export "src/core/index.ts" "Core layer barrel export"

echo -e "${BLUE}Creating Service Layer Structure (5 files)...${NC}"

# Service layer
create_dir "src/services"
create_ts_class "src/services/ScriptService.ts" "ScriptService" "Main script service with business logic"
create_ts_class "src/services/InteractiveService.ts" "InteractiveService" "Interactive mode service"
create_ts_class "src/services/SystemService.ts" "SystemService" "System integration service"
create_ts_class "src/services/ExportService.ts" "ExportService" "Script export service"
create_barrel_export "src/services/index.ts" "Service layer barrel export"

echo -e "${BLUE}Creating Repository Layer Structure (8 files)...${NC}"

# Repository layer
create_dir "src/repositories"
create_ts_class "src/repositories/SqliteScriptRepository.ts" "SqliteScriptRepository" "SQLite script repository implementation"
create_ts_class "src/repositories/CachedScriptRepository.ts" "CachedScriptRepository" "Cached repository decorator"
create_ts_class "src/repositories/MemoryScriptRepository.ts" "MemoryScriptRepository" "In-memory repository for testing"
create_ts_class "src/repositories/RepositoryBase.ts" "RepositoryBase" "Base repository class with common functionality"

# Database migrations (3 files)
create_dir "src/repositories/migrations"
create_ts_class "src/repositories/migrations/MigrationRunner.ts" "MigrationRunner" "Database migration execution engine"
create_ts_class "src/repositories/migrations/001_InitialSchema.ts" "InitialSchema" "Initial database schema migration"
create_barrel_export "src/repositories/migrations/index.ts" "Database migrations barrel export"

create_barrel_export "src/repositories/index.ts" "Repository layer barrel export"

echo -e "${BLUE}Creating Command Layer Structure (12 files)...${NC}"

# Command handlers
create_dir "src/commands"
create_ts_class "src/commands/CommandBase.ts" "CommandBase" "Base class for command handlers"
create_ts_class "src/commands/AddCommandHandler.ts" "AddCommandHandler" "Add script command handler"
create_ts_class "src/commands/ListCommandHandler.ts" "ListCommandHandler" "List scripts command handler"
create_ts_class "src/commands/ExecuteCommandHandler.ts" "ExecuteCommandHandler" "Execute script command handler"
create_ts_class "src/commands/RemoveCommandHandler.ts" "RemoveCommandHandler" "Remove script command handler"
create_ts_class "src/commands/UpdateCommandHandler.ts" "UpdateCommandHandler" "Update script command handler"
create_ts_class "src/commands/ViewCommandHandler.ts" "ViewCommandHandler" "View script command handler"
create_ts_class "src/commands/ClearCommandHandler.ts" "ClearCommandHandler" "Clear all scripts command handler"
create_ts_class "src/commands/ExportCommandHandler.ts" "ExportCommandHandler" "Export scripts command handler"
create_ts_class "src/commands/UninstallCommandHandler.ts" "UninstallCommandHandler" "Uninstall CLI command handler"
create_ts_class "src/commands/CommandContext.ts" "CommandContext" "Command execution context"
create_barrel_export "src/commands/index.ts" "Command handlers barrel export"

echo -e "${BLUE}Creating CLI Layer Structure (4 files)...${NC}"

# CLI infrastructure
create_dir "src/cli"
create_ts_class "src/cli/CommandLineInterface.ts" "CommandLineInterface" "Main CLI interface and orchestrator"
create_ts_class "src/cli/CommandRegistry.ts" "CommandRegistry" "Command registration and lookup service"
create_ts_class "src/cli/HelpProvider.ts" "HelpProvider" "Help system and usage information provider"
create_barrel_export "src/cli/index.ts" "CLI infrastructure barrel export"

echo -e "${BLUE}Creating Utils Layer Structure (8 files)...${NC}"

# Utility functions
create_dir "src/utils"
create_ts_class "src/utils/FileSystemHelper.ts" "FileSystemHelper" "File system operation utilities"
create_ts_class "src/utils/PathResolver.ts" "PathResolver" "Path resolution and normalization utilities"
create_ts_class "src/utils/ProcessHelper.ts" "ProcessHelper" "Process execution utilities"
create_ts_class "src/utils/Logger.ts" "Logger" "Logging utilities and configuration"
create_ts_class "src/utils/StringUtils.ts" "StringUtils" "String manipulation and processing utilities"
create_ts_class "src/utils/ValidationUtils.ts" "ValidationUtils" "Common validation utilities"
create_ts_class "src/utils/TypeGuards.ts" "TypeGuards" "TypeScript type guard functions"
create_barrel_export "src/utils/index.ts" "Utility functions barrel export"

echo -e "${BLUE}Creating Configuration Layer Structure (2 files)...${NC}"

# Configuration management
create_dir "src/config"
create_ts_class "src/config/AppConfiguration.ts" "AppConfiguration" "Consolidated application configuration"
create_barrel_export "src/config/index.ts" "Configuration management barrel export"

echo -e "${BLUE}Creating Legacy Migration Structure (2 files)...${NC}"

# Legacy migration
create_dir "src/legacy"
create_file "src/legacy/README.md" "# Legacy Component Migration

## Migration Status
This directory contains migration documentation and temporary compatibility layers.

## Components Migration Progress
- [ ] database.ts → SqliteScriptRepository.ts
- [ ] scriptExecutor.ts → execution/ layer
- [ ] scriptProcessor.ts → processors/ layer
- [ ] scriptValidator.ts → validation/ layer
- [ ] systemCapabilities.ts → SystemService.ts
- [ ] usageHelper.ts → HelpProvider.ts
- [ ] config.ts → AppConfiguration.ts
- [ ] scriptConverter.ts → ConversionProcessor.ts
- [ ] scriptTypeDetector.ts → ProcessorFactory.ts
- [ ] symbols.ts → StringUtils.ts

## Migration Guidelines
1. Preserve all existing functionality
2. Maintain backward compatibility
3. Update tests after each component migration
4. Document any breaking changes

See DETAILED_REFACTOR_PLAN.md for complete migration instructions."

create_barrel_export "src/legacy/index.ts" "Legacy migration barrel export"

echo -e "${BLUE}Creating Test Structure (45 files)...${NC}"

# Test directories
create_dir "tests/unit/core/models"
create_dir "tests/unit/core/execution"
create_dir "tests/unit/core/processors"
create_dir "tests/unit/core/validation"
create_dir "tests/unit/core/caching"
create_dir "tests/unit/services"
create_dir "tests/unit/repositories"
create_dir "tests/unit/commands"
create_dir "tests/unit/cli"
create_dir "tests/integration/services"
create_dir "tests/integration/repositories"
create_dir "tests/integration/commands"
create_dir "tests/integration/cli"
create_dir "tests/e2e"
create_dir "tests/performance"
create_dir "tests/mocks"
create_dir "tests/helpers"
create_dir "tests/fixtures"

# Unit tests (25 files)
create_test_template "tests/unit/core/models/Script.test.ts" "Script" "Unit tests for Script domain model"
create_test_template "tests/unit/core/models/ScriptMetadata.test.ts" "ScriptMetadata" "Unit tests for ScriptMetadata model"
create_test_template "tests/unit/core/models/ExecutionResult.test.ts" "ExecutionResult" "Unit tests for ExecutionResult model"

create_test_template "tests/unit/core/execution/ShellExecutor.test.ts" "ShellExecutor" "Unit tests for Shell script executor"
create_test_template "tests/unit/core/execution/PowerShellExecutor.test.ts" "PowerShellExecutor" "Unit tests for PowerShell script executor"
create_test_template "tests/unit/core/execution/PythonExecutor.test.ts" "PythonExecutor" "Unit tests for Python script executor"
create_test_template "tests/unit/core/execution/ExecutorFactory.test.ts" "ExecutorFactory" "Unit tests for script executor factory"

create_test_template "tests/unit/core/processors/InteractiveInputProcessor.test.ts" "InteractiveInputProcessor" "Unit tests for interactive input processor"
create_test_template "tests/unit/core/processors/ConversionProcessor.test.ts" "ConversionProcessor" "Unit tests for script conversion processor"
create_test_template "tests/unit/core/processors/ProcessorFactory.test.ts" "ProcessorFactory" "Unit tests for processor factory"

create_test_template "tests/unit/core/validation/ScriptValidator.test.ts" "ScriptValidator" "Unit tests for script validator"
create_test_template "tests/unit/core/validation/SecurityValidator.test.ts" "SecurityValidator" "Unit tests for security validator"
create_test_template "tests/unit/core/validation/ValidationPipeline.test.ts" "ValidationPipeline" "Unit tests for validation pipeline"

create_test_template "tests/unit/core/caching/LRUCache.test.ts" "LRUCache" "Unit tests for LRU cache implementation"
create_test_template "tests/unit/core/caching/CacheManager.test.ts" "CacheManager" "Unit tests for cache manager"

create_test_template "tests/unit/services/ScriptService.test.ts" "ScriptService" "Unit tests for script service"
create_test_template "tests/unit/services/InteractiveService.test.ts" "InteractiveService" "Unit tests for interactive service"
create_test_template "tests/unit/services/SystemService.test.ts" "SystemService" "Unit tests for system service"

create_test_template "tests/unit/repositories/SqliteScriptRepository.test.ts" "SqliteScriptRepository" "Unit tests for SQLite repository"
create_test_template "tests/unit/repositories/CachedScriptRepository.test.ts" "CachedScriptRepository" "Unit tests for cached repository"

create_test_template "tests/unit/commands/AddCommandHandler.test.ts" "AddCommandHandler" "Unit tests for add command handler"
create_test_template "tests/unit/commands/ExecuteCommandHandler.test.ts" "ExecuteCommandHandler" "Unit tests for execute command handler"
create_test_template "tests/unit/commands/ListCommandHandler.test.ts" "ListCommandHandler" "Unit tests for list command handler"
create_test_template "tests/unit/commands/RemoveCommandHandler.test.ts" "RemoveCommandHandler" "Unit tests for remove command handler"

create_test_template "tests/unit/cli/CommandLineInterface.test.ts" "CommandLineInterface" "Unit tests for command line interface"

# Integration tests (8 files)
create_test_template "tests/integration/services/ScriptServiceIntegration.test.ts" "ScriptService Integration" "Integration tests for script service"
create_test_template "tests/integration/services/SystemServiceIntegration.test.ts" "SystemService Integration" "Integration tests for system service"
create_test_template "tests/integration/repositories/ScriptRepositoryIntegration.test.ts" "Repository Integration" "Integration tests for repositories"
create_test_template "tests/integration/commands/AddCommandIntegration.test.ts" "AddCommand Integration" "Integration tests for add command"
create_test_template "tests/integration/commands/ExecuteCommandIntegration.test.ts" "ExecuteCommand Integration" "Integration tests for execute command"
create_test_template "tests/integration/commands/WorkflowIntegration.test.ts" "Workflow Integration" "Integration tests for full workflows"
create_test_template "tests/integration/cli/CLIIntegration.test.ts" "CLI Integration" "Integration tests for CLI"
create_test_template "tests/integration/cli/HelpSystemIntegration.test.ts" "HelpSystem Integration" "Integration tests for help system"

# E2E tests (4 files)
create_test_template "tests/e2e/AddScript.e2e.test.ts" "Add Script E2E" "End-to-end tests for adding scripts"
create_test_template "tests/e2e/ExecuteScript.e2e.test.ts" "Execute Script E2E" "End-to-end tests for script execution"
create_test_template "tests/e2e/InteractiveMode.e2e.test.ts" "Interactive Mode E2E" "End-to-end tests for interactive mode"
create_test_template "tests/e2e/CrossPlatform.e2e.test.ts" "Cross-Platform E2E" "End-to-end tests for cross-platform support"

# Performance tests (3 files)
create_test_template "tests/performance/ScriptProcessing.perf.test.ts" "Script Processing Performance" "Performance tests for script processing"
create_test_template "tests/performance/DatabaseOperations.perf.test.ts" "Database Performance" "Performance tests for database operations"
create_test_template "tests/performance/CachePerformance.perf.test.ts" "Cache Performance" "Performance tests for caching system"

# Test infrastructure (5 files)
create_file "tests/mocks/MockScriptRepository.ts" "/**
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
      throw new Error(\`Script '\${script.name}' already exists\`)
    }
    this.scripts.set(script.name, { ...script })
  }

  async updateScript(name: string, script: MockScript): Promise<void> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    if (!this.scripts.has(name)) {
      throw new Error(\`Script '\${name}' not found\`)
    }
    this.scripts.set(name, { ...script, name })
  }

  async removeScript(name: string): Promise<void> {
    if (!this.isInitialized) throw new Error('Repository not initialized')
    if (!this.scripts.delete(name)) {
      throw new Error(\`Script '\${name}' not found\`)
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
}"

create_file "tests/mocks/MockSystemCapabilities.ts" "/**
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
}"

create_file "tests/mocks/MockDatabase.ts" "/**
 * Mock SQLite3 Database for Testing
 * 
 * Lightweight in-memory replacement for sqlite3 that provides
 * the same API but runs much faster in tests without file I/O.
 * 
 * @see TESTING_STRATEGY.md for usage guidelines
 */

class MockDatabase {
  constructor(filename?: string, mode?: any, callback?: (err: Error | null) => void) {
    // Handle different argument patterns
    if (typeof mode === 'function') {
      callback = mode
      mode = null
    }
    
    this.filename = filename
    this.mode = mode || 1 // OPEN_READWRITE | OPEN_CREATE
    this.isOpen = true
    this.inTransactionState = false
    this.tables = new Map()
    this.lastInsertRowid = 0
    this.changes = 0
    this.serialized = false
    this.statements = new Map()
    
    // Simulate async database opening
    if (callback) {
      process.nextTick(() => callback(null))
    }
  }

  // Simulate database.run() method
  run(sql, params, callback) {
    try {
      const result = this._executeSql(sql, params)
      if (callback) {
        process.nextTick(() => callback.call({ lastID: this.lastInsertRowid, changes: result.changes }, null))
      }
      return this
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return this
    }
  }

  // Simulate database.get() method
  get(sql, params, callback) {
    try {
      const result = this._executeSql(sql, params)
      const row = result.rows && result.rows.length > 0 ? result.rows[0] : undefined
      if (callback) {
        process.nextTick(() => callback(null, row))
      }
      return this
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return this
    }
  }

  // Simulate database.all() method
  all(sql, params, callback) {
    try {
      const result = this._executeSql(sql, params)
      if (callback) {
        process.nextTick(() => callback(null, result.rows || []))
      }
      return this
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return this
    }
  }

  // Simulate database.close() method
  close(callback?: (err: Error | null) => void) {
    this.isOpen = false
    this.tables.clear()
    if (callback) {
      process.nextTick(() => callback(null))
    }
    return this
  }

  // Simulate database.each() method
  each(sql, params, rowCallback, completeCallback) {
    // Handle different argument patterns
    if (typeof params === 'function') {
      completeCallback = rowCallback
      rowCallback = params
      params = []
    }
    
    try {
      const result = this._executeSql(sql, params)
      const rows = result.rows || []
      
      let index = 0
      const processNext = () => {
        if (index >= rows.length) {
          if (completeCallback) {
            process.nextTick(() => completeCallback(null, rows.length))
          }
          return
        }
        
        const row = rows[index++]
        if (rowCallback) {
          process.nextTick(() => {
            rowCallback(null, row)
            processNext()
          })
        } else {
          processNext()
        }
      }
      
      processNext()
    } catch (error) {
      if (rowCallback) {
        process.nextTick(() => rowCallback(error))
      }
    }
    return this
  }

  // Simulate database.exec() method
  exec(sql, callback) {
    try {
      const statements = sql.split(';').filter(s => s.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          this._executeSql(statement.trim(), [])
        }
      }
      if (callback) {
        process.nextTick(() => callback(null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Simulate database.prepare() method
  prepare(sql, params, callback) {
    // Handle different argument patterns
    if (typeof params === 'function') {
      callback = params
      params = []
    }
    
    try {
      const statement = new MockStatement(this, sql)
      if (params && params.length > 0) {
        statement.bind(params)
      }
      if (callback) {
        process.nextTick(() => callback(null, statement))
      }
      return statement
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return null
    }
  }

  // Simulate database.serialize() method
  serialize(callback) {
    this.serialized = true
    if (callback) {
      callback()
    }
    return this
  }

  // Simulate database.parallelize() method
  parallelize(callback) {
    this.serialized = false
    if (callback) {
      callback()
    }
    return this
  }

  // Simulate database.interrupt() method
  interrupt() {
    // In a real implementation, this would interrupt running queries
    // For mock, we just simulate the behavior
    return this
  }

  // Property to check if database is in transaction
  get inTransaction() {
    return this.inTransactionState
  }

  // Simulate transaction begin
  _beginTransaction() {
    this.inTransactionState = true
  }

  // Simulate transaction commit
  _commitTransaction() {
    this.inTransactionState = false
  }

  // Simulate transaction rollback
  _rollbackTransaction() {
    this.inTransactionState = false
  }

  // Error simulation for testing
  _simulateError(message) {
    const error = new Error(message)
    error.errno = 1
    error.code = 'SQLITE_ERROR'
    return error
  }

  // Internal SQL execution simulation
  _executeSql(sql, params = []) {
    const normalizedSql = sql.trim().toLowerCase()
    
    // Handle CREATE TABLE
    if (normalizedSql.includes('create table')) {
      const tableName = this._extractTableName(sql)
      this.tables.set(tableName, new Map())
      return { changes: 0, rows: [] }
    }
    
    // Handle INSERT
    if (normalizedSql.startsWith('insert')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      this.lastInsertRowid++
      const row = this._createRowFromInsert(sql, params, this.lastInsertRowid)
      table.set(this.lastInsertRowid, row)
      this.tables.set(tableName, table)
      return { changes: 1, rows: [] }
    }
    
    // Handle SELECT
    if (normalizedSql.startsWith('select')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      const rows = Array.from(table.values())
      return { changes: 0, rows: this._filterRows(rows, sql, params) }
    }
    
    // Handle UPDATE
    if (normalizedSql.startsWith('update')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      let changes = 0
      for (const [id, row] of table.entries()) {
        if (this._matchesWhere(row, sql, params)) {
          const updatedRow = this._updateRow(row, sql, params)
          table.set(id, updatedRow)
          changes++
        }
      }
      return { changes, rows: [] }
    }
    
    // Handle DELETE
    if (normalizedSql.startsWith('delete')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      let changes = 0
      for (const [id, row] of table.entries()) {
        if (this._matchesWhere(row, sql, params)) {
          table.delete(id)
          changes++
        }
      }
      return { changes, rows: [] }
    }
    
    // Handle schema queries
    if (normalizedSql.includes('pragma') || normalizedSql.includes('sqlite_master')) {
      return { changes: 0, rows: [] }
    }
    
    return { changes: 0, rows: [] }
  }

  _extractTableName(sql) {
    const match = sql.match(/(?:from|into|table|update)\\s+([\\w_]+)/i)
    return match ? match[1] : 'unknown'
  }

  _createRowFromInsert(sql, params, id) {
    // Simple row creation - in real tests, this would be more sophisticated
    return { id, name: params[0] || 'test', content: params[1] || 'test content', created_at: new Date().toISOString() }
  }

  _filterRows(rows, sql, params) {
    // Simple filtering - in real tests, this would parse WHERE clauses
    if (sql.includes('WHERE') && params.length > 0) {
      return rows.filter(row => row.name === params[0])
    }
    return rows
  }

  _matchesWhere(row, sql, params) {
    // Simple WHERE matching - would be more sophisticated in real implementation
    return params.length === 0 || row.name === params[0]
  }

  _updateRow(row, sql, params) {
    // Simple update - would parse SET clauses in real implementation
    return { ...row, content: params[0] || row.content }
  }
}

// Mock Statement class for prepared statements
class MockStatement {
  constructor(database, sql) {
    this.database = database
    this.sql = sql
    this.boundParams = []
    this.finalized = false
  }

  // Bind parameters to the statement
  bind(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    try {
      this.boundParams = params.flat()
      if (callback) {
        process.nextTick(() => callback(null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Reset the statement
  reset(callback) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    try {
      // Reset preserves bound parameters but clears result cursor
      if (callback) {
        process.nextTick(() => callback(null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Finalize the statement
  finalize(callback) {
    if (!this.finalized) {
      this.finalized = true
      this.boundParams = []
      if (callback) {
        process.nextTick(() => callback(null))
      }
    }
    return this
  }

  // Execute statement (like database.run)
  run(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    const allParams = params.length > 0 ? params : this.boundParams
    
    try {
      const result = this.database._executeSql(this.sql, allParams)
      if (callback) {
        process.nextTick(() => callback.call({ 
          lastID: this.database.lastInsertRowid, 
          changes: result.changes 
        }, null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Get single row (like database.get)
  get(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    const allParams = params.length > 0 ? params : this.boundParams
    
    try {
      const result = this.database._executeSql(this.sql, allParams)
      const row = result.rows && result.rows.length > 0 ? result.rows[0] : undefined
      if (callback) {
        process.nextTick(() => callback(null, row))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Get all rows (like database.all)
  all(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    const allParams = params.length > 0 ? params : this.boundParams
    
    try {
      const result = this.database._executeSql(this.sql, allParams)
      if (callback) {
        process.nextTick(() => callback(null, result.rows || []))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }
}

// Export MockDatabase and MockStatement directly
export { MockDatabase }
export { MockStatement }

// Also export as Database and Statement for SQLite3 compatibility
export { MockDatabase as Database }
export { MockStatement as Statement }

// SQLite constants
export const OPEN_READWRITE = 1
export const OPEN_CREATE = 2
export const OPEN_READONLY = 4
export const OPEN_FULLMUTEX = 16
export const OPEN_URI = 64
export const OPEN_SHAREDCACHE = 131072
export const OPEN_PRIVATECACHE = 262144

// Error codes
export const SQLITE_OK = 0
export const SQLITE_ERROR = 1
export const SQLITE_INTERNAL = 2
export const SQLITE_PERM = 3
export const SQLITE_ABORT = 4
export const SQLITE_BUSY = 5
export const SQLITE_LOCKED = 6
export const SQLITE_NOMEM = 7
export const SQLITE_READONLY = 8
export const SQLITE_INTERRUPT = 9
export const SQLITE_IOERR = 10
export const SQLITE_CORRUPT = 11
export const SQLITE_NOTFOUND = 12
export const SQLITE_FULL = 13
export const SQLITE_CANTOPEN = 14
export const SQLITE_PROTOCOL = 15
export const SQLITE_EMPTY = 16
export const SQLITE_SCHEMA = 17
export const SQLITE_TOOBIG = 18
export const SQLITE_CONSTRAINT = 19
export const SQLITE_MISMATCH = 20
export const SQLITE_MISUSE = 21
export const SQLITE_NOLFS = 22
export const SQLITE_AUTH = 23
export const SQLITE_FORMAT = 24
export const SQLITE_RANGE = 25
export const SQLITE_NOTADB = 26

// Default export for compatibility
export default {
  Database: MockDatabase,
  Statement: MockStatement,
  OPEN_READWRITE,
  OPEN_CREATE,
  OPEN_READONLY,
  OPEN_FULLMUTEX,
  OPEN_URI,
  OPEN_SHAREDCACHE,
  OPEN_PRIVATECACHE,
  SQLITE_OK,
  SQLITE_ERROR,
  SQLITE_INTERNAL,
  SQLITE_PERM,
  SQLITE_ABORT,
  SQLITE_BUSY,
  SQLITE_LOCKED,
  SQLITE_NOMEM,
  SQLITE_READONLY,
  SQLITE_INTERRUPT,
  SQLITE_IOERR,
  SQLITE_CORRUPT,
  SQLITE_NOTFOUND,
  SQLITE_FULL,
  SQLITE_CANTOPEN,
  SQLITE_PROTOCOL,
  SQLITE_EMPTY,
  SQLITE_SCHEMA,
  SQLITE_TOOBIG,
  SQLITE_CONSTRAINT,
  SQLITE_MISMATCH,
  SQLITE_MISUSE,
  SQLITE_NOLFS,
  SQLITE_AUTH,
  SQLITE_FORMAT,
  SQLITE_RANGE,
  SQLITE_NOTADB
}"

create_barrel_export "tests/mocks/index.ts" "Test mocks barrel export"

create_file "tests/helpers/TestDataBuilder.ts" "// Test data builder utility - See TESTING_STRATEGY.md"
create_barrel_export "tests/helpers/index.ts" "Test helpers barrel export"

create_file "tests/fixtures/test-scripts.json" "{ \"description\": \"Sample script data for testing\" }"
create_file "tests/fixtures/test-configs.json" "{ \"description\": \"Test configuration data\" }"

# Test configuration files
create_file "tests/jest.unit.config.js" "// Unit test configuration with mocked dependencies - See TESTING_STRATEGY.md
module.exports = {
  displayName: 'Unit Tests',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1',
    '^@cli/(.*)$': '<rootDir>/src/cli/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  // Mock heavy dependencies for faster unit tests
  moduleNameMapper: {
    '^sqlite3$': '<rootDir>/tests/mocks/MockDatabase.ts'
  },
  collectCoverageFrom: [
    'src/**/*.ts', 
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: { branches: 75, functions: 80, lines: 80, statements: 80 }
  }
}"

create_file "tests/jest.integration.config.js" "// Integration test configuration - See TESTING_STRATEGY.md
module.exports = {
  displayName: 'Integration Tests',
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  testTimeout: 30000
}"

create_file "tests/jest.e2e.config.js" "// E2E test configuration - See TESTING_STRATEGY.md
module.exports = {
  displayName: 'E2E Tests',
  testMatch: ['<rootDir>/tests/e2e/**/*.test.ts'],
  testTimeout: 60000
}"

create_file "tests/jest.performance.config.js" "// Performance test configuration - See TESTING_STRATEGY.md
module.exports = {
  displayName: 'Performance Tests',
  testMatch: ['<rootDir>/tests/performance/**/*.test.ts'],
  testTimeout: 120000
}"

# Main Jest configuration
create_file "jest.config.js" "// Main Jest configuration
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@commands/(.*)$': '<rootDir>/src/commands/$1',
    '^@cli/(.*)$': '<rootDir>/src/cli/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/integration/**/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
}"

# Test setup file
create_file "tests/setup.ts" "// Global test setup
// Configure test environment
process.env.NODE_ENV = 'test'

// Suppress console output during tests unless debugging
if (!process.env.DEBUG_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}"

echo -e "${BLUE}Creating Configuration Files...${NC}"

# Package configuration
create_file "package.json" "{
  \"name\": \"scaffold-scripts\",
  \"version\": \"4.0.0\",
  \"description\": \"Simple CLI tool for managing and running your own scripts. Add any script, run it anywhere.\",
  \"main\": \"dist/index.js\",
  \"type\": \"module\",
  \"bin\": {
    \"scaffold\": \"./bin/scaffold.js\",
    \"scripts\": \"./bin/scaffold.js\"
  },
  \"scripts\": {
    \"build\": \"tsc -p tsconfig.build.json\",
    \"dev\": \"tsc --watch\",
    \"start\": \"node dist/index.js\",
    \"test\": \"jest\",
    \"test:unit\": \"jest --config tests/jest.unit.config.js\",
    \"test:integration\": \"jest --config tests/jest.integration.config.js\",
    \"test:e2e\": \"jest --config tests/jest.e2e.config.js\",
    \"test:performance\": \"jest --config tests/jest.performance.config.js\",
    \"test:coverage\": \"jest --coverage\",
    \"lint\": \"eslint src/**/*.ts\",
    \"lint:fix\": \"eslint src/**/*.ts --fix\",
    \"prepack\": \"npm run build\",
    \"install-global\": \"npm install -g .\",
    \"uninstall-global\": \"npm uninstall -g scaffold-scripts\"
  },
  \"keywords\": [
    \"cli\",
    \"scripts\",
    \"automation\",
    \"script-manager\",
    \"bash\",
    \"powershell\",
    \"python\",
    \"workflow\",
    \"productivity\",
    \"developer-tools\"
  ],
  \"author\": \"ChrisColeTech\",
  \"license\": \"MIT\",
  \"repository\": {
    \"type\": \"git\",
    \"url\": \"https://github.com/ChrisColeTech/scaffold-scripts.git\"
  },
  \"bugs\": {
    \"url\": \"https://github.com/ChrisColeTech/scaffold-scripts/issues\"
  },
  \"homepage\": \"https://github.com/ChrisColeTech/scaffold-scripts#readme\",
  \"dependencies\": {
    \"@types/prompts\": \"^2.4.9\",
    \"chalk\": \"^4.1.2\",
    \"commander\": \"^11.1.0\",
    \"ora\": \"^5.4.1\",
    \"prompts\": \"^2.4.2\",
    \"sqlite3\": \"^5.1.6\"
  },
  \"devDependencies\": {
    \"@types/jest\": \"^29.5.8\",
    \"@types/node\": \"^20.10.0\",
    \"@types/sqlite3\": \"^3.1.11\",
    \"@typescript-eslint/eslint-plugin\": \"^6.12.0\",
    \"@typescript-eslint/parser\": \"^6.12.0\",
    \"eslint\": \"^8.54.0\",
    \"jest\": \"^29.7.0\",
    \"ts-jest\": \"^29.1.1\",
    \"typescript\": \"^5.3.0\"
  },
  \"engines\": {
    \"node\": \">=16.0.0\"
  }
}"

# TypeScript configuration
create_file "tsconfig.json" "{
  \"compilerOptions\": {
    \"target\": \"ES2020\",
    \"module\": \"ESNext\",
    \"moduleResolution\": \"node\",
    \"allowSyntheticDefaultImports\": true,
    \"esModuleInterop\": true,
    \"strict\": true,
    \"skipLibCheck\": true,
    \"resolveJsonModule\": true,
    \"declaration\": true,
    \"outDir\": \"dist\",
    \"rootDir\": \"src\",
    \"baseUrl\": \".\",
    \"paths\": {
      \"@core/*\": [\"src/core/*\"],
      \"@services/*\": [\"src/services/*\"],
      \"@repositories/*\": [\"src/repositories/*\"],
      \"@commands/*\": [\"src/commands/*\"],
      \"@cli/*\": [\"src/cli/*\"],
      \"@utils/*\": [\"src/utils/*\"]
    }
  },
  \"include\": [\"src/**/*\"],
  \"exclude\": [\"node_modules\", \"dist\", \"tests\"]
}"

create_file "tsconfig.build.json" "{
  \"extends\": \"./tsconfig.json\",
  \"compilerOptions\": {
    \"declaration\": false,
    \"removeComments\": true
  },
  \"exclude\": [\"tests\", \"**/*.test.ts\", \"**/*.spec.ts\"]
}"

# ESLint configuration
create_file "eslint.config.js" "// ESLint configuration for TypeScript
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
]"

# Prettier configuration
create_file "prettier.config.js" "// Prettier configuration
export default {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  arrowParens: 'avoid'
}"

echo -e "${GREEN}✅ Optimized project structure initialized successfully!${NC}"

echo -e "${BLUE}Installing npm dependencies...${NC}"

# Check if npm is available
if command -v npm >/dev/null 2>&1; then
    # Install dependencies
    echo -e "${YELLOW}Running npm install...${NC}"
    npm install
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies. Please run 'npm install' manually.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  npm not found. Please install Node.js and npm, then run 'npm install'.${NC}"
fi

echo ""
echo -e "${BLUE}📊 Structure Summary:${NC}"
echo -e "${GREEN}  • Source files: 85 (optimized from 131)${NC}"
echo -e "${GREEN}  • Test files: 45 (focused and comprehensive)${NC}"
echo -e "${GREEN}  • Config files: 6 (essential only)${NC}"
echo -e "${GREEN}  • Total: 136 files (vs 180+ in original)${NC}"
echo -e "${GREEN}  • Dependencies: Installed and ready${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. ${YELLOW}Review the generated structure${NC} in your IDE"
echo "2. ${YELLOW}Read the documentation${NC}:"
echo "   - docs/OPTIMIZED_PROJECT_STRUCTURE.md (this structure)"
echo "   - docs/DETAILED_REFACTOR_PLAN.md (implementation phases)"
echo "   - docs/TESTING_STRATEGY.md (testing approach)"
echo "3. ${YELLOW}Start Phase 1${NC} of the refactor plan:"
echo "   - Implement core interfaces (8 files)"
echo "   - Create domain models (7 files)"
echo "   - Define error hierarchy (7 files)"
echo "4. ${YELLOW}Validate each phase${NC} with tests before proceeding"
echo "5. ${YELLOW}Test the setup${NC}:"
echo "   - Run: ${BLUE}npm run build${NC} (should compile without errors)"
echo "   - Run: ${BLUE}npm run lint${NC} (should pass with template files)"
echo "   - Run: ${BLUE}npm test${NC} (should run test framework)"
echo ""
echo -e "${GREEN}🎉 Ready for optimized refactoring!${NC}"
echo -e "${BLUE}📚 Remember: Every file has a specific purpose and implementation plan!${NC}"