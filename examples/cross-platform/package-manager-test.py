#!/usr/bin/env python3
# Cross-platform package manager detection and testing
# Tests npm, pip, dotnet, and other package managers across platforms

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command):
    # Run a command and return the result
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            timeout=30
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_package_manager(name, version_command, install_command=None):
    # Check if a package manager is available and get its version
    print(f"🔍 Checking {name}...")
    
    success, stdout, stderr = run_command(version_command)
    if success:
        version = stdout.strip().split('\n')[0]
        print(f"  ✅ {name}: {version}")
        return True
    else:
        print(f"  ❌ {name}: Not found")
        if install_command:
            print(f"     Install with: {install_command}")
        return False

def test_package_operations():
    # Test basic package operations if tools are available
    print("\n📦 Testing package operations...")
    
    # Test npm if available
    if run_command("npm --version")[0]:
        print("  Testing npm...")
        
        # Create temporary package.json
        test_dir = Path("test-npm-project")
        test_dir.mkdir(exist_ok=True)
        os.chdir(test_dir)
        
        # Initialize npm project
        success, _, _ = run_command("npm init -y")
        if success:
            print("    ✅ npm init successful")
            
            # Test install a simple package
            success, _, _ = run_command("npm install lodash --save")
            if success:
                print("    ✅ npm install successful")
            else:
                print("    ❌ npm install failed")
        else:
            print("    ❌ npm init failed")
        
        # Cleanup
        os.chdir("..")
        import shutil
        shutil.rmtree(test_dir, ignore_errors=True)
    
    # Test pip if available
    if run_command("pip --version")[0]:
        print("  Testing pip...")
        success, _, _ = run_command("pip list")
        if success:
            print("    ✅ pip list successful")
        else:
            print("    ❌ pip list failed")

def main():
    print("🚀 Cross-platform Package Manager Test")
    print("=" * 50)
    
    # Platform info
    print(f"🖥️  Platform: {platform.system()} {platform.release()}")
    print(f"🐍 Python: {sys.version}")
    print(f"📂 Working Directory: {os.getcwd()}")
    print()
    
    # Package managers to check
    package_managers = [
        ("Node.js", "node --version", "https://nodejs.org/"),
        ("npm", "npm --version", "Comes with Node.js"),
        ("Python", "python --version", "https://python.org/"),
        ("pip", "pip --version", "Comes with Python"),
        ("Git", "git --version", "https://git-scm.com/"),
        (".NET", "dotnet --version", "https://dotnet.microsoft.com/"),
        ("Docker", "docker --version", "https://docker.com/"),
        ("Yarn", "yarn --version", "npm install -g yarn"),
        ("pnpm", "pnpm --version", "npm install -g pnpm"),
    ]
    
    available_managers = []
    for name, version_cmd, install_info in package_managers:
        if check_package_manager(name, version_cmd, install_info):
            available_managers.append(name)
    
    print(f"\n✅ Available package managers: {', '.join(available_managers)}")
    
    # Test operations
    test_package_operations()
    
    print("\n🎯 Platform-specific recommendations:")
    system = platform.system().lower()
    if "windows" in system:
        print("  • Use PowerShell or Command Prompt")
        print("  • Consider Windows Package Manager (winget)")
        print("  • Use Chocolatey for package management")
    elif "linux" in system:
        print("  • Use your distribution's package manager (apt, yum, etc.)")
        print("  • Consider using Snap or Flatpak")
    elif "darwin" in system:
        print("  • Use Homebrew for package management")
        print("  • Consider MacPorts as alternative")
    
    print("\n✅ Cross-platform package manager test completed!")

if __name__ == "__main__":
    main()