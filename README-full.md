# Scaffold Scripts CLI

Simple CLI tool for managing and running your own scripts. Add any script, run it anywhere.

## 🚀 Quick Install

### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/scripts/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/scripts/install.ps1 | iex
```

## ✨ Simple Commands

| Command | Aliases | Description | Usage Example |
|---------|---------|-------------|---------------|
| `scripts` | `scaffold` | Run a script | `scripts setup-project` |
| `scripts add` | `scripts a` / `scaffold add` | Add a script | `scripts add setup script.sh` |
| `scripts update` | `scripts u` / `scaffold update` | Update a script | `scripts update setup new-script.sh` |
| `scripts remove` | `scripts r` / `scaffold remove` | Remove a script | `scripts remove setup` |
| `scripts list` | `scripts l` / `scaffold list` | List all scripts | `scripts list` |
| `scripts view` | `scripts s` / `scaffold view` | View script details | `scripts view setup` |

**Choose your style:**
- **Full commands:** `scripts add`, `scripts list` - Clear, descriptive, and shorter to type
- **Speed typing:** `scripts a`, `scripts l`, `scripts s` - Fastest option  
- **Alternative:** `scaffold add`, `scaffold list` - If you prefer to match the package name

## 🚀 Interactive Mode

Just type `scripts` with no arguments to launch the interactive menu:

```bash
scripts
```

**What happens:**
- Shows all your registered scripts with descriptions and aliases
- Arrow keys to navigate, Enter to select
- Run any script instantly without remembering names
- Quick access to management commands (list, add help, exit)

**Perfect for:**
- Discovering scripts you forgot about
- Running scripts without typing exact names
- Exploring what's available in your script library
- Quick script execution with visual selection

**Example interactive session:**
```bash
$ scripts

🚀 Available Scripts:
❯ setup-react (react) - Creates new React TypeScript project with Vite
  api-setup (api) - Express TypeScript API with security middleware
  postgres-setup (db) [unix] - PostgreSQL with Docker Compose
  deploy (d) - Full-stack deployment to staging/production
  backup - Daily file backup automation
  ──────────────────────────────────────────────────────────
  📋 List all scripts
  📦 Add new script
  ✖ Exit

Select a script to run:
```

Use arrow keys to select any script and press Enter to run it, or choose management options at the bottom.

## 🔄 The Workflow (Crystal Clear)

1. **Get a script** → From AI, documentation, GitHub, or write your own
2. **Save locally** → Copy to a file on your computer (any extension)
3. **Add to scaffold** → `scripts add script-name file.sh`
4. **Run from anywhere** → `scripts script-name` (no more hunting for files)

```bash
# Example: You got a setup script from ChatGPT, save it to setup.sh
scripts add setup setup.sh
scripts setup my-project
```

**Speed version:**
```bash
# Same workflow, faster typing
scripts a setup setup.sh
scripts setup my-project
```

**The real problem this solves:** You get scripts from AI, GitHub, Stack Overflow, or write them yourself. Instead of remembering file paths and directories, you register them once with a memorable name. Then run `scripts setup my-project` from anywhere - no more `cd ~/scripts && ./setup.sh my-project` or hunting through folders.

## 🤖 Example AI Prompts for Getting Scripts

**Use these prompts with ChatGPT, Claude, or any AI to get useful scripts:**

### Example 1: Project Setup Script

**Example prompt (customize as needed):**
```
Write a bash script that sets up a React TypeScript project with the following requirements:

1. Use Vite with react-ts template
2. Install these exact packages: tailwindcss postcss autoprefixer react-router-dom @tanstack/react-query zustand
3. Install dev dependencies: prettier eslint-config-prettier @types/node
4. Run tailwindcss init with PostCSS
5. Create folder structure: src/components src/hooks src/utils src/stores src/types
6. Create .prettierrc with: {"semi": true, "singleQuote": true, "tabWidth": 2}
7. Create basic tailwind.config.js that scans src/**/*.{js,ts,jsx,tsx}
8. Update src/index.css to include tailwind directives
9. Script should accept project name as $1 argument
10. Add error handling - exit if any command fails
11. Print progress messages for each step
12. End with success message showing next steps

