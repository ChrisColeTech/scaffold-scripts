#!/usr/bin/env node
/**
 * Next.js Application Scaffold - Node.js Version
 * Creates a Next.js app with TypeScript and Tailwind CSS
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Next.js application...');

// Create Next.js app with TypeScript
process.chdir('frontend');
console.log('📦 Setting up Next.js with TypeScript and Tailwind...');
execSync('npx create-next-app@latest app --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"', { stdio: 'inherit' });

process.chdir('app');

// Create directory structure
console.log('📁 Creating directory structure...');
const directories = [
    'src/components/ui',
    'src/components/layout',
    'src/components/forms',
    'src/lib/utils',
    'src/lib/hooks',
    'src/lib/api',
    'src/types',
    'src/store',
    'src/styles/components',
    'public/images',
    'public/icons'
];

directories.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✓ Created ${dir}`);
});

// Create component files
console.log('📄 Creating component files...');
const files = {
    'src/components/ui/Button.tsx': `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};`,

    'src/components/layout/Header.tsx': `import React from 'react';
import Link from 'next/link';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MyApp
            </Link>
          </div>
          <nav className="flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};`,

    'src/lib/utils/cn.ts': `import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,

    'src/lib/api/client.ts': `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = \`\${this.baseURL}\${endpoint}\`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();`,

    'src/types/index.ts': `export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}`
};

Object.entries(files).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Created ${filePath}`);
});

// Install additional dependencies
console.log('📦 Installing additional dependencies...');
const dependencies = [
    'clsx',
    'tailwind-merge',
    '@types/node',
    'lucide-react'
];

execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });

// Create environment files
console.log('⚙️ Creating environment files...');
const envFiles = {
    '.env.local': `NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=MyApp`,
    '.env.example': `NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=MyApp`
};

Object.entries(envFiles).forEach(([filename, content]) => {
    fs.writeFileSync(filename, content);
    console.log(`  ✓ Created ${filename}`);
});

console.log('✅ Next.js application created successfully!');
console.log('📂 Project location:', process.cwd());
console.log('🏃 Run "npm run dev" to start development server');
console.log('🌐 Application will be available at http://localhost:3000');