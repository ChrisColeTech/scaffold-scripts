# Scaffold Scripts

[![CI Status](https://github.com/ChrisColeTech/scaffold-scripts/workflows/Continuous%20Integration/badge.svg)](https://github.com/ChrisColeTech/scaffold-scripts/actions)
[![NPM Version](https://img.shields.io/npm/v/scaffold-scripts.svg)](https://www.npmjs.com/package/scaffold-scripts)
[![NPM Downloads](https://img.shields.io/npm/dm/scaffold-scripts.svg)](https://www.npmjs.com/package/scaffold-scripts)
[![GitHub Stars](https://img.shields.io/github/stars/ChrisColeTech/scaffold-scripts.svg)](https://github.com/ChrisColeTech/scaffold-scripts/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Node Version](https://img.shields.io/node/v/scaffold-scripts.svg)](https://nodejs.org/)
[![Platform Support](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/ChrisColeTech/scaffold-scripts)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Code Quality](https://img.shields.io/badge/code%20quality-A-brightgreen.svg)](https://github.com/ChrisColeTech/scaffold-scripts)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ChrisColeTech/scaffold-scripts/pulls)

Simple CLI tool for managing and running your own scripts. Add any script, run it anywhere.

> **🚀 Production Ready** • **⚡ Real-time Output** • **🔧 Cross-Platform** • **📦 Zero Config**

## Quick Install

```bash
npm install -g scaffold-scripts
```

## Usage

```bash
# Add a script to your library
scripts add my-script path/to/script.sh

# Run your script from anywhere
scripts my-script

# List all scripts
scripts list
```

## 🚀 Interactive Mode

Just type `scripts` with no arguments to launch the interactive menu:

```bash
scripts
```

Use arrow keys to:
- **Select and run** any script
- **List all scripts** with details
- **Get help** adding new scripts
- **Exit** when done

Perfect for discovering and running scripts without remembering names!

## Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `scripts add` | `scripts a` / `scaffold add` | Add a script |
| `scripts list` | `scripts l` / `scaffold list` | List all scripts |
| `scripts remove` | `scripts r` / `scaffold remove` | Remove a script |
| `scripts update` | `scripts u` / `scaffold update` | Update a script |
| `scripts view` | `scripts s` / `scaffold view` | View script details |

**Speed shortcuts:** Use `scripts a`, `scripts l`, `scripts r`, `scripts u`, `scripts s` for faster typing.  
**Alternative:** Use `scaffold` if you prefer to match the package name.

## The Workflow

1. **Get a script** → From AI, GitHub, docs, or write your own
2. **Save locally** → Copy to a `.sh`, `.py`, `.js`, or `.ps1` file  
3. **Add to scaffold** → `scripts add script-name file.sh`
4. **Run from anywhere** → `scripts script-name` (no more hunting for files)

## Examples

```bash
# You got a React setup script from ChatGPT/Claude
scripts add react-setup setup.sh
scripts react-setup my-app

# You found a deployment script on GitHub  
scripts add deploy deploy.py
scripts deploy staging
```

## Supported File Types

Shell (`.sh`, `.bash`), Python (`.py`), JavaScript (`.js`, `.ts`), PowerShell (`.ps1`), Batch (`.bat`), and more.

## Why Use This?

- ✅ **No more hunting for files** - run scripts from anywhere with one command
- ✅ **Real-time output streaming** - see `npm install` progress as it happens
- ✅ **Perfect for AI-generated scripts** - easily save and run scripts from ChatGPT/Claude
- ✅ **Cross-platform** - works on Windows, Mac, Linux with automatic conversions
- ✅ **Interactive mode** - beautiful menu for discovering and running scripts
- ✅ **Production ready** - comprehensive testing across all platforms
- ✅ **Simple workflow** - add once, run anywhere

## Documentation

Full documentation with detailed examples: [README-full.md](./README-full.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

- 🐛 **Report bugs** via [GitHub Issues](https://github.com/ChrisColeTech/scaffold-scripts/issues)
- 💡 **Request features** via [GitHub Issues](https://github.com/ChrisColeTech/scaffold-scripts/issues) 
- 🔀 **Submit PRs** - all contributions welcome!

## Support

- ⭐ **Star this repo** if you find it useful
- 📖 **Documentation**: [README-full.md](./README-full.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/ChrisColeTech/scaffold-scripts/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ChrisColeTech/scaffold-scripts/discussions)

## License

MIT © [ChrisColeTech](https://github.com/ChrisColeTech)