Make the script production-ready with proper error handling.
```

**Step 2: Save AI's response to a file**
```bash
# IMPORTANT: Copy AI's response and save it to a file
# AI will give you a script - copy the ENTIRE script and save it:

nano react-setup.sh
# or
code react-setup.sh
# or
vim react-setup.sh

# Paste AI's complete script, then save the file
# Make it executable:
chmod +x react-setup.sh
```

**Step 3: Add to scaffold**
```bash
# Add the file you just created:
scripts add project-setup project-setup.sh
```

**Step 4: Use it**
```bash
scripts project-setup my-awesome-app
```

**What's happening in this complete example:** Here `scripts` is the main command using its full name for documentation clarity. The `add` subcommand registers a new script where `project-setup` becomes your custom script name (what you'll type to run it later) and `project-setup.sh` is the path to your actual script file. Then when you run `scripts project-setup my-awesome-app`, the `scripts` command finds your registered script called "project-setup" and executes it, passing "my-awesome-app" as an argument to your script.

### Example 2: API Setup Script

**Example prompt (customize as needed):**
```
Write a Node.js script that creates a production-ready Express TypeScript API:

1. Create project directory and cd into it
2. Run npm init -y
3. Install: express helmet cors express-rate-limit dotenv express-validator morgan bcryptjs jsonwebtoken
4. Install dev deps: typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken nodemon ts-node
5. Create tsconfig.json with strict settings and outDir: "./dist"
6. Create folder structure: src/routes src/middleware src/models src/controllers src/utils
7. Create src/app.ts with Express app, all security middleware configured, JSON parsing, and /health endpoint
8. Create src/server.ts that imports app and starts server on process.env.PORT || 3000
9. Create .env file with PORT=3000, NODE_ENV=development, JWT_SECRET=your-secret-here
10. Add npm scripts: "dev": "nodemon src/server.ts", "build": "tsc", "start": "node dist/server.js"
11. Create basic error handling middleware
12. Script accepts API name as first argument
13. Add comprehensive error handling and progress logging
14. Include .gitignore for node_modules, .env, dist/

Make it production-ready with security best practices.
```

**Step 2: Save AI's response to a file**
```bash
# IMPORTANT: AI will generate a Node.js script
# Copy AI's complete response and save it to a file:

nano api-setup.js
# Paste AI's entire script, save and exit

# Make it executable:
chmod +x api-setup.js

# Add to scaffold:
scripts add api-setup api-setup.js
```

**Step 3: Use it**
```bash
scripts api-setup my-api
```

**What's happening in this complete example:** This demonstrates working with JavaScript/Node.js scripts. The `scripts` command uses its full name, `add` registers the script, `api-setup` is your chosen script name, and `api-setup.js` is your JavaScript file. When you later run `scripts api-setup my-api`, the `scripts` command executes your registered "api-setup" script and passes "my-api" as an argument for the API project name.

### Example 3: Database Setup Script

**Example prompt (customize as needed):**
```
Write a bash script that sets up PostgreSQL with Docker Compose:

1. Script accepts database name as $1 argument
2. Create docker-compose.yml with:
   - PostgreSQL 15 image
   - Custom database name from argument
   - Username: developer, Password: devpassword
   - Port 5432:5432
   - Volume for data persistence: postgres_data
   - Health check with pg_isready
   - Auto-restart policy
3. Create init.sql with:
   - Enable uuid-ossp extension
   - Create users table with id (UUID primary key), email (unique), password_hash, created_at, updated_at
   - Create indexes on email and created_at
   - Insert sample admin user
