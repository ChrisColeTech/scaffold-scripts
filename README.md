# Scaffold Scripts

Simple CLI tool for managing and running your own scripts. Add any script, run it anywhere.

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

## Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `scripts add` | `scripts a` / `scaffold add` | Add a script |
| `scripts list` | `scripts l` / `scaffold list` | List all scripts |
| `scripts remove` | `scripts r` / `scaffold remove` | Remove a script |
| `scripts update` | `scripts u` / `scaffold update` | Update a script |
| `scripts view` | `scripts v` / `scaffold view` | View script details |

**Speed shortcuts:** Use `scripts a`, `scripts l`, `scripts r`, `scripts u`, `scripts v` for faster typing.  
**Alternative:** Use `scaffold` instead of `scripts` for shorter commands.

## The Workflow

1. **Ask AI** → Get a script from ChatGPT/Claude for any task
2. **Save locally** → Copy to a `.sh`, `.py`, `.js`, or `.ps1` file  
3. **Add to scaffold** → `scripts add script-name file.sh`
4. **Run anywhere** → `scripts script-name`

## Examples

```bash
# AI gives you a React setup script
scripts add react-setup setup.sh
scripts react-setup my-app

# AI gives you a deployment script  
scripts add deploy deploy.py
scripts deploy staging
```

## Supported File Types

Shell (`.sh`, `.bash`), Python (`.py`), JavaScript (`.js`, `.ts`), PowerShell (`.ps1`), Batch (`.bat`), and more.

## Why Use This?

- ✅ **AI writes better scripts** than you manually typing commands
- ✅ **Run from anywhere** - no more hunting for script files
- ✅ **Cross-platform** - works on Windows, Mac, Linux
- ✅ **Simple** - just add script, run script, done

## Documentation

Full documentation with detailed examples: [README-full.md](./README-full.md)

## License

MIT