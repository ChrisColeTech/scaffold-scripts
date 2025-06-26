#!/bin/bash
# Test script to verify installer structure without actually installing

echo "🧪 Testing installer structure..."

# Test the main components of install.sh
echo "✅ Checking install.sh structure:"
if grep -q "git clone" install.sh; then
    echo "  ✅ Has git clone command"
else
    echo "  ❌ Missing git clone command"
fi

if grep -q "npm install" install.sh; then
    echo "  ✅ Has npm install command"
else
    echo "  ❌ Missing npm install command"
fi

if grep -q "npm run build" install.sh; then
    echo "  ✅ Has npm run build command"
else
    echo "  ❌ Missing npm run build command"
fi

if grep -q "npm install -g" install.sh; then
    echo "  ✅ Has global npm install command"
else
    echo "  ❌ Missing global npm install command"
fi

echo ""
echo "✅ Checking install.ps1 structure:"
if grep -q "git clone" install.ps1; then
    echo "  ✅ Has git clone command"
else
    echo "  ❌ Missing git clone command"
fi

if grep -q "npm install" install.ps1; then
    echo "  ✅ Has npm install command"
else
    echo "  ❌ Missing npm install command"
fi

if grep -q "npm run build" install.ps1; then
    echo "  ✅ Has npm run build command"
else
    echo "  ❌ Missing npm run build command"
fi

if grep -q "npm install -g" install.ps1; then
    echo "  ✅ Has global npm install command"
else
    echo "  ❌ Missing global npm install command"
fi

echo ""
echo "🎉 Installer structure test complete!"