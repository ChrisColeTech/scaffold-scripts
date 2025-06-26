# Scaffold Scripts CLI - Windows PowerShell Installer

[CmdletBinding()]
param()

# Configuration
$RepoUrl = "https://github.com/yourusername/scaffold-scripts"
$InstallDir = "$env:USERPROFILE\.scaffold-scripts"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [ValidateSet("Red", "Green", "Yellow", "Blue", "White")]
        [string]$Color = "White"
    )
    
    $originalColor = $Host.UI.RawUI.ForegroundColor
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = $originalColor
}

Write-ColorOutput "🚀 Scaffold Scripts CLI Installer" -Color Blue
Write-ColorOutput "===================================" -Color Blue

# Check if running as Administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-ColorOutput "⚠️  Running without administrator privileges" -Color Yellow
    Write-ColorOutput "This is fine for user-level installation" -Color Yellow
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Check Node.js
Write-ColorOutput "🔍 Checking prerequisites..." -Color Yellow

if (-not (Test-Command "node")) {
    Write-ColorOutput "❌ Node.js is not installed" -Color Red
    Write-ColorOutput "Please install Node.js 16+ from https://nodejs.org" -Color Yellow
    Write-ColorOutput "Press Enter to open download page..." -Color Yellow
    Read-Host
    Start-Process "https://nodejs.org/en/download/"
    exit 1
}

$nodeVersion = node --version
$versionNumber = $nodeVersion -replace "v", ""
$requiredVersion = [Version]"16.0.0"
$currentVersion = [Version]$versionNumber

if ($currentVersion -lt $requiredVersion) {
    Write-ColorOutput "❌ Node.js version $nodeVersion is too old" -Color Red
    Write-ColorOutput "Please upgrade to Node.js 16+ from https://nodejs.org" -Color Yellow
    exit 1
}

Write-ColorOutput "✅ Node.js $nodeVersion detected" -Color Green

# Check npm
if (-not (Test-Command "npm")) {
    Write-ColorOutput "❌ npm is not installed" -Color Red
    exit 1
}

Write-ColorOutput "✅ npm detected" -Color Green

# Create directories
Write-ColorOutput "📁 Creating directories..." -Color Yellow
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Install via npm
Write-ColorOutput "📦 Installing Scaffold Scripts CLI..." -Color Yellow

try {
    npm install -g scaffold-scripts
    Write-ColorOutput "✅ Successfully installed scaffold-scripts" -Color Green
}
catch {
    Write-ColorOutput "❌ Failed to install via npm" -Color Red
    Write-ColorOutput "Trying alternative installation method..." -Color Yellow
    
    # Alternative: Install from source
    if (Test-Command "git") {
        Write-ColorOutput "📥 Cloning repository..." -Color Yellow
        Set-Location $env:TEMP
        
        if (Test-Path "scaffold-scripts") {
            Remove-Item -Recurse -Force "scaffold-scripts"
        }
        
        git clone "$RepoUrl.git"
        Set-Location "scaffold-scripts"
        
        Write-ColorOutput "📦 Installing dependencies..." -Color Yellow
        npm install
        
        Write-ColorOutput "🔨 Building project..." -Color Yellow
        npm run build
        
        Write-ColorOutput "🔗 Installing globally..." -Color Yellow
        npm install -g .
        
        Set-Location ..
        Remove-Item -Recurse -Force "scaffold-scripts"
        
        Write-ColorOutput "✅ Successfully installed from source" -Color Green
    }
    else {
        Write-ColorOutput "❌ Git not found. Cannot install from source" -Color Red
        Write-ColorOutput "Please install Git from https://git-scm.com/download/win" -Color Yellow
        exit 1
    }
}

# Verify installation
Write-ColorOutput "🔍 Verifying installation..." -Color Yellow

if (Test-Command "scaffold") {
    Write-ColorOutput "✅ scaffold command is available" -Color Green
    try {
        $installedVersion = scaffold --version 2>$null
        Write-ColorOutput "📋 Installed version: $installedVersion" -Color Green
    }
    catch {
        Write-ColorOutput "📋 Installation verified (version check failed)" -Color Green
    }
}
else {
    Write-ColorOutput "❌ scaffold command not found" -Color Red
    Write-ColorOutput "You may need to restart your PowerShell session" -Color Yellow
    
    # Try to find npm global path
    try {
        $npmGlobalPath = npm config get prefix
        Write-ColorOutput "npm global path: $npmGlobalPath" -Color Yellow
        Write-ColorOutput "Make sure this path is in your PATH environment variable" -Color Yellow
    }
    catch {
        Write-ColorOutput "Could not determine npm global path" -Color Yellow
    }
}

# Check PATH
$npmPrefix = npm config get prefix 2>$null
if ($npmPrefix -and ($env:PATH -notlike "*$npmPrefix*")) {
    Write-ColorOutput "🔧 Adding npm global path to USER PATH..." -Color Yellow
    
    $userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($userPath -notlike "*$npmPrefix*") {
        $newPath = "$userPath;$npmPrefix"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-ColorOutput "✅ Added $npmPrefix to PATH" -Color Green
        Write-ColorOutput "Please restart PowerShell for PATH changes to take effect" -Color Yellow
    }
}

Write-ColorOutput "🎉 Installation complete!" -Color Green
Write-Host ""
Write-ColorOutput "📖 Quick Start:" -Color Blue
Write-ColorOutput "  scaffold --help                    # Show help" -Color Blue
Write-ColorOutput "  scaffold list                      # List available commands" -Color Blue
Write-ColorOutput "  scaffold add frontend react script.txt  # Add command" -Color Blue
Write-ColorOutput "  scaffold -f react                  # Run frontend scaffold" -Color Blue
Write-Host ""
Write-ColorOutput "📚 Documentation: $RepoUrl" -Color Blue

Write-Host ""
Write-ColorOutput "Press Enter to continue..." -Color Yellow
Read-Host