4. Create .env file with database credentials
5. Run docker-compose up -d
6. Wait for health check to pass
7. Display connection info and sample commands
8. Add error handling for Docker not running
9. Check if port 5432 is already in use

Include detailed logging and error messages.
```

**Step 2: Save AI's response to a file**
```bash
# IMPORTANT: AI will generate a bash script
# Copy AI's complete response and save it:

nano postgres-setup.sh
# Paste AI's entire script, save and exit
chmod +x postgres-setup.sh

# Add to scaffold:
scripts add postgres-setup postgres-setup.sh
```

**Step 3: Use it**
```bash
scripts postgres-setup my-project-db
```

**What's happening in this complete example:** This shows database setup script management. The `scripts` command uses its full name for clarity, `add` registers your script, `postgres-setup` becomes your custom script name, and `postgres-setup.sh` is your actual bash script file. When you run `scripts postgres-setup my-project-db`, the `scripts` command finds and executes your registered "postgres-setup" script, passing "my-project-db" as the database name argument.

### Workflow 4: Deployment Script

**Copy this exact prompt:**
```
Write a bash deployment script for a full-stack application:

1. Accept environment argument: dev, staging, or prod
2. Set registry URL and cluster config based on environment
3. Run these steps with detailed logging:
   - Validate environment argument
   - Check for required tools: docker, kubectl, git
   - Run frontend tests: cd frontend && npm test
   - Run backend tests: cd backend && npm test
   - Build frontend: npm run build and create Docker image
   - Build backend: npm run build and create Docker image
   - Tag images with git commit hash and environment
   - Push both images to container registry
   - Update Kubernetes manifests with new image tags
   - Apply Kubernetes configs: kubectl apply -f k8s/
   - Wait for frontend deployment rollout
   - Wait for backend deployment rollout
   - Run health checks on deployed services
   - Display deployment URLs and status
4. Add rollback function if deployment fails
5. Add comprehensive error handling and logging
6. Support dry-run mode with --dry-run flag

Include progress indicators and colored output.
```

**Step 2: Save AI's response to a file**
```bash
# IMPORTANT: AI will generate a deployment script
# Copy AI's complete response and save it:

nano deploy-script.sh
# Paste AI's entire script, save and exit
chmod +x deploy-script.sh

# Add to scaffold:
scripts add deploy deploy-script.sh
```

**Step 3: Use it**
```bash
scripts deploy staging  # Deploy to staging
```

**What's happening in this complete example:** This demonstrates deployment script management. The `scripts` command uses its full name, `add` registers your deployment script, `deploy` is your chosen script name (short and memorable), and `deploy-script.sh` is your actual script file. Later, `scripts deploy staging` uses the `scripts` command to run your registered "deploy" script with "staging" as the environment argument, making deployment as simple as one command.

### Workflow 5: Development Environment

**Copy this exact prompt:**
```
Write a bash script that sets up a complete development environment:

1. Check OS (macOS, Linux, Windows WSL) and install tools accordingly:
   - Node.js 18+ (via nvm if not installed)
   - Docker and Docker Compose
   - Git (if not installed)
   - VSCode command line tools
2. Clone these repositories to ~/code/ directory:
   - Frontend: git@github.com:company/frontend.git
   - Backend: git@github.com:company/backend.git
   - Shared: git@github.com:company/shared-components.git
3. For each repo:
   - Run npm install
   - Copy .env.example to .env
   - Set up git hooks with husky
4. Install global npm packages: typescript, nodemon, concurrently
5. Install VSCode extensions:
   - ms-vscode.vscode-typescript-next
   - esbenp.prettier-vscode
   - bradlc.vscode-tailwindcss
6. Create workspace file for VSCode with all 3 repos
7. Start development services:
   - Database with Docker Compose
   - Backend in watch mode
   - Frontend in dev mode
8. Display access URLs and next steps
9. Add checks for SSH keys and GitHub access
10. Handle errors gracefully with helpful messages

