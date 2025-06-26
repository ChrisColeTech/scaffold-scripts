# Improved Script Storage Design

## Current Problems
1. **Single script storage**: Only sanitized original stored
2. **Runtime conversion**: Lossy, imperfect translations
3. **Platform compatibility**: Poor cross-platform support
4. **Script type detection**: Not used for storage decisions

## Proposed Solution: Multi-Script Storage

### Database Schema Enhancement
```sql
CREATE TABLE commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('frontend', 'backend', 'init')),
  name TEXT NOT NULL,
  
  -- Multiple script versions
  script_original TEXT NOT NULL,           -- Original script as uploaded
  script_windows TEXT,                     -- Windows/PowerShell version
  script_unix TEXT,                        -- Unix/Linux/macOS version
  script_cross_platform TEXT,             -- Platform-agnostic version
  
  -- Script metadata
  original_platform TEXT,                  -- Platform of original script
  script_type TEXT,                        -- shell, powershell, python, etc.
  
  platform TEXT NOT NULL DEFAULT 'all',
  alias TEXT,
  description TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  UNIQUE(type, name)
);
```

### Smart Script Processing

#### 1. **Upload Time Processing**
```typescript
async addCommand(scriptPath: string, options: any) {
  // 1. Read original script
  const originalScript = readFileSync(scriptPath, 'utf-8');
  
  // 2. Detect script type and platform
  const scriptType = this.detector.detectType(originalScript);
  const originalPlatform = this.detector.detectPlatform(originalScript);
  
  // 3. Generate cross-platform versions
  const versions = await this.generator.generateVersions(originalScript, scriptType);
  
  // 4. Store all versions
  await db.addCommand({
    script_original: originalScript,
    script_windows: versions.windows,
    script_unix: versions.unix, 
    script_cross_platform: versions.crossPlatform,
    original_platform: originalPlatform,
    script_type: scriptType.type
  });
}
```

#### 2. **Runtime Selection**
```typescript
async executeScript(command: ScaffoldCommand) {
  const currentPlatform = process.platform;
  
  // Select best script version for current platform
  let script: string;
  
  if (currentPlatform === 'win32' && command.script_windows) {
    script = command.script_windows;
  } else if (currentPlatform !== 'win32' && command.script_unix) {
    script = command.script_unix;
  } else if (command.script_cross_platform) {
    script = command.script_cross_platform;
  } else {
    script = command.script_original;
  }
  
  await this.executor.execute(script, command.script_type);
}
```

### Example Scenarios

#### Scenario 1: PowerShell Script on Unix
```powershell
# Original (Windows)
New-Item -ItemType Directory -Force -Path 'output'
Get-ChildItem -Path 'output'
```
**Generated Unix version:**
```bash
# Converted for Unix
mkdir -p output
ls output
```

#### Scenario 2: Shell Script on Windows  
```bash
# Original (Unix)
mkdir -p output
ls output
```
**Generated Windows version:**
```powershell
# Converted for Windows
New-Item -ItemType Directory -Force -Path 'output'
Get-ChildItem -Path 'output'
```

#### Scenario 3: Cross-Platform Script
```bash
# Cross-platform version (works everywhere)
# Create output directory
# List output directory contents
scaffold-mkdir output
scaffold-ls output
```

### Benefits
1. **Perfect Fidelity**: Original script preserved exactly
2. **Optimal Execution**: Best version selected per platform
3. **Graceful Degradation**: Falls back to original if no conversion
4. **Developer Choice**: Can upload platform-specific or cross-platform scripts
5. **Better UX**: `scaffold -v` shows all available versions

### Migration Strategy
1. Add new columns to existing database
2. Migrate existing scripts to new format
3. Generate missing platform versions
4. Update CLI to use new storage method

## Implementation Priority
1. ✅ **High**: Multi-script storage
2. ✅ **High**: Better platform detection  
3. ✅ **Medium**: Improved conversion algorithms
4. ✅ **Medium**: Version preference system
5. ✅ **Low**: Cross-platform script language