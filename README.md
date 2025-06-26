# Scaffold Scripts CLI

A production-ready CLI tool for managing and executing your own scaffold scripts with multi-script storage, cross-platform compatibility, and intelligent script conversion.

## 🚀 Quick Install

### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/scaffold-scripts/main/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/yourusername/scaffold-scripts/main/install.ps1 | iex
```

### Manual Installation
```bash
git clone https://github.com/yourusername/scaffold-scripts.git
cd scaffold-scripts
npm install
npm run build
npm install -g .
```

## ✨ Features

- 🗄️ **Multi-Script Storage**: Stores original, Windows, Unix, and cross-platform versions of your scripts
- 🔄 **Intelligent Conversion**: Automatic script conversion between Shell, PowerShell, Batch, Python, and Node.js
- 🎯 **Platform Detection**: Smart detection of script type and platform compatibility
- 🔒 **Production Security**: Comprehensive script validation and security scanning
- ⚡ **Smart Execution**: Uses best platform-specific version automatically
- 📋 **Clean Interface**: No bloated defaults - add your own scripts

## 📖 Usage

### Command Reference

| Command | Description |
|---------|-------------|
| **Main Options** |
| `-f, --frontend <name>` | Run frontend scaffold script |
| `-b, --backend <name>` | Run backend scaffold script |
| `-i, --init [name]` | Run init script (see "First or Default" logic below) |
| `-v, --view` | View script details instead of executing |
| **CRUD Operations** |
| `add <type> <name> <path>` (alias: `-a`) | Add new script |
| `update <type> <name> <path>` (alias: `-u`) | Update existing script |
| `remove <type> <name>` (alias: `-r`) | Remove script |
| `list [type]` (alias: `-l`) | List all scripts |
| **Add/Update Options** |
| `-p, --platform <platform>` | Target platform (all/windows/unix) |
| `--strict` | Use strict validation |
| `--no-validate` | Skip validation (dangerous) |
| **List Options** |
| `-t, --type <type>` | Filter by type (frontend/backend/init) |
| `-d, --detailed` | Show detailed information in list |

### Basic Scaffolding

```bash
# Frontend scaffolding (you add your own scripts)
scaffold -f my-react-script     # Run your custom React script
scaffold -v -f my-react-script  # View script details

# Backend scaffolding (you add your own scripts)  
scaffold -b my-api-script       # Run your custom API script
scaffold -v -b my-api-script    # View script details

# Initialization (you add your own scripts)
scaffold -i                     # Run using "First or Default" logic
scaffold -i my-setup           # Run named init script
scaffold -v -i my-setup        # View init script details
```

### "First or Default" Init Logic

When you run `scaffold -i` with no script name:

1. **No init scripts** → Shows helpful error with examples
2. **Only one init script** → Runs it automatically
3. **Multiple scripts + "default" exists** → Runs the "default" script  
4. **Multiple scripts + no "default"** → Shows list, asks you to specify

```bash
# Examples of the logic in action:
scaffold -i                         # No scripts: shows error
scaffold add init setup setup.sh    # Add first script
scaffold -i                         # One script: runs "setup" automatically

scaffold add init project proj.sh   # Add second script  
scaffold -i                         # Multiple, no default: shows list

scaffold add init default def.sh    # Add "default" script
scaffold -i                         # Multiple with default: runs "default"
```

### Managing Your Scripts

#### Add Your Scripts
```bash
# Add scripts using command or flag syntax
scaffold add frontend my-react /path/to/react-setup.sh
scaffold -a backend my-api /path/to/api-setup.js
scaffold -a init my-project /path/to/project-init.py

# With platform targeting
scaffold add frontend my-vue /path/to/vue-setup.sh -p unix
scaffold -a backend my-express /path/to/express-setup.js -p all
```

#### Update Your Scripts
```bash
# Update scripts using command or flag syntax
scaffold update frontend my-react /path/to/updated-react.sh
scaffold -u backend my-api /path/to/new-api.js
scaffold -u init my-project /path/to/improved-init.py

