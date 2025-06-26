#!/bin/bash
# GitHub SSH Setup Script
# Sets up SSH keys for GitHub authentication

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EMAIL="chris@chriscole.tech"
KEY_NAME="github_key"
SSH_DIR="$HOME/.ssh"
KEY_PATH="$SSH_DIR/$KEY_NAME"

echo -e "${BLUE}🔐 GitHub SSH Setup Script${NC}"
echo -e "${BLUE}===========================${NC}"
echo ""

# Check if SSH directory exists
if [[ ! -d "$SSH_DIR" ]]; then
    echo -e "${YELLOW}📁 Creating SSH directory...${NC}"
    mkdir -p "$SSH_DIR"
    chmod 700 "$SSH_DIR"
fi

# Check if key already exists
if [[ -f "$KEY_PATH" ]]; then
    echo -e "${YELLOW}⚠️  SSH key already exists at $KEY_PATH${NC}"
    echo -e "${YELLOW}Do you want to overwrite it? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[yY]([eE][sS])?$ ]]; then
        echo -e "${GREEN}✅ Using existing key${NC}"
        SKIP_KEYGEN=true
    fi
fi

# Generate SSH key
if [[ "$SKIP_KEYGEN" != "true" ]]; then
    echo -e "${YELLOW}🔑 Generating SSH key...${NC}"
    ssh-keygen -t ed25519 -C "$EMAIL" -f "$KEY_PATH" -N ""
    echo -e "${GREEN}✅ SSH key generated${NC}"
fi

# Start SSH agent and add key
echo -e "${YELLOW}🔧 Starting SSH agent and adding key...${NC}"
eval "$(ssh-agent -s)" > /dev/null
ssh-add "$KEY_PATH"
echo -e "${GREEN}✅ Key added to SSH agent${NC}"

# Create SSH config
echo -e "${YELLOW}⚙️  Creating SSH config...${NC}"
SSH_CONFIG="$SSH_DIR/config"

# Backup existing config if it exists
if [[ -f "$SSH_CONFIG" ]]; then
    cp "$SSH_CONFIG" "$SSH_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${BLUE}📋 Backed up existing SSH config${NC}"
fi

# Check if GitHub config already exists
if grep -q "Host github.com" "$SSH_CONFIG" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  GitHub SSH config already exists${NC}"
    echo -e "${YELLOW}Do you want to update it? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[yY]([eE][sS])?$ ]]; then
        # Remove existing GitHub config
        sed -i '/Host github.com/,/^$/d' "$SSH_CONFIG" 2>/dev/null || true
        UPDATE_CONFIG=true
    fi
else
    UPDATE_CONFIG=true
fi

if [[ "$UPDATE_CONFIG" == "true" ]]; then
    # Add GitHub config
    cat >> "$SSH_CONFIG" << EOF

Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/$KEY_NAME
    IdentitiesOnly yes
EOF
    chmod 600 "$SSH_CONFIG"
    echo -e "${GREEN}✅ SSH config updated${NC}"
fi

# Add GitHub to known hosts
echo -e "${YELLOW}🌐 Adding GitHub to known hosts...${NC}"
ssh-keyscan github.com >> "$SSH_DIR/known_hosts" 2>/dev/null
echo -e "${GREEN}✅ GitHub added to known hosts${NC}"

# Display public key
echo ""
echo -e "${BLUE}📋 Your GitHub SSH Public Key:${NC}"
echo -e "${BLUE}================================${NC}"
cat "$KEY_PATH.pub"
echo ""
echo -e "${BLUE}================================${NC}"

# Instructions
echo ""
echo -e "${GREEN}🎉 SSH key setup complete!${NC}"
echo ""
echo -e "${YELLOW}📖 Next Steps:${NC}"
echo -e "${YELLOW}1. Copy the public key above${NC}"
echo -e "${YELLOW}2. Go to GitHub.com → Settings → SSH and GPG keys${NC}"
echo -e "${YELLOW}3. Click 'New SSH key'${NC}"
echo -e "${YELLOW}4. Paste the key and give it a title${NC}"
echo -e "${YELLOW}5. Click 'Add SSH key'${NC}"
echo ""
echo -e "${BLUE}🧪 Test the connection:${NC}"
echo -e "${BLUE}  ssh -T git@github.com${NC}"
echo ""
echo -e "${BLUE}🔧 Configure git (if needed):${NC}"
echo -e "${BLUE}  git config --global user.name 'ChrisColeTech'${NC}"
echo -e "${BLUE}  git config --global user.email '$EMAIL'${NC}"
echo ""

# Offer to test connection
echo -e "${YELLOW}Would you like to test the GitHub connection now? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^[yY]([eE][sS])?$ ]]; then
    echo -e "${YELLOW}🧪 Testing GitHub connection...${NC}"
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        echo -e "${GREEN}✅ GitHub SSH connection successful!${NC}"
        echo -e "${GREEN}You're ready to push to GitHub repositories${NC}"
    else
        echo -e "${RED}❌ Connection failed${NC}"
        echo -e "${YELLOW}Make sure you've added the public key to GitHub first${NC}"
        echo -e "${YELLOW}Then run: ssh -T git@github.com${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🚀 Setup complete! You can now push to GitHub repositories.${NC}"