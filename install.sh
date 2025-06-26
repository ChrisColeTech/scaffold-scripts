#!/bin/bash
# Scaffold Scripts CLI - GitHub Repository Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/yourusername/scaffold-scripts/main/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/yourusername/scaffold-scripts"
INSTALL_DIR="$HOME/.scaffold-scripts"

# Function to compare versions
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
}

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

if version_gt "$REQUIRED_VERSION" "$NODE_VERSION"; then
    echo -e "${RED}❌ Node.js version v$NODE_VERSION is too old${NC}"
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

# Create install directory
echo -e "${YELLOW}📁 Creating install directory...${NC}"
mkdir -p "$INSTALL_DIR"

# Check if Git is available
if ! command_exists git; then
    echo -e "${RED}❌ Git not found${NC}"
    echo -e "${YELLOW}Please install Git first: https://git-scm.com${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git detected${NC}"

# Install from GitHub repository
echo -e "${YELLOW}📥 Cloning Scaffold Scripts from GitHub...${NC}"
cd /tmp
rm -rf scaffold-scripts
git clone "$REPO_URL.git" scaffold-scripts
cd scaffold-scripts

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

echo -e "${YELLOW}🔗 Installing globally...${NC}"
npm install -g .

# Cleanup
cd /tmp
rm -rf scaffold-scripts

echo -e "${GREEN}✅ Successfully installed Scaffold Scripts from GitHub${NC}"

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