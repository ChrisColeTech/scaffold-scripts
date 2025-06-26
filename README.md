# Scaffold Scripts CLI

Simple CLI tool for managing and running your own scripts. Add any script, run it anywhere.

## 🚀 Quick Install

### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/install.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/install.ps1 | iex
```

## ✨ Simple Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `scaffold my-script` | - | Run a script |
| `scaffold add my-script /path` | `-a` | Add a script |
| `scaffold update my-script /path` | `-u` | Update a script |
| `scaffold remove my-script` | `-r` | Remove a script |
| `scaffold list` | `-l` | List all scripts |
| `scaffold -v my-script` | - | View script details |

That's it. No complexity, no types, just scripts.

## 🔄 The Workflow (Crystal Clear)

1. **Copy prompt** → Paste into AI (ChatGPT, Claude, etc.)
2. **Copy AI's script** → Save to file on your computer  
3. **Add to scaffold** → `scaffold add script-name file.sh`
4. **Run anywhere** → `scaffold script-name`

```bash
# Example: AI gives you a React setup script
# You save it to: react-setup.sh
# Then:
scaffold add react-setup react-setup.sh
scaffold react-setup my-new-project
```

## 🤖 Copy These AI Prompts

**Here are battle-tested prompts you can copy-paste to get AI to write production-ready scripts:**

### Workflow 1: React Project Setup

**Copy this exact prompt:**
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
# Add the file you just created (command or alias):
scaffold add react-setup react-setup.sh
# or use alias:
scaffold -a react-setup react-setup.sh
```

**Step 4: Use it**
```bash
scaffold react-setup my-awesome-app
```

### Workflow 2: Express API Setup

**Copy this exact prompt:**
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

# Add to scaffold (command or alias):
scaffold add api-setup api-setup.js
# or: scaffold -a api-setup api-setup.js
```

**Step 3: Use it**
```bash
scaffold api-setup my-api
```

### Workflow 3: Database Setup with Docker

**Copy this exact prompt:**
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
scaffold add postgres-setup postgres-setup.sh
```

**Step 3: Use it**
```bash
scaffold postgres-setup my-project-db
```

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
scaffold add deploy deploy-script.sh
```

**Step 3: Use it**
```bash
scaffold deploy staging  # Deploy to staging
```

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
scaffold add dev-setup setup-dev.sh
```

**Step 3: Use it**
```bash
scaffold dev-setup  # Complete environment in one command
```

## 🔧 Management Commands

```bash
# List all your scripts (command or alias)
scaffold list
scaffold -l

# See script details
scaffold -v my-script

# Update a script (command or alias)
scaffold update my-script /path/to/new-script.sh
scaffold -u my-script /path/to/new-script.sh

# Remove a script (command or alias)  
scaffold remove my-script
scaffold -r my-script
```

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

1. **Copy exact prompts** - Use the prompts above word-for-word for best results
2. **Test AI output** - Always test the generated script before adding to scaffold
3. **Use descriptive names** - `react-setup`, `deploy-prod`, `security-audit`
4. **One script, one job** - Keep scripts focused on single tasks
5. **Add error handling** - Always request error handling in your prompts
6. **Share with team** - Export/import scripts or share the database file

## 🎯 Real Examples from Users

**Frontend Developer:**
```bash
# Adding scripts (using aliases for speed)
scaffold -a react-ts react-typescript-setup.sh
scaffold -a vue-app vue-setup.sh  
scaffold -a next-app nextjs-setup.sh

# Running scripts
scaffold react-ts my-new-project
scaffold list  # or: scaffold -l
```

**DevOps Engineer:**
```bash
# Adding deployment scripts
scaffold -a k8s-deploy kubernetes-deploy.sh
scaffold -a docker-build build-images.sh
scaffold -a aws-setup setup-aws-resources.sh

# Running deployments
scaffold k8s-deploy production
scaffold -v k8s-deploy  # View script details
```

**Full-Stack Developer:**
```bash
# Quick setup with aliases
scaffold -a fullstack full-project-setup.sh
scaffold -a api-gen generate-api.py
scaffold -a db-migrate migrate-database.sh

# Daily workflow
scaffold fullstack my-startup-idea
scaffold -u api-gen new-api-generator.py  # Update script
scaffold -r old-script  # Remove old script
```

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
scaffold add setup-unix setup-unix.sh      # For macOS/Linux  
scaffold add setup-win setup-win.ps1       # For Windows
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test your changes
4. Submit pull request

## 📤 Exporting Your Scripts

You can export your scripts as individual files anytime:

```bash
scaffold export ./my-scripts
```

This creates:
- Individual `.sh` files (executable and runnable)
- README with usage instructions
- Metadata headers in each script

## 🗑️ Uninstalling

Simple interactive uninstall:

```bash
scaffold uninstall
```

**The command will ask you:**
1. **Export scripts?** - Save scripts as files you can run directly
2. **Keep data?** - Only if you didn't export, preserve database in `~/.scaffold-scripts`

Then it uninstalls immediately. Simple!

If the built-in command doesn't work, use these alternatives:

### Unix/Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.sh | bash
```

### Windows PowerShell
```powershell
irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.ps1 | iex
```

## 📄 License

MIT License - see LICENSE file.

---

**Remember: Always start with AI. Ask AI to write your scripts, then add them to scaffold. This gives you optimized, production-ready scripts every time.**