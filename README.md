# Scaffold Scripts

Simple CLI tool for managing and running your own scripts. Add any script, run it anywhere.

## Quick Install

```bash
npm install -g scaffold-scripts
```

## Usage

```bash
# Add a script to your library
scaffold add my-script path/to/script.sh

# Run your script from anywhere
scaffold my-script

# List all scripts
scaffold list

# Speed shortcuts
scaffold a my-script script.sh    # Add quickly
scaffold my-script                 # Run quickly
scripts list                       # Readable version
```

## The Workflow

1. **Ask AI** → Get a script from ChatGPT/Claude for any task
2. **Save locally** → Copy to a `.sh`, `.py`, `.js`, or `.ps1` file  
3. **Add to scaffold** → `scaffold add script-name file.sh`
4. **Run anywhere** → `scaffold script-name`

## Examples

```bash
# AI gives you a React setup script
scaffold add react-setup setup.sh
scaffold react-setup my-app

# AI gives you a deployment script  
scaffold add deploy deploy.py
scaffold deploy staging
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