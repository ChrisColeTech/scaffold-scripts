#!/bin/bash
# Scaffold Scripts CLI - Uninstaller for Unix/Linux/macOS
# Usage: curl -fsSL https://raw.githubusercontent.com/ChrisColeTech/scaffold-scripts/main/uninstall.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗑️  Scaffold Scripts CLI Uninstaller${NC}"
echo -e "${BLUE}====================================${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if scaffold is installed
if ! command_exists scaffold; then
    echo -e "${YELLOW}⚠️  Scaffold Scripts CLI is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Nothing to uninstall.${NC}"
    exit 0
fi

echo -e "${YELLOW}🔍 Found Scaffold Scripts CLI installation${NC}"

# Get current version before uninstalling
CURRENT_VERSION=$(scaffold --version 2>/dev/null || echo "unknown")
echo -e "${BLUE}📋 Current version: $CURRENT_VERSION${NC}"

# Confirm uninstallation
echo -e "${YELLOW}⚠️  This will completely remove Scaffold Scripts CLI${NC}"
echo -e "${YELLOW}Are you sure you want to continue? (y/N)${NC}"
read -r response

case "$response" in
    [yY][eE][sS]|[yY])
        echo -e "${BLUE}🗑️  Proceeding with uninstallation...${NC}"
        ;;
    *)
        echo -e "${GREEN}✅ Uninstallation cancelled${NC}"
        exit 0
        ;;
esac

# Check if npm is available
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not available${NC}"
    echo -e "${YELLOW}Cannot automatically uninstall. Please remove manually:${NC}"
    echo -e "${YELLOW}  1. Remove scaffold command from your PATH${NC}"
    echo -e "${YELLOW}  2. Delete ~/.scaffold-scripts directory${NC}"
    exit 1
fi

# Uninstall using npm
echo -e "${YELLOW}📦 Uninstalling scaffold-scripts package...${NC}"
if npm uninstall -g scaffold-scripts 2>/dev/null; then
    echo -e "${GREEN}✅ Package uninstalled via npm${NC}"
else
    # Try alternative package names
    echo -e "${YELLOW}⚠️  Package not found, trying alternative names...${NC}"
    
    # Get list of global packages and find scaffold-related ones
    GLOBAL_PACKAGES=$(npm list -g --depth=0 2>/dev/null | grep -i scaffold || echo "")
    
    if [[ -n "$GLOBAL_PACKAGES" ]]; then
        echo -e "${YELLOW}Found scaffold-related packages:${NC}"
        echo "$GLOBAL_PACKAGES"
        
        # Try to extract package name and uninstall
        PACKAGE_NAME=$(echo "$GLOBAL_PACKAGES" | grep -o '@[^@]*scaffold[^@]*' | head -1)
        if [[ -n "$PACKAGE_NAME" ]]; then
            echo -e "${YELLOW}Attempting to uninstall $PACKAGE_NAME...${NC}"
            npm uninstall -g "$PACKAGE_NAME" 2>/dev/null || echo -e "${YELLOW}Failed to uninstall $PACKAGE_NAME${NC}"
        fi
    fi
fi

# Remove local data directory
DATA_DIR="$HOME/.scaffold-scripts"
if [[ -d "$DATA_DIR" ]]; then
    echo -e "${YELLOW}🗂️  Removing local data directory...${NC}"
    echo -e "${YELLOW}Directory: $DATA_DIR${NC}"
    echo -e "${YELLOW}This contains your saved scripts and database.${NC}"
    echo -e "${YELLOW}Remove local data? (y/N)${NC}"
    read -r data_response
    
    case "$data_response" in
        [yY][eE][sS]|[yY])
            rm -rf "$DATA_DIR"
            echo -e "${GREEN}✅ Local data directory removed${NC}"
            ;;
        *)
            echo -e "${BLUE}ℹ️  Local data directory preserved at: $DATA_DIR${NC}"
            ;;
    esac
else
    echo -e "${BLUE}ℹ️  No local data directory found${NC}"
fi

# Check if command still exists
echo -e "${YELLOW}🔍 Verifying uninstallation...${NC}"
if command_exists scaffold; then
    echo -e "${YELLOW}⚠️  scaffold command still exists${NC}"
    echo -e "${YELLOW}You may need to:${NC}"
    echo -e "${YELLOW}  1. Restart your terminal${NC}"
    echo -e "${YELLOW}  2. Manually remove from PATH${NC}"
    echo -e "${YELLOW}  3. Check for other installations${NC}"
    
    # Show where it's located
    SCAFFOLD_PATH=$(which scaffold 2>/dev/null || echo "unknown")
    echo -e "${YELLOW}Current location: $SCAFFOLD_PATH${NC}"
else
    echo -e "${GREEN}✅ scaffold command successfully removed${NC}"
fi

# Remove PATH modifications from shell profiles
echo -e "${YELLOW}🔧 Checking shell profiles for PATH modifications...${NC}"

SHELL_PROFILES=("$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile")
MODIFIED_FILES=()

for profile in "${SHELL_PROFILES[@]}"; do
    if [[ -f "$profile" ]] && grep -q "scaffold\|npm config get prefix" "$profile"; then
        echo -e "${YELLOW}Found potential scaffold-related entries in: $profile${NC}"
        MODIFIED_FILES+=("$profile")
    fi
done

if [[ ${#MODIFIED_FILES[@]} -gt 0 ]]; then
    echo -e "${YELLOW}Remove scaffold-related PATH entries from shell profiles? (y/N)${NC}"
    read -r path_response
    
    case "$path_response" in
        [yY][eE][sS]|[yY])
            for profile in "${MODIFIED_FILES[@]}"; do
                # Create backup
                cp "$profile" "$profile.backup.$(date +%Y%m%d_%H%M%S)"
                
                # Remove lines containing npm global path exports that might be scaffold-related
                grep -v "npm config get prefix" "$profile" > "$profile.tmp" && mv "$profile.tmp" "$profile"
                echo -e "${GREEN}✅ Cleaned $profile (backup created)${NC}"
            done
            echo -e "${YELLOW}Please restart your terminal or source your shell profile${NC}"
            ;;
        *)
            echo -e "${BLUE}ℹ️  Shell profiles left unchanged${NC}"
            ;;
    esac
fi

echo -e "${GREEN}🎉 Uninstallation complete!${NC}"
echo ""
echo -e "${BLUE}📝 Summary:${NC}"
echo -e "${BLUE}  ✅ Removed scaffold command${NC}"
if [[ "$data_response" == [yY]* ]]; then
    echo -e "${BLUE}  ✅ Removed local data directory${NC}"
else
    echo -e "${BLUE}  ℹ️  Local data preserved${NC}"
fi
echo ""
echo -e "${BLUE}Thank you for using Scaffold Scripts CLI!${NC}"