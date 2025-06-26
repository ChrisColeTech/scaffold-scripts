#!/bin/bash
# Scaffold Scripts CLI - Unix/Linux/macOS Installer

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/yourusername/scaffold-scripts"
LATEST_RELEASE_URL="https://api.github.com/repos/yourusername/scaffold-scripts/releases/latest"
INSTALL_DIR="$HOME/.scaffold-scripts"
BIN_DIR="$HOME/.local/bin"

echo -e "${BLUE}🚀 Scaffold Scripts CLI Installer${NC}"
echo -e "${BLUE}===================================${NC}"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}❌ This script should not be run as root${NC}"
   exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 16+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION'))" 2>/dev/null; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old${NC}"
    echo -e "${YELLOW}Please upgrade to Node.js 16+ from https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $NODE_VERSION detected${NC}"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm detected${NC}"

# Create directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"

# Install via npm
echo -e "${YELLOW}📦 Installing Scaffold Scripts CLI...${NC}"
if npm install -g scaffold-scripts; then
    echo -e "${GREEN}✅ Successfully installed scaffold-scripts${NC}"
else
    echo -e "${RED}❌ Failed to install via npm${NC}"
    echo -e "${YELLOW}Trying alternative installation method...${NC}"
    
    # Alternative: Install from source
    if command_exists git; then
        echo -e "${YELLOW}📥 Cloning repository...${NC}"
        cd /tmp
        rm -rf scaffold-scripts
        git clone "$REPO_URL.git"
        cd scaffold-scripts
        
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
        
        echo -e "${YELLOW}🔨 Building project...${NC}"
        npm run build
        
        echo -e "${YELLOW}🔗 Installing globally...${NC}"
        npm install -g .
        
        cd ..
        rm -rf scaffold-scripts
        
        echo -e "${GREEN}✅ Successfully installed from source${NC}"
    else
        echo -e "${RED}❌ Git not found. Cannot install from source${NC}"
        exit 1
    fi
fi

# Verify installation
echo -e "${YELLOW}🔍 Verifying installation...${NC}"
if command_exists scaffold; then
    echo -e "${GREEN}✅ scaffold command is available${NC}"
    INSTALLED_VERSION=$(scaffold --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}📋 Installed version: $INSTALLED_VERSION${NC}"
else
    echo -e "${RED}❌ scaffold command not found${NC}"
    echo -e "${YELLOW}You may need to restart your terminal or add npm global bin to your PATH${NC}"
    echo -e "${YELLOW}Run: export PATH=\"\$(npm config get prefix)/bin:\$PATH\"${NC}"
fi

# Add to shell profile if needed
SHELL_PROFILE=""
if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_PROFILE="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_PROFILE="$HOME/.bashrc"
fi

if [[ -n "$SHELL_PROFILE" ]] && [[ -f "$SHELL_PROFILE" ]]; then
    if ! grep -q "npm config get prefix" "$SHELL_PROFILE"; then
        echo -e "${YELLOW}🔧 Adding npm global bin to PATH in $SHELL_PROFILE${NC}"
        echo 'export PATH="$(npm config get prefix)/bin:$PATH"' >> "$SHELL_PROFILE"
        echo -e "${GREEN}✅ Added to $SHELL_PROFILE${NC}"
        echo -e "${YELLOW}Please restart your terminal or run: source $SHELL_PROFILE${NC}"
    fi
fi

echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo -e "${BLUE}📖 Quick Start:${NC}"
echo -e "${BLUE}  scaffold --help                    # Show help${NC}"
echo -e "${BLUE}  scaffold list                      # List available commands${NC}"
echo -e "${BLUE}  scaffold add frontend react script.txt  # Add command${NC}"
echo -e "${BLUE}  scaffold -f react                  # Run frontend scaffold${NC}"
echo ""
echo -e "${BLUE}📚 Documentation: $REPO_URL${NC}"