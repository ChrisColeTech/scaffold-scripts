#!/usr/bin/env python3
"""
Python FastAPI Backend Scaffold
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Run a shell command and print status"""
    print(f"🔧 {description}...")
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Failed: {description}")
        print(f"Error: {result.stderr}")
        return False
    
    if result.stdout:
        print(result.stdout)
    
    return True

def main():
    print("🚀 Creating Python FastAPI project...")
    
    # Create backend directory
    os.makedirs("backend", exist_ok=True)
    os.chdir("backend")
    
    print("📁 Creating project structure...")
    
    # Create directory structure
    directories = [
        "app/api/v1",
        "app/core",
        "app/models",
        "app/schemas",
        "app/services",
        "app/db",
        "tests",
        "migrations"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
    
    # Create __init__.py files
    init_files = [
        "app/__init__.py",
        "app/api/__init__.py",
        "app/api/v1/__init__.py",
        "app/core/__init__.py",
        "app/models/__init__.py",
        "app/schemas/__init__.py",
        "app/services/__init__.py",
        "app/db/__init__.py",
        "tests/__init__.py"
    ]
    
    for init_file in init_files:
        with open(init_file, 'w') as f:
            f.write("")
    
    # Create main application files
    files_content = {
        "app/main.py": '''from fastapi import FastAPI
from app.api.v1 import router

app = FastAPI(title="FastAPI Backend", version="1.0.0")

app.include_router(router.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "FastAPI Backend is running!"}
''',
        "app/api/v1/router.py": '''from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}
''',
        "requirements.txt": '''fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.4.0
python-dotenv>=1.0.0
sqlalchemy>=2.0.0
alembic>=1.12.0
''',
        ".env.example": '''DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
DEBUG=True
''',
        "README.md": '''# FastAPI Backend

## Setup

1. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
'''
    }
    
    for file_path, content in files_content.items():
        with open(file_path, 'w') as f:
            f.write(content)
    
    print("🐍 Creating Python virtual environment...")
    if not run_command("python -m venv venv", "Creating virtual environment"):
        print("⚠️  Continuing without virtual environment...")
    
    print("📦 Installing dependencies...")
    pip_command = "venv/Scripts/pip" if os.name == 'nt' else "venv/bin/pip"
    
    if not run_command(f"{pip_command} install -r requirements.txt", "Installing dependencies"):
        print("⚠️  You may need to manually install dependencies later")
        print("Run: pip install -r requirements.txt")
    
    print("✅ Python FastAPI project created successfully!")
    print(f"📁 Project location: {os.getcwd()}")
    print("🔧 To start the server:")
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("   uvicorn app.main:app --reload")

if __name__ == "__main__":
    main()