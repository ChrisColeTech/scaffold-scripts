# Quick fix for SSH permission issues on Windows
# Run this if you get "Bad permissions" errors

param()

# Configuration
$SSHDir = "$env:USERPROFILE\.ssh"

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

Write-ColorOutput "🔧 Fixing SSH Permissions on Windows" -Color Blue
Write-ColorOutput "====================================" -Color Blue

# Function to set proper Windows permissions on SSH files
function Set-SSHPermissions {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-ColorOutput "⚠️  File not found: $FilePath" -Color Yellow
        return
    }
    
    try {
        Write-ColorOutput "🔒 Fixing permissions on $(Split-Path $FilePath -Leaf)..." -Color Yellow
        
        # Remove inheritance and all existing permissions
        $acl = Get-Acl $FilePath
        $acl.SetAccessRuleProtection($true, $false)
        
        # Add only current user with full control
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "Allow")
        $acl.SetAccessRule($accessRule)
        
        # Apply the ACL
        Set-Acl -Path $FilePath -AclObject $acl
        Write-ColorOutput "✅ Fixed permissions on $(Split-Path $FilePath -Leaf)" -Color Green
    }
    catch {
        Write-ColorOutput "❌ Failed to fix permissions on $(Split-Path $FilePath -Leaf)" -Color Red
        Write-ColorOutput "Error: $($_.Exception.Message)" -Color Red
    }
}

# Check if SSH directory exists
if (-not (Test-Path $SSHDir)) {
    Write-ColorOutput "❌ SSH directory not found: $SSHDir" -Color Red
    exit 1
}

Write-ColorOutput "📁 Found SSH directory: $SSHDir" -Color Green

# Fix permissions on common SSH files
$filesToFix = @(
    "$SSHDir\config",
    "$SSHDir\github_key",
    "$SSHDir\github_key.pub",
    "$SSHDir\id_rsa",
    "$SSHDir\id_rsa.pub",
    "$SSHDir\id_ed25519",
    "$SSHDir\id_ed25519.pub",
    "$SSHDir\known_hosts"
)

$fixedCount = 0
foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Set-SSHPermissions -FilePath $file
        $fixedCount++
    }
}

if ($fixedCount -eq 0) {
    Write-ColorOutput "⚠️  No SSH files found to fix" -Color Yellow
} else {
    Write-ColorOutput "🎉 Fixed permissions on $fixedCount SSH files" -Color Green
}

# Test SSH connection
Write-Host ""
Write-ColorOutput "🧪 Testing GitHub SSH connection..." -Color Yellow
try {
    $result = ssh.exe -T git@github.com 2>&1
    if ($result -match "successfully authenticated") {
        Write-ColorOutput "✅ GitHub SSH connection successful!" -Color Green
    } else {
        Write-ColorOutput "❌ SSH connection still failing" -Color Red
        Write-ColorOutput "Output: $result" -Color Yellow
    }
} catch {
    Write-ColorOutput "❌ SSH test failed" -Color Red
    Write-ColorOutput "Error: $($_.Exception.Message)" -Color Red
}

Write-Host ""
Write-ColorOutput "🎉 Permission fix complete!" -Color Green