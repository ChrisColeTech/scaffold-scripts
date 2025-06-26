# Scaffold Scripts CLI - Uninstaller for Windows
# Usage: irm https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.ps1 | iex

[CmdletBinding()]
param()

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

Write-ColorOutput "🗑️  Scaffold Scripts CLI Uninstaller" -Color Blue
Write-ColorOutput "====================================" -Color Blue

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

# Check if scaffold is installed
if (-not (Test-Command "scaffold")) {
    Write-ColorOutput "⚠️  Scaffold Scripts CLI is not installed or not in PATH" -Color Yellow
    Write-ColorOutput "Nothing to uninstall." -Color Yellow
    exit 0
}

Write-ColorOutput "🔍 Found Scaffold Scripts CLI installation" -Color Yellow

# Get current version before uninstalling
try {
    $currentVersion = scaffold --version 2>$null
    Write-ColorOutput "📋 Current version: $currentVersion" -Color Blue
}
catch {
    Write-ColorOutput "📋 Current version: unknown" -Color Blue
}

# Confirm uninstallation
Write-ColorOutput "⚠️  This will completely remove Scaffold Scripts CLI" -Color Yellow
$response = Read-Host "Are you sure you want to continue? (y/N)"

if ($response -notmatch "^[yY]([eE][sS])?$") {
    Write-ColorOutput "✅ Uninstallation cancelled" -Color Green
    exit 0
}

Write-ColorOutput "🗑️  Proceeding with uninstallation..." -Color Blue

# Check if npm is available
if (-not (Test-Command "npm")) {
    Write-ColorOutput "❌ npm is not available" -Color Red
    Write-ColorOutput "Cannot automatically uninstall. Please remove manually:" -Color Yellow
    Write-ColorOutput "  1. Remove scaffold command from your PATH" -Color Yellow
    Write-ColorOutput "  2. Delete $env:USERPROFILE\.scaffold-scripts directory" -Color Yellow
    exit 1
}

# Uninstall using npm
Write-ColorOutput "📦 Uninstalling scaffold-scripts package..." -Color Yellow
try {
    npm uninstall -g scaffold-scripts 2>$null
    Write-ColorOutput "✅ Package uninstalled via npm" -Color Green
}
catch {
    # Try alternative package names
    Write-ColorOutput "⚠️  Package not found, trying alternative names..." -Color Yellow
    
    # Get list of global packages and find scaffold-related ones
    try {
        $globalPackages = npm list -g --depth=0 2>$null | Select-String -Pattern "scaffold" -CaseSensitive:$false
        
        if ($globalPackages) {
            Write-ColorOutput "Found scaffold-related packages:" -Color Yellow
            $globalPackages | ForEach-Object { Write-Host $_.Line }
            
            # Try to extract package name and uninstall
            $packageName = ($globalPackages | Select-Object -First 1).Line -replace '.*[@]([^@]*scaffold[^@\s]*).*', '$1'
            if ($packageName -and $packageName -ne $globalPackages[0].Line) {
                Write-ColorOutput "Attempting to uninstall $packageName..." -Color Yellow
                try {
                    npm uninstall -g $packageName 2>$null
                    Write-ColorOutput "✅ Uninstalled $packageName" -Color Green
                }
                catch {
                    Write-ColorOutput "Failed to uninstall $packageName" -Color Yellow
                }
            }
        }
    }
    catch {
        Write-ColorOutput "Could not check global packages" -Color Yellow
    }
}

# Remove local data directory
$dataDir = "$env:USERPROFILE\.scaffold-scripts"
if (Test-Path $dataDir) {
    Write-ColorOutput "🗂️  Removing local data directory..." -Color Yellow
    Write-ColorOutput "Directory: $dataDir" -Color Yellow
    Write-ColorOutput "This contains your saved scripts and database." -Color Yellow
    $dataResponse = Read-Host "Remove local data? (y/N)"
    
    if ($dataResponse -match "^[yY]([eE][sS])?$") {
        Remove-Item -Recurse -Force $dataDir
        Write-ColorOutput "✅ Local data directory removed" -Color Green
    }
    else {
        Write-ColorOutput "ℹ️  Local data directory preserved at: $dataDir" -Color Blue
    }
}
else {
    Write-ColorOutput "ℹ️  No local data directory found" -Color Blue
}

# Check if command still exists
Write-ColorOutput "🔍 Verifying uninstallation..." -Color Yellow
if (Test-Command "scaffold") {
    Write-ColorOutput "⚠️  scaffold command still exists" -Color Yellow
    Write-ColorOutput "You may need to:" -Color Yellow
    Write-ColorOutput "  1. Restart your PowerShell session" -Color Yellow
    Write-ColorOutput "  2. Manually remove from PATH" -Color Yellow
    Write-ColorOutput "  3. Check for other installations" -Color Yellow
    
    # Show where it's located
    try {
        $scaffoldPath = (Get-Command scaffold).Source
        Write-ColorOutput "Current location: $scaffoldPath" -Color Yellow
    }
    catch {
        Write-ColorOutput "Current location: unknown" -Color Yellow
    }
}
else {
    Write-ColorOutput "✅ scaffold command successfully removed" -Color Green
}

# Remove PATH modifications
Write-ColorOutput "🔧 Checking PATH for npm global entries..." -Color Yellow

$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$systemPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

try {
    $npmPrefix = npm config get prefix 2>$null
    $pathModified = $false
    
    if ($npmPrefix -and $userPath -like "*$npmPrefix*") {
        Write-ColorOutput "Found npm global path in USER PATH: $npmPrefix" -Color Yellow
        $pathResponse = Read-Host "Remove npm global path from USER PATH? (y/N)"
        
        if ($pathResponse -match "^[yY]([eE][sS])?$") {
            $newUserPath = $userPath -replace [regex]::Escape($npmPrefix + ";"), "" -replace [regex]::Escape(";" + $npmPrefix), ""
            [Environment]::SetEnvironmentVariable("PATH", $newUserPath, "User")
            Write-ColorOutput "✅ Removed npm global path from USER PATH" -Color Green
            $pathModified = $true
        }
    }
    
    if ($pathModified) {
        Write-ColorOutput "Please restart PowerShell for PATH changes to take effect" -Color Yellow
    }
}
catch {
    Write-ColorOutput "Could not check npm global path" -Color Yellow
}

Write-ColorOutput "🎉 Uninstallation complete!" -Color Green
Write-Host ""
Write-ColorOutput "📝 Summary:" -Color Blue
Write-ColorOutput "  ✅ Removed scaffold command" -Color Blue
if ($dataResponse -match "^[yY]") {
    Write-ColorOutput "  ✅ Removed local data directory" -Color Blue
}
else {
    Write-ColorOutput "  ℹ️  Local data preserved" -Color Blue
}
Write-Host ""
Write-ColorOutput "Thank you for using Scaffold Scripts CLI!" -Color Blue

Write-Host ""
Write-ColorOutput "Press Enter to continue..." -Color Yellow
Read-Host