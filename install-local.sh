#!/bin/bash
# Local installation script for development/testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Scaffold Scripts CLI - Local Install${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare versions
version_gt() {
    test "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1"
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

echo -e "${GREEN}✅ Node.js v$NODE_VERSION detected${NC}"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm detected${NC}"

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo -e "${YELLOW}📁 Installing from: $SCRIPT_DIR${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
npm run build

# Install globally
echo -e "${YELLOW}🔗 Installing globally...${NC}"
npm install -g .

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

echo -e "${GREEN}🎉 Local installation complete!${NC}"
echo ""
echo -e "${BLUE}📖 Quick Start:${NC}"
echo -e "${BLUE}  scaffold --help                    # Show help${NC}"
echo -e "${BLUE}  scaffold list                      # List available commands${NC}"
echo -e "${BLUE}  scaffold add frontend react script.txt  # Add command${NC}"
echo -e "${BLUE}  scaffold -f react                  # Run frontend scaffold${NC}"