# GitHub SSH Setup Script for Windows
# Sets up SSH keys for GitHub authentication

param()

# Configuration
$Email = "chris@chriscole.tech"
$KeyName = "github_key"
$SSHDir = "$env:USERPROFILE\.ssh"
$KeyPath = "$SSHDir\$KeyName"

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

Write-ColorOutput "🔐 GitHub SSH Setup Script" -Color Blue
Write-ColorOutput "===========================" -Color Blue
Write-Host ""

# Check if SSH directory exists
if (-not (Test-Path $SSHDir)) {
    Write-ColorOutput "📁 Creating SSH directory..." -Color Yellow
    New-Item -ItemType Directory -Force -Path $SSHDir | Out-Null
}

# Check if OpenSSH is available
try {
    ssh-keygen.exe -h | Out-Null
    Write-ColorOutput "✅ OpenSSH found" -Color Green
} catch {
    Write-ColorOutput "❌ OpenSSH not found" -Color Red
    Write-ColorOutput "Please install OpenSSH:" -Color Yellow
    Write-ColorOutput "  Settings → Apps → Optional Features → Add OpenSSH Client" -Color Yellow
    exit 1
}

# Check if key already exists
$SkipKeygen = $false
if (Test-Path $KeyPath) {
    Write-ColorOutput "⚠️  SSH key already exists at $KeyPath" -Color Yellow
    Write-Host "Do you want to overwrite it? (y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    if ($response -notmatch "^[yY]([eE][sS])?$") {
        Write-ColorOutput "✅ Using existing key" -Color Green
        $SkipKeygen = $true
    }
}

# Generate SSH key
if (-not $SkipKeygen) {
    Write-ColorOutput "🔑 Generating SSH key..." -Color Yellow
    ssh-keygen.exe -t ed25519 -C $Email -f $KeyPath -N '""'
    Write-ColorOutput "✅ SSH key generated" -Color Green
    
    # Set proper permissions on SSH keys
    Set-SSHPermissions -FilePath $KeyPath
    Set-SSHPermissions -FilePath "$KeyPath.pub"
}

# Start SSH agent and add key
Write-ColorOutput "🔧 Starting SSH agent and adding key..." -Color Yellow
try {
    # Check if ssh-agent service exists and start it
    $sshAgentService = Get-Service ssh-agent -ErrorAction SilentlyContinue
    if ($sshAgentService) {
        if ($sshAgentService.Status -ne 'Running') {
            Start-Service ssh-agent -ErrorAction SilentlyContinue
            Write-ColorOutput "✅ Started SSH agent service" -Color Green
        }
    }
    
    # Add key to agent
    $addResult = ssh-add.exe $KeyPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Key added to SSH agent" -Color Green
    } else {
        Write-ColorOutput "⚠️  Could not add to SSH agent (this is often normal on Windows)" -Color Yellow
    }
} catch {
    Write-ColorOutput "⚠️  Could not start SSH agent (this is often normal on Windows)" -Color Yellow
}

# Create SSH config
Write-ColorOutput "⚙️  Creating SSH config..." -Color Yellow
$SSHConfig = "$SSHDir\config"

# Backup existing config if it exists
if (Test-Path $SSHConfig) {
    $backupName = "config.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item $SSHConfig "$SSHDir\$backupName"
    Write-ColorOutput "📋 Backed up existing SSH config" -Color Blue
}

# Function to set proper Windows permissions on SSH files
function Set-SSHPermissions {
    param([string]$FilePath)
    
    try {
        # Remove inheritance and all existing permissions
        $acl = Get-Acl $FilePath
        $acl.SetAccessRuleProtection($true, $false)
        
        # Add only current user with full control
        $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
        $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($currentUser, "FullControl", "Allow")
        $acl.SetAccessRule($accessRule)
        
        # Apply the ACL
        Set-Acl -Path $FilePath -AclObject $acl
        Write-ColorOutput "✅ Set secure permissions on $FilePath" -Color Green
    }
    catch {
        Write-ColorOutput "⚠️  Could not set permissions on $FilePath" -Color Yellow
        Write-ColorOutput "You may need to fix permissions manually" -Color Yellow
    }
}

