import sqlite3 from 'sqlite3';
import { config, ensureDbFolder } from './config.js';

export interface ScaffoldCommand {
  id?: number;
  name: string;
  
  // Multi-script storage
  script_original: string;           // Original script as uploaded
  script_windows?: string;           // Windows/PowerShell version
  script_unix?: string;              // Unix/Linux/macOS version
  script_cross_platform?: string;   // Platform-agnostic version
  
  // Script metadata
  original_platform: 'windows' | 'unix' | 'cross-platform';
  script_type: 'shell' | 'powershell' | 'python' | 'nodejs' | 'batch' | 'mixed';
  
  platform: 'all' | 'windows' | 'unix';
  alias?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export class ScaffoldDatabase {
  private db: sqlite3.Database;
  private initPromise: Promise<void>;

  constructor() {
    ensureDbFolder();
    this.db = new sqlite3.Database(config.db.path);
    this.initPromise = this.initDatabase();
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if we need to migrate from old schema
      this.db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='commands'", (err, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        const needsMigration = row && !row.sql.includes('script_original');
        
        if (needsMigration) {
          this.migrateDatabase().then(() => {
            this.seedDefaultCommands().then(resolve).catch(reject);
          }).catch(reject);
        } else {
          this.createNewSchema().then(() => {
            this.seedDefaultCommands().then(resolve).catch(reject);
          }).catch(reject);
        }
      });
    });
  }

  private async createNewSchema(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          
          -- Multi-script storage
          script_original TEXT NOT NULL,
          script_windows TEXT,
          script_unix TEXT,
          script_cross_platform TEXT,
          
          -- Script metadata
          original_platform TEXT NOT NULL CHECK (original_platform IN ('windows', 'unix', 'cross-platform')),
          script_type TEXT NOT NULL CHECK (script_type IN ('shell', 'powershell', 'python', 'nodejs', 'batch', 'mixed')),
          
          platform TEXT NOT NULL DEFAULT 'all' CHECK (platform IN ('all', 'windows', 'unix')),
          alias TEXT,
          description TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          UNIQUE(name)
        );

        CREATE INDEX IF NOT EXISTS idx_name ON commands (name);
        CREATE INDEX IF NOT EXISTS idx_alias ON commands (alias);
        CREATE INDEX IF NOT EXISTS idx_script_type ON commands (script_type);
        CREATE INDEX IF NOT EXISTS idx_original_platform ON commands (original_platform);
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async migrateDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📦 Migrating database to new schema...');
      
      // First, get all existing commands
      this.db.all('SELECT * FROM commands', (err, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        // Backup old table and create new schema
        this.db.exec(`
          CREATE TABLE commands_backup AS SELECT * FROM commands;
          DROP TABLE commands;
        `, (backupErr) => {
          if (backupErr) {
            reject(backupErr);
            return;
          }

          console.log('✅ Database backup created and old table dropped');
          
          // Now migrate the data from backup to new schema
          this.createNewSchema().then(() => {
            this.migrateOldData(rows).then(() => {
              console.log('✅ Data migration completed');
              resolve();
            }).catch(reject);
          }).catch(reject);
        });
      });
    });
  }

  private async migrateOldData(oldRows: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!oldRows || oldRows.length === 0) {
        resolve();
        return;
      }

      let completed = 0;
      const total = oldRows.length;

      for (const row of oldRows) {
        // Convert old schema to new schema
        const newCommand: Omit<ScaffoldCommand, 'id'> = {
          name: row.name,
          script_original: row.script || row.content || '',
          script_windows: row.script_windows || null,
          script_unix: row.script_unix || null,
          script_cross_platform: row.script_cross_platform || null,
          original_platform: row.original_platform || 'unix',
          script_type: row.script_type || this.detectScriptType(row.script || row.content || ''),
          platform: row.platform || 'all',
          alias: row.alias || null,
          description: row.description || null,
          createdAt: row.createdAt || new Date().toISOString(),
          updatedAt: row.updatedAt || new Date().toISOString()
        };

        this.db.run(
          `INSERT INTO commands (name, script_original, script_windows, script_unix, script_cross_platform, original_platform, script_type, platform, alias, description, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newCommand.name,
            newCommand.script_original,
            newCommand.script_windows,
            newCommand.script_unix,
            newCommand.script_cross_platform,
            newCommand.original_platform,
            newCommand.script_type,
            newCommand.platform,
            newCommand.alias,
            newCommand.description,
            newCommand.createdAt,
            newCommand.updatedAt
          ],
          (insertErr) => {
            if (insertErr) {
              console.warn(`⚠️  Failed to migrate command "${row.name}":`, insertErr.message);
            }
            
            completed++;
            if (completed === total) {
              resolve();
            }
          }
        );
      }
    });
  }

  private detectScriptType(script: string): string {
    if (script.includes('#!/bin/bash') || script.includes('#!/bin/sh')) return 'shell';
    if (script.includes('#!') && script.includes('python')) return 'python';
    if (script.includes('#!') && script.includes('node')) return 'nodejs';
    if (script.includes('powershell') || script.toLowerCase().includes('param(')) return 'powershell';
    if (script.includes('.bat') || script.includes('@echo')) return 'batch';
    return 'shell'; // default
  }

  private async seedDefaultCommands(): Promise<void> {
    // No default commands - users add their own scripts
    return Promise.resolve();
  }

  async addCommand(command: Omit<ScaffoldCommand, 'id'>): Promise<void> {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO commands (name, script_original, script_windows, script_unix, script_cross_platform, original_platform, script_type, platform, alias, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          command.name,
          command.script_original,
          command.script_windows || null,
          command.script_unix || null,
          command.script_cross_platform || null,
          command.original_platform,
          command.script_type,
          command.platform || 'all',
          command.alias || null,
          command.description || null,
          command.createdAt,
          command.updatedAt
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async updateCommand(name: string, updates: Partial<ScaffoldCommand>): Promise<boolean> {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      // Multi-script updates
      if (updates.script_original !== undefined) {
        fields.push('script_original = ?');
        values.push(updates.script_original);
      }
      if (updates.script_windows !== undefined) {
        fields.push('script_windows = ?');
        values.push(updates.script_windows);
      }
      if (updates.script_unix !== undefined) {
        fields.push('script_unix = ?');
        values.push(updates.script_unix);
      }
      if (updates.script_cross_platform !== undefined) {
        fields.push('script_cross_platform = ?');
        values.push(updates.script_cross_platform);
      }
      
      // Script metadata updates
      if (updates.original_platform !== undefined) {
        fields.push('original_platform = ?');
        values.push(updates.original_platform);
      }
      if (updates.script_type !== undefined) {
        fields.push('script_type = ?');
        values.push(updates.script_type);
      }
      
      // Other field updates
      if (updates.platform !== undefined) {
        fields.push('platform = ?');
        values.push(updates.platform);
      }
      if (updates.alias !== undefined) {
        fields.push('alias = ?');
        values.push(updates.alias);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      
      if (fields.length === 0) {
        resolve(false);
        return;
      }
      
      fields.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(name);
      
      this.db.run(
        `UPDATE commands SET ${fields.join(', ')} WHERE name = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async removeCommand(name: string): Promise<boolean> {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM commands WHERE name = ?',
        [name],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async getCommand(name: string): Promise<ScaffoldCommand | null> {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM commands WHERE name = ?',
        [name],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row as ScaffoldCommand : null);
          }
        }
      );
    });
  }

  async getCommandByAlias(alias: string): Promise<ScaffoldCommand | null> {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM commands WHERE alias = ?',
        [alias],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row as ScaffoldCommand : null);
          }
        }
      );
    });
  }

  async listCommands(): Promise<ScaffoldCommand[]> {
    await this.initPromise;
    
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM commands ORDER BY name',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as ScaffoldCommand[]);
          }
        }
      );
    });
  }


  close(): void {
    this.db.close();
  }
}