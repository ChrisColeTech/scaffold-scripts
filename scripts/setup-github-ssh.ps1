# Super Simple GitHub SSH Setup for Windows
# Avoids passphrase prompts entirely

param()

Write-Host ""
Write-Host "=== GitHub SSH Setup ===" -ForegroundColor Blue
Write-Host ""

# Prompt for email address
Write-Host "Enter your GitHub email address: " -NoNewline -ForegroundColor Yellow
$Email = Read-Host

if ([string]::IsNullOrWhiteSpace($Email)) {
    Write-Host "ERROR: Email address is required." -ForegroundColor Red
    exit 1
}

$SSHDir = "$env:USERPROFILE\.ssh"

# Create SSH directory
if (-not (Test-Path $SSHDir)) {
    Write-Host "Creating SSH directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $SSHDir | Out-Null
}

# Generate key with automated input
Write-Host "Generating SSH key (this will take a moment)..." -ForegroundColor Yellow

$keyPath = "$SSHDir\github_key"

# Generate SSH key with no passphrase
try {
    $args = @("-t", "ed25519", "-C", $Email, "-f", $keyPath, "-N", "")
    $result = & ssh-keygen.exe $args 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "SSH key generation failed: $result"
    }
} catch {
    Write-Host "Error generating SSH key: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run this manually:" -ForegroundColor Yellow
    Write-Host "ssh-keygen -t ed25519 -C $Email -f `"$keyPath`" -N `"`"" -ForegroundColor White
    exit 1
}

# Check if key was created
if (-not (Test-Path "$keyPath.pub")) {
    Write-Host "ERROR: SSH key generation failed." -ForegroundColor Red
    Write-Host "Please run this manually:" -ForegroundColor Yellow
    Write-Host "ssh-keygen -t ed25519 -C $Email -f $keyPath" -ForegroundColor White
    exit 1
}

Write-Host "✓ SSH key generated successfully!" -ForegroundColor Green

# Create SSH config
Write-Host "Creating SSH config..." -ForegroundColor Yellow
$configContent = @"
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_key
    IdentitiesOnly yes
"@

$configPath = "$SSHDir\config"
$configContent | Set-Content $configPath

# Fix permissions using icacls (most reliable on Windows)
Write-Host "Setting secure permissions..." -ForegroundColor Yellow
icacls.exe $SSHDir /inheritance:r /grant:r "${env:USERNAME}:(OI)(CI)F" | Out-Null
icacls.exe $keyPath /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
icacls.exe "$keyPath.pub" /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null
icacls.exe $configPath /inheritance:r /grant:r "${env:USERNAME}:F" | Out-Null

# Add to known hosts
Write-Host "Adding GitHub to known hosts..." -ForegroundColor Yellow
ssh-keyscan.exe github.com 2>$null | Add-Content "$SSHDir\known_hosts"

# Start SSH Agent and add key
Write-Host "Starting SSH Agent and adding key..." -ForegroundColor Yellow

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

try {
    # Check if ssh-agent service exists
    $sshAgentService = Get-Service -Name ssh-agent -ErrorAction SilentlyContinue
    if ($sshAgentService) {
        if ($sshAgentService.StartType -eq 'Disabled') {
            if ($isAdmin) {
                Write-Host "Enabling ssh-agent service..." -ForegroundColor Yellow
                Set-Service -Name ssh-agent -StartupType Manual
            } else {
                Write-Host "ssh-agent service is disabled and requires admin rights to enable." -ForegroundColor Yellow
                Write-Host "Please run PowerShell as Administrator or manually enable the service." -ForegroundColor Yellow
            }
        }
        
        if ($sshAgentService.Status -ne 'Running') {
            if ($isAdmin) {
                Write-Host "Starting ssh-agent service..." -ForegroundColor Yellow
                Start-Service ssh-agent
            } else {
                Write-Host "ssh-agent service requires admin rights to start." -ForegroundColor Yellow
                Write-Host "Please run PowerShell as Administrator or manually start the service." -ForegroundColor Yellow
            }
        }
        
        # Try to add the key regardless of service status
        Write-Host "Adding SSH key to agent..." -ForegroundColor Yellow
        $addResult = & ssh-add.exe $keyPath 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ SSH key added to agent!" -ForegroundColor Green
        } else {
            Write-Host "Could not add key to ssh-agent: $addResult" -ForegroundColor Yellow
            Write-Host "You can manually add it later with: ssh-add `"$keyPath`"" -ForegroundColor White
        }
    } else {
        Write-Host "SSH Agent service not available. Key not added to agent." -ForegroundColor Yellow
        Write-Host "You can manually add it later with: ssh-add `"$keyPath`"" -ForegroundColor White
    }
} catch {
    Write-Host "Could not manage SSH Agent: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "You can manually add the key later with: ssh-add `"$keyPath`"" -ForegroundColor White
}

Write-Host "✓ Setup complete!" -ForegroundColor Green
Write-Host ""

# Show public key
Write-Host "=== Your GitHub SSH Public Key ===" -ForegroundColor Blue
Get-Content "$keyPath.pub"
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Copy the key above" -ForegroundColor White
Write-Host "2. Go to https://github.com/settings/ssh/new" -ForegroundColor White
Write-Host "3. Paste the key and click 'Add SSH key'" -ForegroundColor White
Write-Host ""

# Test
Write-Host "Test connection now? (y/N): " -NoNewline -ForegroundColor Yellow
$test = Read-Host
if ($test -match "^[yY]") {
    Write-Host "Testing..." -ForegroundColor Yellow
    $result = ssh.exe -T git@github.com 2>&1
    if ($result -match "successfully authenticated") {
        Write-Host "✓ SUCCESS! You're connected to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "Connection not ready yet. Add the key to GitHub first." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "All done! Press Enter to exit." -ForegroundColor Green
Read-Host | Out-Null