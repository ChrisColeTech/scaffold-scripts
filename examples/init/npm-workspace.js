#!/usr/bin/env node
/**
 * NPM Workspace Project Initialization - Node.js Version
 * Creates a monorepo structure with multiple packages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating NPM Workspace project...');

const projectName = process.argv[2] || 'my-workspace';
console.log(`📁 Project name: ${projectName}`);

// Create main project directory
fs.mkdirSync(projectName, { recursive: true });
process.chdir(projectName);

// Create workspace structure
console.log('📁 Creating workspace structure...');
const directories = [
    'packages/frontend',
    'packages/backend', 
    'packages/shared',
    'packages/docs',
    'tools/build',
    'tools/scripts',
    'configs',
    'tests/e2e'
];

directories.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✓ Created ${dir}`);
});

// Create root package.json with workspace configuration
console.log('📄 Creating workspace configuration...');
const rootPackageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    description: 'NPM Workspace monorepo',
    workspaces: [
        'packages/*'
    ],
    scripts: {
        'build': 'npm run build --workspaces',
        'test': 'npm run test --workspaces',
        'lint': 'npm run lint --workspaces',
        'dev': 'concurrently "npm run dev -w frontend" "npm run dev -w backend"',
        'clean': 'npm run clean --workspaces && rm -rf node_modules',
        'fresh': 'npm run clean && npm install',
        'release': 'npm run build && npm run test'
    },
    devDependencies: {
        'concurrently': '^8.2.0',
        'lerna': '^7.1.0'
    },
    engines: {
        node: '>=18.0.0',
        npm: '>=9.0.0'
    }
};

fs.writeFileSync('package.json', JSON.stringify(rootPackageJson, null, 2));
console.log('  ✓ Created root package.json');

// Create individual package configurations
const packages = {
    'packages/frontend/package.json': {
        name: '@workspace/frontend',
        version: '1.0.0',
        private: true,
        description: 'Frontend application',
        main: 'src/index.js',
        scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
            test: 'jest',
            lint: 'eslint src --ext .js,.jsx,.ts,.tsx'
        },
        dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
            '@workspace/shared': '*'
        },
        devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            'vite': '^4.4.0',
            'typescript': '^5.0.0'
        }
    },

    'packages/backend/package.json': {
        name: '@workspace/backend',
        version: '1.0.0',
        private: true,
        description: 'Backend API server',
        main: 'dist/index.js',
        scripts: {
            dev: 'ts-node-dev src/index.ts',
            build: 'tsc',
            start: 'node dist/index.js',
            test: 'jest',
            lint: 'eslint src --ext .ts'
        },
        dependencies: {
            'express': '^4.18.0',
            '@workspace/shared': '*'
        },
        devDependencies: {
            '@types/express': '^4.17.0',
            '@types/node': '^20.0.0',
            'typescript': '^5.0.0',
            'ts-node-dev': '^2.0.0'
        }
    },

    'packages/shared/package.json': {
        name: '@workspace/shared',
        version: '1.0.0',
        description: 'Shared utilities and types',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            test: 'jest',
            lint: 'eslint src --ext .ts'
        },
        devDependencies: {
            'typescript': '^5.0.0'
        }
    },

    'packages/docs/package.json': {
        name: '@workspace/docs',
        version: '1.0.0',
        private: true,
        description: 'Project documentation',
        scripts: {
            dev: 'vitepress dev',
            build: 'vitepress build',
            preview: 'vitepress preview'
        },
        devDependencies: {
            'vitepress': '^1.0.0'
        }
    }
};

console.log('📄 Creating package configurations...');
Object.entries(packages).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`  ✓ Created ${filePath}`);
});

// Create shared TypeScript configuration
const tsConfig = {
    compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020', 'DOM'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        composite: true
    },
    references: [
        { path: './packages/shared' },
        { path: './packages/frontend' },
        { path: './packages/backend' }
    ]
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfig, null, 2));

// Create individual TypeScript configs
const tsConfigs = {
    'packages/shared/tsconfig.json': {
        extends: '../../tsconfig.json',
        compilerOptions: {
            outDir: './dist',
            rootDir: './src'
        },
        include: ['src/**/*'],
        exclude: ['**/*.test.ts', 'dist']
    },
    'packages/frontend/tsconfig.json': {
        extends: '../../tsconfig.json',
        compilerOptions: {
            target: 'ES2020',
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            moduleResolution: 'node',
            jsx: 'react-jsx'
        },
        include: ['src/**/*'],
        references: [
            { path: '../shared' }
        ]
    },
    'packages/backend/tsconfig.json': {
        extends: '../../tsconfig.json',
        compilerOptions: {
            outDir: './dist',
            rootDir: './src'
        },
        include: ['src/**/*'],
        references: [
            { path: '../shared' }
        ]
    }
};

Object.entries(tsConfigs).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    console.log(`  ✓ Created ${filePath}`);
});

// Create starter files
const starterFiles = {
    'packages/shared/src/index.ts': `export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};`,

    'packages/frontend/src/App.tsx': `import React from 'react';
import { User } from '@workspace/shared';

function App() {
  return (
    <div className="App">
      <h1>Frontend Package</h1>
      <p>This is the frontend package in the workspace.</p>
    </div>
  );
}

export default App;`,

    'packages/backend/src/index.ts': `import express from 'express';
import { User, ApiResponse } from '@workspace/shared';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/health', (req, res) => {
  const response: ApiResponse<{ uptime: number }> = {
    success: true,
    data: { uptime: process.uptime() },
    message: 'Server is healthy'
  };
  res.json(response);
});

app.listen(PORT, () => {
  console.log(\`Backend server running on port \${PORT}\`);
});`,

    'README.md': `# ${projectName}

NPM Workspace monorepo with multiple packages.

## Structure

- \`packages/frontend\` - React frontend application
- \`packages/backend\` - Express.js backend API
- \`packages/shared\` - Shared utilities and types
- \`packages/docs\` - Project documentation

## Setup

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
# Start all services
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint all packages
npm run lint
\`\`\`

## Package Management

\`\`\`bash
# Add dependency to specific package
npm install lodash -w frontend

# Add dev dependency to root
npm install -D jest

# Run command in specific package
npm run build -w shared
\`\`\``,

    '.gitignore': `node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
.nyc_output/`,

    'lerna.json': `{
  "version": "independent",
  "npmClient": "npm",
  "command": {
    "publish": {
      "conventionalCommits": true
    },
    "version": {
      "allowBranch": ["master", "main"]
    }
  }
}`
};

console.log('📄 Creating starter files...');
Object.entries(starterFiles).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Created ${filePath}`);
});

// Initialize git repository
console.log('📋 Initializing Git repository...');
execSync('git init');
execSync('git add .');
execSync(`git commit -m "Initial commit: ${projectName} workspace"`);

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

console.log('✅ NPM Workspace project created successfully!');
console.log('📂 Project location:', process.cwd());
console.log('🏃 Next steps:');
console.log('  1. npm run dev     - Start development servers');
console.log('  2. npm run build   - Build all packages');
console.log('  3. npm run test    - Run tests');
console.log('📚 Learn more about NPM workspaces: https://docs.npmjs.com/cli/v7/using-npm/workspaces');