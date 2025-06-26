#!/usr/bin/env node
/**
 * Express.js API Scaffold - Node.js Version  
 * Creates a RESTful API with TypeScript, Express, and database integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating Express.js API...');

// Initialize project
process.chdir('backend');
console.log('📦 Initializing Node.js project...');

// Create package.json
const packageJson = {
    name: 'express-api',
    version: '1.0.0',
    description: 'Express.js RESTful API with TypeScript',
    main: 'dist/index.js',
    scripts: {
        start: 'node dist/index.js',
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
        build: 'tsc',
        test: 'jest',
        'test:watch': 'jest --watch',
        lint: 'eslint src/**/*.ts',
        'lint:fix': 'eslint src/**/*.ts --fix'
    },
    keywords: ['express', 'typescript', 'api', 'rest'],
    author: '',
    license: 'MIT'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('  ✓ Created package.json');

// Create directory structure
console.log('📁 Creating directory structure...');
const directories = [
    'src/controllers',
    'src/middleware',
    'src/models',
    'src/routes',
    'src/services',
    'src/types',
    'src/utils',
    'src/config',
    'src/database',
    'tests/unit',
    'tests/integration',
    'dist'
];

directories.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✓ Created ${dir}`);
});

// Create TypeScript files
console.log('📄 Creating TypeScript files...');
const files = {
    'src/index.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { userRoutes } from './routes/userRoutes';
import { authRoutes } from './routes/authRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server is running on port \${PORT}\`);
});`,

    'src/controllers/userController.ts': `import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types/apiResponse';
import { User } from '../types/user';

const userService = new UserService();

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      const response: ApiResponse<User[]> = {
        success: true,
        data: users,
        message: 'Users retrieved successfully'
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        data: user,
        message: 'User retrieved successfully'
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;
      const user = await userService.createUser(userData);
      
      const response: ApiResponse<User> = {
        success: true,
        data: user,
        message: 'User created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}`,

    'src/routes/userRoutes.ts': `import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validateUser } from '../middleware/validation';
import { auth } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.get('/', auth, userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.post('/', auth, validateUser, userController.createUser);

export { router as userRoutes };`,

    'src/middleware/errorHandler.ts': `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};`,

    'src/middleware/auth.ts': `import { Request, Response, NextFunction } from 'express';

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return;
  }

  // TODO: Implement JWT verification
  next();
};`,

    'src/types/user.ts': `export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}`,

    'src/types/apiResponse.ts': `export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
}`,

    'src/services/userService.ts': `import { User, CreateUserDto } from '../types/user';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    // TODO: Implement database query
    return [];
  }

  async getUserById(id: string): Promise<User | null> {
    // TODO: Implement database query
    return null;
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    // TODO: Implement database creation
    return {
      id: '1',
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}`,

    'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}`,

    '.env.example': `NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/express-api
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000`,

    '.gitignore': `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/`
};

Object.entries(files).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
    console.log(`  ✓ Created ${filePath}`);
});

// Install dependencies
console.log('📦 Installing dependencies...');
const dependencies = [
    'express',
    'cors',
    'helmet',
    'morgan',
    'dotenv'
];

const devDependencies = [
    '@types/express',
    '@types/cors',
    '@types/morgan',
    '@types/node',
    'typescript',
    'ts-node-dev',
    'jest',
    '@types/jest',
    'ts-jest',
    'eslint',
    '@typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin'
];

execSync(`npm install ${dependencies.join(' ')}`, { stdio: 'inherit' });
execSync(`npm install -D ${devDependencies.join(' ')}`, { stdio: 'inherit' });

console.log('✅ Express.js API created successfully!');
console.log('📂 Project location:', process.cwd());
console.log('🏃 Commands:');
console.log('  npm run dev     - Start development server');
console.log('  npm run build   - Build for production');
console.log('  npm test        - Run tests');
console.log('🌐 API will be available at http://localhost:5000');