# With strict validation
scaffold update frontend my-vue /path/to/new-vue.sh --strict
```

#### Remove Scripts
```bash
# Remove scripts using command or flag syntax
scaffold remove frontend my-react
scaffold -r backend my-api
scaffold -r init my-project
```

#### List & View Scripts
```bash
# List all scripts (command or flag syntax)
scaffold list
scaffold -l

# List by type
scaffold list -t frontend
scaffold -l -t backend

# List with details
scaffold list -d
scaffold -l -d

# View specific script with all versions
scaffold -v -f my-react        # View frontend script
scaffold -v -b my-api          # View backend script  
scaffold -v -i my-project      # View init script
```

## 🛠️ Your Scripts

The CLI starts empty - **you add your own scripts**:

```bash
# Check available scripts
scaffold -l
# Output: "No commands available."

# Add your first script
scaffold add frontend my-setup ./my-frontend-setup.sh
# Now you have: scaffold -f my-setup
```

### Script Types Supported

| Type | Description | Example Use |
|------|-------------|-------------|
| **Frontend** | Client-side application setup | React, Vue, Angular, Svelte setup scripts |
| **Backend** | Server-side application setup | API, database, microservice setup scripts |
| **Init** | Project initialization | Git setup, CI/CD, workspace initialization |

## 🔧 Script Examples

### Shell Script Example (Unix/Linux/macOS)
```bash
#!/bin/bash
echo "Setting up my custom React project..."
npx create-react-app my-app --template typescript
cd my-app
npm install my-favorite-packages
mkdir -p src/components src/hooks
echo "My React setup complete!"
```

### PowerShell Script Example (Windows)
```powershell
# My custom API setup
Write-Host "Setting up my API..." -ForegroundColor Blue
dotnet new webapi -o MyApi
Set-Location MyApi
dotnet add package MyFavoritePackage
New-Item -ItemType Directory -Force -Path "Controllers","Services"
Write-Host "My API setup complete!" -ForegroundColor Green
```

### Python Script Example (Cross-platform)
```python
#!/usr/bin/env python3
import os
import subprocess

print("Setting up my Python project...")
os.makedirs("my_project/src", exist_ok=True)
os.makedirs("my_project/tests", exist_ok=True)

with open("my_project/requirements.txt", "w") as f:
    f.write("fastapi\nuvicorn\npydantic\n")

print("My Python project setup complete!")
```

### Node.js Script Example (Cross-platform)
```javascript
#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');

console.log('Setting up my Node.js project...');
execSync('npm init -y');
execSync('npm install express helmet cors');
fs.mkdirSync('src/routes', { recursive: true });
fs.writeFileSync('src/app.js', 'console.log("My app started");');
console.log('My Node.js setup complete!');
```

## 🔒 Security & Validation

### Automatic Validation
- **Dangerous command detection** (`rm -rf`, `del /s`, etc.)
- **Network access warnings** (`curl`, `wget`)
- **System modification alerts** (`sudo`, `runas`)
- **Path traversal prevention** (`../`, `..\\`)
- **Script sanitization** (control characters, excessive whitespace)

### Validation Modes
```bash
# Default validation (recommended)
scaffold -a frontend my-script /path/to/script.sh

# Strict validation (extra security)
scaffold -a frontend my-script /path/to/script.sh --strict

# Skip validation (use with caution)
scaffold -a frontend my-script /path/to/script.sh --no-validate
```

## 🌍 Cross-Platform Support

Your scripts are automatically converted for all platforms:

### Automatic Conversion

| Original (Shell) | Windows (PowerShell) | Cross-Platform |
|------------------|---------------------|----------------|
| `mkdir -p dir` | `New-Item -ItemType Directory -Force -Path "dir"` | `# Create directory: dir` |
| `touch file.txt` | `New-Item -ItemType File -Force -Path "file.txt"` | `# Create file: file.txt` |
| `echo "Hello"` | `Write-Output "Hello"` | `# Output: Hello` |
| `export VAR=value` | `$env:VAR="value"` | `# Set environment variable` |

