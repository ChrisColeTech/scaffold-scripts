#!/bin/bash
# Cross-platform environment detection test
echo "🔍 Detecting platform and environment..."

# Platform detection
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="Linux"
    SHELL_TYPE="bash"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
    SHELL_TYPE="bash"
elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]]; then
    PLATFORM="Windows (MSYS/Cygwin)"
    SHELL_TYPE="bash"
else
    PLATFORM="Unknown"
    SHELL_TYPE="bash"
fi

echo "📋 Platform: $PLATFORM"
echo "🐚 Shell: $SHELL_TYPE"

# Check common tools
echo "🔧 Checking available tools..."
check_tool() {
    if command -v "$1" &> /dev/null; then
        echo "  ✅ $1: $(which $1)"
    else
        echo "  ❌ $1: Not found"
    fi
}

check_tool "node"
check_tool "npm"
check_tool "python"
check_tool "python3"
check_tool "git"
check_tool "docker"
check_tool "dotnet"

# Environment variables
echo "🌍 Environment variables:"
echo "  HOME: ${HOME:-Not set}"
echo "  PATH: ${PATH:-Not set}"
echo "  USER: ${USER:-Not set}"

# Create test directories and files
echo "📁 Testing file operations..."
mkdir -p test-platform/subdir
touch test-platform/test-file.txt
echo "Test content" > test-platform/test-file.txt

if [ -f "test-platform/test-file.txt" ]; then
    echo "  ✅ File creation successful"
    cat test-platform/test-file.txt
else
    echo "  ❌ File creation failed"
fi

# Cleanup
rm -rf test-platform
echo "✅ Cross-platform test completed!"