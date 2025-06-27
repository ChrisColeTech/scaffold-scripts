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
- ✅ **Perfect for AI-generated scripts** - easily save and run scripts from ChatGPT/Claude
- ✅ **Cross-platform** - works on Windows, Mac, Linux
- ✅ **Simple workflow** - add once, run anywhere

## Documentation

Full documentation with detailed examples: [README-full.md](./README-full.md)

## License

MIT