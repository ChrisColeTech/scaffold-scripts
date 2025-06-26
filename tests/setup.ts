import { rmSync, existsSync } from 'fs';
import { join } from 'path';

// Clean up test databases before each test
beforeEach(() => {
  const testDbPath = join(__dirname, 'test-commands.db');
  if (existsSync(testDbPath)) {
    rmSync(testDbPath);
  }
});

// Set test environment
process.env.NODE_ENV = 'test';