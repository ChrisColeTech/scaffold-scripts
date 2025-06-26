# Simple GitHub SSH Setup for Windows
# Reliable version with better error handling

param()

$ErrorActionPreference = "Continue"

# Configuration
$Email = "chris@chriscole.tech"
$KeyName = "github_key"
$SSHDir = "$env:USERPROFILE\.ssh"
$KeyPath = "$SSHDir\$KeyName"

Write-Host "GitHub SSH Setup for Windows" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue
Write-Host ""

# Create SSH directory
if (-not (Test-Path $SSHDir)) {
    Write-Host "Creating SSH directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $SSHDir | Out-Null
}

# Check for existing key
if (Test-Path $KeyPath) {
    Write-Host "SSH key already exists. Overwrite? (y/N): " -NoNewline -ForegroundColor Yellow
    $overwrite = Read-Host
    if ($overwrite -notmatch "^[yY]") {
        Write-Host "Using existing key." -ForegroundColor Green
    } else {
        Write-Host "Generating new SSH key (no passphrase)..." -ForegroundColor Yellow
        # Use echo to pipe empty responses to ssh-keygen
        "y" | ssh-keygen.exe -t ed25519 -C $Email -f $KeyPath -N '""'
    }
} else {
    Write-Host "Generating SSH key (no passphrase)..." -ForegroundColor Yellow
    # Use echo to pipe empty responses to ssh-keygen  
    "y" | ssh-keygen.exe -t ed25519 -C $Email -f $KeyPath -N '""'
}

# Create SSH config
Write-Host "Creating SSH config..." -ForegroundColor Yellow
$configPath = "$SSHDir\config"
$configContent = @"
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/$KeyName
    IdentitiesOnly yes
"@

# Backup existing config
if (Test-Path $configPath) {
    $backup = "$configPath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $configPath $backup
    Write-Host "Backed up existing config to: $(Split-Path $backup -Leaf)" -ForegroundColor Blue
}

# Write new config
$configContent | Set-Content -Path $configPath -Encoding UTF8

# Fix Windows permissions
Write-Host "Fixing Windows permissions..." -ForegroundColor Yellow
try {
    # Fix SSH directory permissions
    icacls.exe $SSHDir /inheritance:r /grant:r "${env:USERNAME}:(OI)(CI)F" | Out-Null
    
    # Fix individual file permissions
    icacls.exe $KeyPath /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
    icacls.exe "$KeyPath.pub" /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
    icacls.exe $configPath /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
    
    Write-Host "Fixed file permissions." -ForegroundColor Green
} catch {
    Write-Host "Could not fix permissions automatically." -ForegroundColor Yellow
    Write-Host "You may need to fix them manually." -ForegroundColor Yellow
}

# Add to known hosts
Write-Host "Adding GitHub to known hosts..." -ForegroundColor Yellow
ssh-keyscan.exe github.com | Add-Content "$SSHDir\known_hosts" 2>$null

# Display public key
Write-Host ""
Write-Host "Your GitHub SSH Public Key:" -ForegroundColor Blue
Write-Host "===========================" -ForegroundColor Blue
Get-Content "$KeyPath.pub"
Write-Host "===========================" -ForegroundColor Blue
Write-Host ""

# Instructions
Write-Host "Next Steps:" -ForegroundColor Green
Write-Host "1. Copy the public key above" -ForegroundColor White
Write-Host "2. Go to GitHub.com -> Settings -> SSH and GPG keys" -ForegroundColor White
Write-Host "3. Click 'New SSH key'" -ForegroundColor White
Write-Host "4. Paste the key and give it a title" -ForegroundColor White
Write-Host "5. Click 'Add SSH key'" -ForegroundColor White
Write-Host ""

# Test connection
Write-Host "Test connection? (y/N): " -NoNewline -ForegroundColor Yellow
$test = Read-Host
if ($test -match "^[yY]") {
    Write-Host "Testing connection..." -ForegroundColor Yellow
    $result = ssh.exe -T git@github.com 2>&1
    if ($result -match "successfully authenticated") {
        Write-Host "SUCCESS! SSH connection works!" -ForegroundColor Green
    } else {
        Write-Host "Connection failed. Make sure you added the key to GitHub." -ForegroundColor Red
        Write-Host "Error: $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host | Out-Null