# Check if GitHub config already exists
$UpdateConfig = $true
if (Test-Path $SSHConfig) {
    $configContent = Get-Content $SSHConfig -Raw
    if ($configContent -match "Host github\.com") {
        Write-ColorOutput "⚠️  GitHub SSH config already exists" -Color Yellow
        Write-Host "Do you want to update it? (y/N): " -NoNewline -ForegroundColor Yellow
        $response = Read-Host
        if ($response -notmatch "^[yY]([eE][sS])?$") {
            $UpdateConfig = $false
        } else {
            # Remove existing GitHub config
            $configLines = Get-Content $SSHConfig
            $newConfig = @()
            $skipLines = $false
            
            foreach ($line in $configLines) {
                if ($line -match "Host github\.com") {
                    $skipLines = $true
                    continue
                }
                if ($skipLines -and $line -match "^\s*$") {
                    $skipLines = $false
                    continue
                }
                if (-not $skipLines) {
                    $newConfig += $line
                }
            }
            
            $newConfig | Set-Content $SSHConfig
        }
    }
}

if ($UpdateConfig) {
    # Add GitHub config
    $githubConfig = @"

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/$KeyName
    IdentitiesOnly yes
"@
    
    Add-Content -Path $SSHConfig -Value $githubConfig
    Write-ColorOutput "✅ SSH config updated" -Color Green
    
    # Set proper permissions on config file
    Set-SSHPermissions -FilePath $SSHConfig
}

# Add GitHub to known hosts
Write-ColorOutput "🌐 Adding GitHub to known hosts..." -Color Yellow
try {
    ssh-keyscan.exe github.com | Add-Content "$SSHDir\known_hosts"
    Write-ColorOutput "✅ GitHub added to known hosts" -Color Green
} catch {
    Write-ColorOutput "⚠️  Could not add to known hosts (manual verification may be needed)" -Color Yellow
}

# Display public key
Write-Host ""
Write-ColorOutput "📋 Your GitHub SSH Public Key:" -Color Blue
Write-ColorOutput "================================" -Color Blue
Get-Content "$KeyPath.pub"
Write-Host ""
Write-ColorOutput "================================" -Color Blue

# Instructions
Write-Host ""
Write-ColorOutput "🎉 SSH key setup complete!" -Color Green
Write-Host ""
Write-ColorOutput "📖 Next Steps:" -Color Yellow
Write-ColorOutput "1. Copy the public key above" -Color Yellow
Write-ColorOutput "2. Go to GitHub.com → Settings → SSH and GPG keys" -Color Yellow
Write-ColorOutput "3. Click 'New SSH key'" -Color Yellow
Write-ColorOutput "4. Paste the key and give it a title" -Color Yellow
Write-ColorOutput "5. Click 'Add SSH key'" -Color Yellow
Write-Host ""
Write-ColorOutput "🧪 Test the connection:" -Color Blue
Write-ColorOutput "  ssh -T git@github.com" -Color Blue
Write-Host ""
Write-ColorOutput "🔧 Configure git (if needed):" -Color Blue
Write-ColorOutput "  git config --global user.name 'ChrisColeTech'" -Color Blue
Write-ColorOutput "  git config --global user.email '$Email'" -Color Blue
Write-Host ""

# Offer to test connection
Write-Host "Would you like to test the GitHub connection now? (y/N): " -NoNewline -ForegroundColor Yellow
$response = Read-Host
if ($response -match "^[yY]([eE][sS])?$") {
    Write-ColorOutput "🧪 Testing GitHub connection..." -Color Yellow
    try {
        $result = ssh.exe -T git@github.com 2>&1
        if ($result -match "successfully authenticated") {
            Write-ColorOutput "✅ GitHub SSH connection successful!" -Color Green
            Write-ColorOutput "You're ready to push to GitHub repositories" -Color Green
        } else {
            Write-ColorOutput "❌ Connection failed" -Color Red
            Write-ColorOutput "Output: $result" -Color Yellow
            Write-ColorOutput "Make sure you've added the public key to GitHub first" -Color Yellow
            Write-ColorOutput "Then run: ssh -T git@github.com" -Color Yellow
        }
    } catch {
        Write-ColorOutput "❌ Connection test failed" -Color Red
        Write-ColorOutput "Make sure you've added the public key to GitHub first" -Color Yellow
    }
}

Write-Host ""
Write-ColorOutput "🚀 Setup complete! You can now push to GitHub repositories." -Color Green

Write-Host ""
Write-ColorOutput "Press Enter to continue..." -Color Yellow
Read-Host