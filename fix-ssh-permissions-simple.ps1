# Simple SSH Permission Fix for Windows
# Uses icacls (built-in Windows tool) for better reliability

param()

$SSHDir = "$env:USERPROFILE\.ssh"

Write-Host "Fixing SSH Permissions on Windows" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

if (-not (Test-Path $SSHDir)) {
    Write-Host "ERROR: SSH directory not found: $SSHDir" -ForegroundColor Red
    exit 1
}

Write-Host "Found SSH directory: $SSHDir" -ForegroundColor Green
Write-Host ""

# Get list of SSH files
$sshFiles = Get-ChildItem $SSHDir -File | Where-Object { 
    $_.Name -match "\.(pub|key)$" -or 
    $_.Name -eq "config" -or 
    $_.Name -eq "known_hosts" -or
    $_.Name -match "^id_" -or
    $_.Name -match "github_key"
}

if ($sshFiles.Count -eq 0) {
    Write-Host "No SSH files found to fix." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found SSH files:" -ForegroundColor Yellow
$sshFiles | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }
Write-Host ""

# Fix permissions using icacls (more reliable on Windows)
Write-Host "Fixing permissions..." -ForegroundColor Yellow

# Fix SSH directory permissions first
Write-Host "Fixing directory permissions..." -ForegroundColor Gray
icacls.exe $SSHDir /inheritance:r /grant:r "${env:USERNAME}:(OI)(CI)F" | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Fixed directory permissions" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to fix directory permissions" -ForegroundColor Red
}

# Fix each file
foreach ($file in $sshFiles) {
    Write-Host "Fixing $($file.Name)..." -ForegroundColor Gray
    $result = icacls.exe $file.FullName /inheritance:r /grant:r "${env:USERNAME}:F" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Fixed $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to fix $($file.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$result = ssh.exe -T git@github.com 2>&1
if ($result -match "successfully authenticated") {
    Write-Host "✓ SSH connection successful!" -ForegroundColor Green
} elseif ($result -match "Permission denied") {
    Write-Host "✗ Still getting permission denied" -ForegroundColor Red
    Write-Host "You may need to add your public key to GitHub" -ForegroundColor Yellow
} else {
    Write-Host "Connection result: $result" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Permission fix complete!" -ForegroundColor Green
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host | Out-Null