Make it idempotent - safe to run multiple times.
```

**Step 2: Save AI's response to a file**
```bash
# IMPORTANT: AI will generate an environment setup script
# Copy AI's complete response and save it:

nano setup-dev.sh
# Paste AI's entire script, save and exit
chmod +x setup-dev.sh

# Add to scaffold:
scripts add dev-setup setup-dev.sh
```

**Step 3: Use it**
```bash
scripts dev-setup  # Complete environment in one command
```

**What's happening in this complete example:** This shows environment setup automation. The `scripts` command uses its full name, `add` registers your environment script, `dev-setup` is your descriptive script name, and `setup-dev.sh` is your actual script file. When you run `scripts dev-setup`, the `scripts` command executes your registered script to set up your entire development environment in one command - no arguments needed since the script handles everything internally.

## 🔧 Management Commands

```bash
# List all your scripts
scripts list

# See script details
scripts view my-script

# Update a script
scripts update my-script /path/to/new-script.sh

# Remove a script
scripts remove my-script
```

**What's happening in this complete example:** These are the main management commands using the clear `scripts` command name for clarity. `scripts list` shows all your registered scripts like a directory. `scripts view my-script` shows details about a specific script called "my-script". `scripts update my-script /path/to/new-script.sh` replaces your existing "my-script" with a new version from the file path. `scripts remove my-script` permanently deletes the script called "my-script" from your library.

## 🎯 More Production Prompts

### CI/CD Pipeline Setup
```
Write a bash script that sets up GitHub Actions workflow:

1. Create .github/workflows/ci.yml with:
   - Trigger on push to main and pull requests
   - Node.js matrix testing (16, 18, 20)
   - Install dependencies with cache
   - Run linting with eslint
   - Run tests with coverage
   - Build application
   - Upload coverage to Codecov
2. Create .github/workflows/deploy.yml with:
   - Trigger on release tag
   - Build Docker images
   - Push to GitHub Container Registry
   - Deploy to production via SSH
3. Add scripts/ci-setup.sh that developers run locally
4. Include status badges for README
5. Add comprehensive error handling
6. Support for monorepo with multiple packages

Make it follow GitHub Actions best practices.
```

### Testing Setup
```
Write a script that sets up comprehensive testing for a TypeScript project:

1. Install test dependencies: jest, @types/jest, ts-jest, @testing-library/react, @testing-library/jest-dom
2. Create jest.config.js with TypeScript support and coverage thresholds
3. Create test setup files and utilities
4. Add test scripts to package.json: test, test:watch, test:coverage, test:ci
5. Create example unit tests, integration tests, and e2e tests
6. Set up MSW for API mocking
7. Configure test database setup/teardown
8. Add pre-commit hook to run tests
9. Create testing documentation in docs/testing.md

Include best practices for React Testing Library.
```

### Security Audit Script
```
Write a security audit script for a Node.js application:

1. Run npm audit and fail if high vulnerabilities
2. Check for common security issues:
   - Hardcoded secrets in code
   - Weak dependencies
   - Insecure environment configurations
3. Scan Dockerfile for security best practices
4. Check for exposed sensitive files (.env, keys)
5. Validate HTTPS configuration
6. Check dependency licenses for compliance
7. Run security linting with eslint-plugin-security
8. Generate security report with recommendations
9. Integration with security scanning tools

Output detailed report with severity levels and fix suggestions.
```

## 💡 Pro Tips

1. **Customize prompts** - Use our examples as starting points, then adapt for your needs
2. **Test AI output** - Always test the generated script before adding to scaffold
3. **Use descriptive names** - `web-setup`, `backup-files`, `deploy-app`
4. **One script, one job** - Keep scripts focused on single tasks
5. **Add error handling** - Always request error handling in your prompts
6. **Share with team** - Export/import scripts or share the database file
7. **Use shortcuts** - `scripts` saves typing, same as `scaffold`

## 🎯 Real Examples from Users

**Student working on projects:**
```bash
# Speed workflow with shortcuts
scripts a web-setup web-project-setup.sh
scripts a homework homework-template.sh  
scripts a deploy deploy-to-server.sh

