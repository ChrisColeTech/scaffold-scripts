#!/bin/bash
# React TypeScript Frontend Scaffold

echo "🚀 Creating React TypeScript project..."

# Create frontend directory and Vite project
mkdir -p frontend
cd frontend
npm create vite@latest app -- --template react-ts
cd app

echo "📁 Creating project structure..."

# Create directory structure
mkdir -p src/components/{common,layout,ui}
mkdir -p src/{hooks,services,utils,types,styles}
mkdir -p public/assets

# Create component files
touch src/components/layout/Header.tsx
touch src/components/layout/Footer.tsx
touch src/components/layout/Sidebar.tsx
touch src/components/common/LoadingSpinner.tsx
touch src/components/ui/Button.tsx
touch src/hooks/useApi.tsx
touch src/services/api.ts
touch src/utils/helpers.ts
touch src/types/index.ts

echo "📦 Installing additional packages..."
npm install @types/node axios react-router-dom
npm install -D @types/react-router-dom

echo "✅ React TypeScript project created successfully!"
echo "📁 Project location: $(pwd)"
echo "🔧 Run 'npm run dev' to start development server"