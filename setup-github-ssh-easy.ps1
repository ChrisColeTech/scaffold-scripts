# Super Simple GitHub SSH Setup for Windows
# Avoids passphrase prompts entirely

param()

$Email = "chris@chriscole.tech"
$SSHDir = "$env:USERPROFILE\.ssh"

Write-Host ""
Write-Host "=== GitHub SSH Setup ===" -ForegroundColor Blue
Write-Host ""

# Create SSH directory
if (-not (Test-Path $SSHDir)) {
    Write-Host "Creating SSH directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $SSHDir | Out-Null
}

# Generate key with automated input
Write-Host "Generating SSH key (this will take a moment)..." -ForegroundColor Yellow

$keyPath = "$SSHDir\github_key"

# Use PowerShell to handle the interactive prompts
$process = Start-Process -FilePath "ssh-keygen.exe" -ArgumentList @(
    "-t", "ed25519",
    "-C", $Email,
    "-f", $keyPath,
    "-q"
) -NoNewWindow -Wait -PassThru

# If that didn't work, try with explicit no passphrase
if ($process.ExitCode -ne 0 -or -not (Test-Path "$keyPath.pub")) {
    Write-Host "Trying alternative key generation method..." -ForegroundColor Yellow
    
    # Create a temporary response file
    $responseFile = "$env:TEMP\ssh_responses.txt"
    @("", "", "y") | Set-Content $responseFile
    
    Get-Content $responseFile | ssh-keygen.exe -t ed25519 -C $Email -f $keyPath
    Remove-Item $responseFile -ErrorAction SilentlyContinue
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