# Running scripts
scripts web-setup my-assignment
scripts l  # list all scripts
```

**What's happening in this complete example:** This shows a student's rapid workflow using command aliases for maximum speed. `scripts a` means "scripts add" for quickly registering multiple scripts: "web-setup", "homework", and "deploy" with their respective files. Then `scripts web-setup my-assignment` runs the "web-setup" script with "my-assignment" as an argument. Finally `scripts l` (short for "scripts list") quickly shows all registered scripts. Perfect for fast, frequent use.

**Someone automating daily tasks:**
```bash
# Clear commands for automation
scripts add backup backup-files.sh
scripts add clean cleanup-downloads.sh
scripts add update update-system.sh

# Running automations
scripts backup
scripts list
```

**What's happening in this complete example:** This shows daily automation using clear command names. `scripts add` registers three automation scripts: "backup" from "backup-files.sh", "clean" from "cleanup-downloads.sh", and "update" from "update-system.sh". Then `scripts backup` runs the backup script and `scripts list` shows all registered scripts. Perfect for automation tasks where clarity is important.

**Team lead sharing workflows:**
```bash
# Standard commands for documentation
scripts add onboard new-team-member.sh
scripts add test run-all-tests.py
scripts add release release-version.sh

# Daily workflow  
scripts onboard john-doe
scripts update test new-test-script.py
scripts remove old-workflow
```

**What's happening in this complete example:** This demonstrates team workflow using the full `scripts` command name for official documentation. `scripts add` registers three team scripts: "onboard" from "new-team-member.sh", "test" from "run-all-tests.py", and "release" from "release-version.sh". In daily use, `scripts onboard john-doe` runs the onboarding process with "john-doe" as the new team member name. `scripts update test new-test-script.py` replaces the existing "test" script with a newer version from "new-test-script.py". `scripts remove old-workflow` permanently deletes the outdated "old-workflow" script. The full command name is ideal for team documentation and training materials.

## 🚀 Why This Approach Works

1. **AI writes better scripts** - More optimized, handles edge cases
2. **No frontend/backend confusion** - Everything is just a script
3. **Cross-platform automatically** - Scaffold handles Windows/Unix conversion
4. **Version controlled** - Scripts are stored and managed
5. **Team collaboration** - Share scripts easily
6. **Zero learning curve** - Add script, run script, done

## 📦 Installation Details

The CLI stores scripts in `~/.scaffold-scripts/` and automatically:
- **Limited conversion** between platforms (basic commands only)
- Validates script security  
- Handles different script types (bash, PowerShell, Python, Node.js)
- Manages versions and updates

### Platform Conversion Reality Check

**What converts automatically:**
- Basic file operations: `mkdir`, `rm`, `cp`, `mv`
- Simple output: `echo`, `cat`
- Basic conditionals and loops

**What doesn't convert (most things):**
- Complex shell commands (`grep`, `sed`, `awk`, `curl`)
- Package managers (`apt`, `brew`, `choco`)
- System-specific commands
- Advanced scripting patterns

**Recommendation:** Ask AI to generate separate scripts for each platform:
```bash
# Ask AI for both versions
scripts add setup-unix setup-unix.sh      # For macOS/Linux  
scripts add setup-win setup-win.ps1       # For Windows
```

**What's happening in this complete example:** This demonstrates platform-specific script management using the full `scripts` command name for clarity. `scripts add setup-unix setup-unix.sh` registers a Unix/Linux shell script under the name "setup-unix", while `scripts add setup-win setup-win.ps1` registers a Windows PowerShell script under the name "setup-win". Using descriptive names like "setup-unix" and "setup-win" makes it obvious which script to run on each platform.

## 🔐 GitHub SSH Setup

To enable pushing commits directly from the CLI, set up SSH authentication:

### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/scripts/setup-github-ssh.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/scripts/setup-github-ssh.ps1 | iex
```

