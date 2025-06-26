/**
 * config.ts - Scaffold Scripts CLI Configuration
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Configuration object for the scaffold scripts CLI
 */
export const config = {
  db: {
    path: path.join(os.homedir(), '.scaffold-scripts', 'commands.db'),
  },
  cli: {
    name: 'Scaffold-Scripts-CLI',
    version: '1.0.0',
  },
};

/**
 * Ensure the database folder exists
 */
export function ensureDbFolder(): void {
  const dbDir = path.dirname(config.db.path);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}