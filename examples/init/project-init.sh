#!/bin/bash
# Project Initialization Script

echo "🚀 Initializing new project..."

# Get project name from current directory or prompt
PROJECT_NAME=$(basename "$PWD")

echo "📁 Setting up project structure for: $PROJECT_NAME"

# Create main directories
mkdir -p {frontend,backend,docs,scripts,tests}

# Create root files
cat > README.md << EOF
# $PROJECT_NAME

## Project Structure

- \`frontend/\` - Frontend application
- \`backend/\` - Backend API
- \`docs/\` - Documentation
- \`scripts/\` - Build and deployment scripts
- \`tests/\` - Integration tests

## Getting Started

1. Choose your stack:
   \`\`\`bash
   # Frontend
   scaffold -f react      # React + TypeScript
   scaffold -f vue        # Vue 3 + TypeScript
   
   # Backend
   scaffold -b dotnet     # .NET 8 Web API
   scaffold -b python     # Python FastAPI
   \`\`\`

2. Follow the setup instructions in each directory

## Development

- Frontend: See \`frontend/README.md\`
- Backend: See \`backend/README.md\`

## Deployment

- See \`scripts/deploy.sh\`
EOF

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
venv/
__pycache__/

# Build outputs
dist/
build/
*.dll
*.exe

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database
*.db
*.sqlite
*.sqlite3
EOF

# Create package.json for workspace management
cat > package.json << EOF
{
  "name": "$(echo $PROJECT_NAME | tr '[:upper:]' '[:lower:]')",
  "version": "1.0.0",
  "description": "$PROJECT_NAME - Full Stack Application",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  },
  "keywords": ["fullstack", "web", "application"],
  "author": "",
  "license": "MIT"
}
EOF

# Create development scripts
mkdir -p scripts

cat > scripts/dev.sh << EOF
#!/bin/bash
# Development startup script

echo "🚀 Starting development environment..."

# Install root dependencies
npm install

# Start both frontend and backend
npm run dev
EOF

cat > scripts/setup.sh << EOF
#!/bin/bash
# Project setup script

echo "📦 Setting up project dependencies..."

# Install root dependencies
npm install

# Setup frontend if it exists
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "📦 Setting up frontend..."
    cd frontend
    npm install
    cd ..
fi

# Setup backend if it exists
if [ -d "backend" ] && [ -f "backend/package.json" ]; then
    echo "📦 Setting up backend..."
    cd backend
    npm install
    cd ..
elif [ -d "backend" ] && [ -f "backend/requirements.txt" ]; then
    echo "🐍 Setting up Python backend..."
    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

echo "✅ Setup complete!"
EOF

chmod +x scripts/*.sh

# Initialize git repository
if command -v git &> /dev/null; then
    if [ ! -d ".git" ]; then
        echo "📝 Initializing git repository..."
        git init
        git add .
        git commit -m "Initial project setup

- Created project structure
- Added README and configuration files
- Set up development scripts"
    fi
fi

echo "✅ Project initialized successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Choose your frontend: scaffold -f react|vue|angular"
echo "  2. Choose your backend: scaffold -b dotnet|python|nodejs"
echo "  3. Run setup: ./scripts/setup.sh"
echo "  4. Start development: ./scripts/dev.sh"
echo ""
echo "📁 Project structure created:"
echo "  - frontend/ (empty - add with scaffold -f)"
echo "  - backend/ (empty - add with scaffold -b)"
echo "  - docs/ (for documentation)"
echo "  - scripts/ (development scripts)"
echo "  - tests/ (integration tests)"