### Manual Setup
```bash
# Clone and run locally
git clone https://github.com/ChrisColeTech/scaffold-scripts.git
cd scaffold-scripts/scripts
./setup-github-ssh.sh          # Unix/Linux/macOS
# or
.\setup-github-ssh.ps1         # Windows PowerShell
```

The script will:
- Generate SSH keys for GitHub
- Configure SSH client settings
- Display your public key to add to GitHub
- Test the connection

## 📝 Supported File Types

Scaffold Scripts CLI accepts the following file types. **Any file extension not on this list will be rejected:**

### ✅ Accepted File Extensions

**Shell Scripts:**
- `.sh` - Shell script (bash/sh)
- `.bash` - Bash script
- `.zsh` - Zsh script  
- `.fish` - Fish shell script

**PowerShell:**
- `.ps1` - PowerShell script
- `.psm1` - PowerShell module

**Python:**
- `.py` - Python script
- `.py3` - Python 3 script

**JavaScript/TypeScript:**
- `.js` - JavaScript/Node.js script
- `.mjs` - ES6 module
- `.ts` - TypeScript script

**Other Languages:**
- `.rb` - Ruby script
- `.pl` - Perl script

**Windows Batch:**
- `.bat` - Batch script
- `.cmd` - CMD script

**Plain Text:**
- `.txt` - Plain text file (treated as shell script)
- `.text` - Plain text file (treated as shell script)
- `(no extension)` - Files without extensions (common for shell scripts)

### ❌ Rejected File Types

**Binary Files (will be rejected):**
- `.exe`, `.dll`, `.so`, `.dylib` - Executables/Libraries
- `.bin`, `.com`, `.msi`, `.deb`, `.rpm` - Binary packages  
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp` - Images
- `.mp3`, `.wav`, `.mp4`, `.avi`, `.mov` - Media files
- `.zip`, `.tar`, `.gz`, `.7z`, `.rar` - Archives
- `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx` - Documents
- `.class`, `.jar` - Compiled Java
- `.o`, `.obj`, `.a`, `.lib` - Compiled objects

**Validation Notes:**
- Files are checked for binary content (null bytes, high percentage of non-printable characters)
- Unusual extensions will generate warnings but may still be accepted if content is valid text
- Empty files are rejected
- File must exist and be readable

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test your changes
4. Submit pull request

## 📤 Exporting Your Scripts

You can export your scripts as individual files anytime:

```bash
scripts export ./my-scripts
```

**What's happening in this complete example:** The `scripts` command uses its full name, `export` is the subcommand that extracts scripts from your library, and `./my-scripts` is the directory path where all your scripts will be saved as individual executable files with usage instructions.

This creates:
- Individual `.sh` files (executable and runnable)
- README with usage instructions
- Metadata headers in each script

## 🗑️ Uninstalling

Simple interactive uninstall:

```bash
scripts uninstall
```

**What's happening in this complete example:** The `scripts` command uses its full name and `uninstall` is the subcommand that removes the entire CLI tool from your system, with interactive prompts to optionally export your scripts first and choose whether to keep your script database.

**The command will ask you:**
1. **Export scripts?** - Save scripts as files you can run directly
2. **Keep data?** - Only if you didn't export, preserve database in `~/.scaffold-scripts`

Then it uninstalls immediately. Simple!

If the built-in command doesn't work, use these alternatives:

### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/scripts/uninstall.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/scripts/uninstall.ps1 | iex
```

## 📄 License

MIT License - see LICENSE file.

---

**Remember: Always start with AI. Ask AI to write your scripts, then add them to scaffold. This gives you optimized, production-ready scripts every time.**