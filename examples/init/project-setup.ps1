# Project Initialization Script - PowerShell Version
param(
    [string]$ProjectName = "MyProject",
    [string]$ProjectType = "fullstack"
)

Write-Host "🚀 Initializing $ProjectType project: $ProjectName" -ForegroundColor Blue

# Create main project directory
Write-Host "📁 Creating project structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ProjectName | Out-Null
Set-Location $ProjectName

# Create base directories
$baseDirs = @(
    "frontend",
    "backend", 
    "docs",
    "scripts",
    "tests",
    ".github\workflows",
    "docker"
)

foreach ($dir in $baseDirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "  ✓ Created $dir" -ForegroundColor Green
}

# Create essential files
Write-Host "📄 Creating essential files..." -ForegroundColor Yellow
$files = @{
    "README.md" = @"
# $ProjectName

## Description
Brief description of your project.

## Prerequisites
- Node.js 18+
- .NET 8.0+
- Docker (optional)

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the application: `npm start`

## Project Structure
- `frontend/` - Frontend application
- `backend/` - Backend API
- `docs/` - Documentation
- `scripts/` - Build and deployment scripts
- `tests/` - Test files

## Contributing
Please read our contributing guidelines.
"@
    ".gitignore" = @"
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Environment files
.env
.env.local
.env.*.local
*.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed

# .NET
bin/
obj/
*.user
*.suo

# Database
*.db
*.sqlite
*.sqlite3
"@
    "package.json" = @"
{
  "name": "$($ProjectName.ToLower())",
  "version": "1.0.0",
  "description": "Full-stack application",
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && dotnet run",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && dotnet build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && dotnet test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
"@
    "docker-compose.yml" = @"
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
    volumes:
      - ./backend:/app

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=$($ProjectName.ToLower())
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
"@
    ".github\workflows\ci.yml" = @"
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0.x'
    - name: Install dependencies
      run: npm install
    - name: Run tests
      run: npm test
"@
    "scripts\build.ps1" = @"
Write-Host "Building $ProjectName..." -ForegroundColor Blue
npm run build
Write-Host "Build completed!" -ForegroundColor Green
"@
    "scripts\deploy.ps1" = @"
Write-Host "Deploying $ProjectName..." -ForegroundColor Blue
# Add deployment logic here
Write-Host "Deployment completed!" -ForegroundColor Green
"@
}

foreach ($file in $files.Keys) {
    $content = $files[$file]
    New-Item -ItemType File -Force -Path $file -Value $content | Out-Null
    Write-Host "  ✓ Created $file" -ForegroundColor Green
}

# Initialize git repository
Write-Host "📋 Initializing Git repository..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial project setup for $ProjectName"

# Install root dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✅ Project $ProjectName initialized successfully!" -ForegroundColor Green
Write-Host "📂 Project location: $PWD" -ForegroundColor Cyan
Write-Host "🏃 Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd $ProjectName" -ForegroundColor Cyan
Write-Host "  2. Set up frontend: scaffold -f vue" -ForegroundColor Cyan  
Write-Host "  3. Set up backend: scaffold -b aspnet" -ForegroundColor Cyan
Write-Host "  4. Start development: npm run dev" -ForegroundColor Cyan