### View All Versions
```bash
scaffold -v -f my-script
# Shows:
# 🔸 Original (unix, shell)
# 🔸 Windows Version (PowerShell converted)
# 🔸 Unix Version (optimized)
# 🔸 Cross-Platform Version (platform-agnostic)
# 🎯 Best for Current Platform (automatically selected)
```

## 📁 Database Storage

Your scripts are stored in `~/.scaffold-scripts/commands.db`:

```sql
CREATE TABLE commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK (type IN ('frontend', 'backend', 'init')),
  name TEXT NOT NULL,
  
  -- Multi-script storage
  script_original TEXT NOT NULL,
  script_windows TEXT,
  script_unix TEXT,
  script_cross_platform TEXT,
  
  -- Script metadata
  original_platform TEXT CHECK (original_platform IN ('windows', 'unix', 'cross-platform')),
  script_type TEXT CHECK (script_type IN ('shell', 'powershell', 'python', 'nodejs', 'batch', 'mixed')),
  
  platform TEXT DEFAULT 'all',
  alias TEXT,
  description TEXT,
  createdAt TEXT,
  updatedAt TEXT,
  UNIQUE(type, name)
);
```

## 🎯 Advanced Features

### Platform Compatibility Analysis
```bash
scaffold -v -b my-powershell-script
# Shows platform compatibility warnings:
# ⚠️  Platform Compatibility:
#   • PowerShell scripts may not be available on this platform
# 💡 Recommendations:
#   • Install PowerShell Core or use the converted Unix version
```

### Script Processing Pipeline
1. **Validation**: Security scanning and syntax checking
2. **Platform Detection**: Automatic detection of script type and origin
3. **Cross-Platform Generation**: Creates Windows, Unix, and agnostic versions
4. **Storage**: Saves all versions with metadata
5. **Execution**: Uses best version for current platform

## 🚚 Installation

### Manual Installation

```bash
# Clone repository
git clone https://github.com/yourusername/scaffold-scripts.git
cd scaffold-scripts

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

### Local Development

```bash
# Clone and install locally
git clone https://github.com/yourusername/scaffold-scripts.git
cd scaffold-scripts

# Use the local installer script
./install-local.sh
```

## 📋 Requirements

- **Node.js** 18+
- **npm** 9+
- Platform-specific tools based on your scripts:
  - Git (if your scripts use git)
  - .NET SDK (if your scripts use dotnet)
  - Python (if your scripts use python)
  - PowerShell Core (for cross-platform PowerShell)

## 🧪 Testing Your Scripts

### Test Script Addition
```bash
# Create a test script
echo 'echo "Hello World"' > test-script.sh

# Add it
scaffold -a init hello-test test-script.sh

# View it
scaffold -v -i hello-test

# Run it
scaffold -i hello-test

# Remove it
scaffold -r init hello-test
```

## 🗑️ Uninstallation

```bash
# Remove CLI
npm uninstall -g scaffold-scripts

# Remove your scripts and database
rm -rf ~/.scaffold-scripts        # Unix/macOS
Remove-Item -Recurse -Force ~/.scaffold-scripts      # Windows PowerShell
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://github.com/yourusername/scaffold-scripts)
- 🐛 [Issues](https://github.com/yourusername/scaffold-scripts/issues)
- 💬 [Discussions](https://github.com/yourusername/scaffold-scripts/discussions)

## 📚 Real-World Workflow

```bash
# Start with empty CLI
scaffold -l
# Output: "No commands available."

# Add your team's React setup
scaffold -a frontend team-react ./team-react-setup.sh

# Add your API boilerplate
scaffold -a backend team-api ./team-api-setup.js

# Add your project initialization
scaffold -a init team-project ./team-project-init.py

# Now your team can use them
scaffold -i team-project     # Initialize project
scaffold -f team-react       # Add frontend
scaffold -b team-api         # Add backend

# Share scripts by committing the database or exporting/importing individual scripts
```

**This is YOUR scaffold system - add the scripts YOU need.**