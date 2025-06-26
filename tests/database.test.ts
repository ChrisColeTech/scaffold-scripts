import { ScaffoldDatabase } from '../src/database';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';

describe('ScaffoldDatabase', () => {
  let db: ScaffoldDatabase;
  const testDbPath = join(__dirname, 'test-commands.db');

  beforeEach(async () => {
    // Clean up any existing test database
    if (existsSync(testDbPath)) {
      rmSync(testDbPath);
    }
    
    // Create new database instance for testing
    // We'll need to modify the database class to accept a custom path for testing
    db = new ScaffoldDatabase();
  });

  afterEach(() => {
    db.close();
  });

  describe('addCommand', () => {
    it('should add a frontend command successfully', async () => {
      const command = {
        type: 'frontend' as const,
        name: 'react',
        script_original: 'npm create vite@latest',
        script_windows: 'npm create vite@latest',
        script_unix: 'npm create vite@latest',
        script_cross_platform: 'npm create vite@latest',
        original_platform: 'cross-platform' as const,
        script_type: 'nodejs' as const,
        platform: 'all' as const,
        alias: 'r',
        description: 'React app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => await db.addCommand(command)).not.toThrow();
    });

    it('should add a backend command successfully', async () => {
      const command = {
        type: 'backend' as const,
        name: 'dotnet',
        script_original: 'dotnet new webapi',
        script_windows: 'dotnet new webapi',
        script_unix: 'dotnet new webapi',
        script_cross_platform: 'dotnet new webapi',
        original_platform: 'cross-platform' as const,
        script_type: 'shell' as const,
        platform: 'all' as const,
        alias: 'net',
        description: '.NET API',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => await db.addCommand(command)).not.toThrow();
    });

    it('should add an init command successfully', async () => {
      const command = {
        type: 'init' as const,
        name: 'default',
        script_original: 'mkdir src && echo "# Project" > README.md',
        script_windows: 'mkdir src && echo "# Project" > README.md',
        script_unix: 'mkdir src && echo "# Project" > README.md',
        script_cross_platform: 'mkdir src && echo "# Project" > README.md',
        original_platform: 'cross-platform' as const,
        script_type: 'shell' as const,
        platform: 'all' as const,
        description: 'Basic project setup',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      expect(() => await db.addCommand(command)).not.toThrow();
    });
  });

  describe('getCommand', () => {
    beforeEach(async () => {
      const command = {
        type: 'frontend' as const,
        name: 'react',
        script_original: 'npm create vite@latest',
        script_windows: 'npm create vite@latest',
        script_unix: 'npm create vite@latest',
        script_cross_platform: 'npm create vite@latest',
        original_platform: 'cross-platform' as const,
        script_type: 'nodejs' as const,
        platform: 'all' as const,
        alias: 'r',
        description: 'React app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.addCommand(command);
    });

    it('should retrieve an existing command', async () => {
      const command = await db.getCommand('frontend', 'react');
      expect(command).toBeTruthy();
      expect(command?.name).toBe('react');
      expect(command?.type).toBe('frontend');
    });

    it('should return null for non-existent command', async () => {
      const command = await db.getCommand('frontend', 'nonexistent');
      expect(command).toBeNull();
    });
  });

  describe('getCommandByAlias', () => {
    beforeEach(async () => {
      const command = {
        type: 'frontend' as const,
        name: 'react',
        script_original: 'npm create vite@latest',
        script_windows: 'npm create vite@latest',
        script_unix: 'npm create vite@latest',
        script_cross_platform: 'npm create vite@latest',
        original_platform: 'cross-platform' as const,
        script_type: 'nodejs' as const,
        platform: 'all' as const,
        alias: 'r',
        description: 'React app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.addCommand(command);
    });

    it('should retrieve command by alias', async () => {
      const command = await db.getCommandByAlias('r');
      expect(command).toBeTruthy();
      expect(command?.name).toBe('react');
      expect(command?.alias).toBe('r');
    });

    it('should return null for non-existent alias', async () => {
      const command = await db.getCommandByAlias('nonexistent');
      expect(command).toBeNull();
    });
  });

  describe('updateCommand', () => {
    beforeEach(async () => {
      const command = {
        type: 'frontend' as const,
        name: 'react',
        script_original: 'npm create vite@latest',
        script_windows: 'npm create vite@latest',
        script_unix: 'npm create vite@latest',
        script_cross_platform: 'npm create vite@latest',
        original_platform: 'cross-platform' as const,
        script_type: 'nodejs' as const,
        platform: 'all' as const,
        alias: 'r',
        description: 'React app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.addCommand(command);
    });

    it('should update an existing command', async () => {
      const success = await db.updateCommand('frontend', 'react', {
        script_original: 'npm create vite@latest -- --template react-ts',
        script_cross_platform: 'npm create vite@latest -- --template react-ts',
        description: 'React TypeScript app'
      });
      
      expect(success).toBe(true);
      
      const updated = await db.getCommand('frontend', 'react');
      expect(updated?.script_original).toBe('npm create vite@latest -- --template react-ts');
      expect(updated?.description).toBe('React TypeScript app');
    });

    it('should return false for non-existent command', async () => {
      const success = await db.updateCommand('frontend', 'nonexistent', {
        script_original: 'new script'
      });
      
      expect(success).toBe(false);
    });
  });

  describe('removeCommand', () => {
    beforeEach(async () => {
      const command = {
        type: 'frontend' as const,
        name: 'react',
        script_original: 'npm create vite@latest',
        script_windows: 'npm create vite@latest',
        script_unix: 'npm create vite@latest',
        script_cross_platform: 'npm create vite@latest',
        original_platform: 'cross-platform' as const,
        script_type: 'nodejs' as const,
        platform: 'all' as const,
        alias: 'r',
        description: 'React app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.addCommand(command);
    });

    it('should remove an existing command', async () => {
      const success = await db.removeCommand('frontend', 'react');
      expect(success).toBe(true);
      
      const command = await db.getCommand('frontend', 'react');
      expect(command).toBeNull();
    });

    it('should return false for non-existent command', async () => {
      const success = await db.removeCommand('frontend', 'nonexistent');
      expect(success).toBe(false);
    });
  });

  describe('listCommands', () => {
    beforeEach(async () => {
      const commands = [
        {
          type: 'frontend' as const,
          name: 'react',
          script_original: 'npm create vite@latest',
          script_windows: 'npm create vite@latest',
          script_unix: 'npm create vite@latest',
          script_cross_platform: 'npm create vite@latest',
          original_platform: 'cross-platform' as const,
          script_type: 'nodejs' as const,
          platform: 'all' as const,
          alias: 'r',
          description: 'React app',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          type: 'backend' as const,
          name: 'dotnet',
          script_original: 'dotnet new webapi',
          script_windows: 'dotnet new webapi',
          script_unix: 'dotnet new webapi',
          script_cross_platform: 'dotnet new webapi',
          original_platform: 'cross-platform' as const,
          script_type: 'shell' as const,
          platform: 'all' as const,
          alias: 'net',
          description: '.NET API',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      for (const cmd of commands) {
        await db.addCommand(cmd);
      }
    });

    it('should list all commands', async () => {
      const commands = await db.listCommands();
      expect(commands.length).toBe(4); // 2 added + 2 default seeded
    });

    it('should list commands by type', async () => {
      const frontendCommands = await db.listCommands('frontend');
      expect(frontendCommands.length).toBe(2); // 1 added + 1 default
      expect(frontendCommands.every(cmd => cmd.type === 'frontend')).toBe(true);
    });
  });

  describe('init commands', () => {
    beforeEach(async () => {
      const command = {
        type: 'init' as const,
        name: 'default',
        script_original: 'mkdir src && echo "# Project" > README.md',
        script_windows: 'mkdir src && echo "# Project" > README.md',
        script_unix: 'mkdir src && echo "# Project" > README.md',
        script_cross_platform: 'mkdir src && echo "# Project" > README.md',
        original_platform: 'cross-platform' as const,
        script_type: 'shell' as const,
        platform: 'all' as const,
        description: 'Basic project setup',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.addCommand(command);
    });

    it('should retrieve init command', async () => {
      const command = await db.getInitCommand('default');
      expect(command).toBeTruthy();
      expect(command?.name).toBe('default');
      expect(command?.type).toBe('init');
    });

    it('should check if init command exists', async () => {
      expect(await db.hasInitCommand('default')).toBe(true);
      expect(await db.hasInitCommand('nonexistent')).toBe(false);
    });
  });
});