# Cross-platform environment detection test - PowerShell version
Write-Host "🔍 Detecting platform and environment..." -ForegroundColor Blue

# Platform detection
$Platform = "Unknown"
$ShellType = "PowerShell"

if ($IsWindows -or $env:OS -eq "Windows_NT") {
    $Platform = "Windows"
} elseif ($IsLinux) {
    $Platform = "Linux"
} elseif ($IsMacOS) {
    $Platform = "macOS"
} else {
    $Platform = $env:OS
}

Write-Host "📋 Platform: $Platform" -ForegroundColor Yellow
Write-Host "🐚 Shell: $ShellType" -ForegroundColor Yellow

# Check common tools
Write-Host "🔧 Checking available tools..." -ForegroundColor Yellow
function Test-Tool {
    param($ToolName)
    try {
        $command = Get-Command $ToolName -ErrorAction Stop
        Write-Host "  ✅ $ToolName`: $($command.Source)" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ $ToolName`: Not found" -ForegroundColor Red
    }
}

Test-Tool "node"
Test-Tool "npm"
Test-Tool "python"
Test-Tool "git"
Test-Tool "docker"
Test-Tool "dotnet"

# Environment variables
Write-Host "🌍 Environment variables:" -ForegroundColor Yellow
Write-Host "  HOME: $($env:HOME ?? $env:USERPROFILE ?? 'Not set')" -ForegroundColor Cyan
Write-Host "  PATH: $($env:PATH ?? 'Not set')" -ForegroundColor Cyan
Write-Host "  USER: $($env:USER ?? $env:USERNAME ?? 'Not set')" -ForegroundColor Cyan

# Test file operations
Write-Host "📁 Testing file operations..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "test-platform\subdir" | Out-Null
New-Item -ItemType File -Force -Path "test-platform\test-file.txt" -Value "Test content" | Out-Null

if (Test-Path "test-platform\test-file.txt") {
    Write-Host "  ✅ File creation successful" -ForegroundColor Green
    $content = Get-Content "test-platform\test-file.txt"
    Write-Host "  Content: $content" -ForegroundColor Cyan
} else {
    Write-Host "  ❌ File creation failed" -ForegroundColor Red
}

# Cleanup
Remove-Item -Recurse -Force -Path "test-platform" -ErrorAction SilentlyContinue
Write-Host "✅ Cross-platform test completed!" -ForegroundColor Green