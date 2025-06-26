"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScaffoldDatabase = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const config_js_1 = require("./config.js");
class ScaffoldDatabase {
    constructor() {
        (0, config_js_1.ensureDbFolder)();
        this.db = new sqlite3_1.default.Database(config_js_1.config.db.path);
        this.initPromise = this.initDatabase();
    }
    async initDatabase() {
        return new Promise((resolve, reject) => {
            // Check if we need to migrate from old schema
            this.db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='commands'", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                const needsMigration = row && !row.sql.includes('script_original');
                if (needsMigration) {
                    this.migrateDatabase().then(() => {
                        this.createNewSchema().then(() => {
                            this.seedDefaultCommands().then(resolve).catch(reject);
                        }).catch(reject);
                    }).catch(reject);
                }
                else {
                    this.createNewSchema().then(() => {
                        this.seedDefaultCommands().then(resolve).catch(reject);
                    }).catch(reject);
                }
            });
        });
    }
    async createNewSchema() {
        return new Promise((resolve, reject) => {
            this.db.exec(`
        CREATE TABLE IF NOT EXISTS commands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL CHECK (type IN ('frontend', 'backend', 'init')),
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
          UNIQUE(type, name)
        );

        CREATE INDEX IF NOT EXISTS idx_type_name ON commands (type, name);
        CREATE INDEX IF NOT EXISTS idx_alias ON commands (alias);
        CREATE INDEX IF NOT EXISTS idx_script_type ON commands (script_type);
        CREATE INDEX IF NOT EXISTS idx_original_platform ON commands (original_platform);
      `, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async migrateDatabase() {
        return new Promise((resolve, reject) => {
            console.log('📦 Migrating database to new schema...');
            // First, get all existing commands
            this.db.all('SELECT * FROM commands', (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Backup old table
                this.db.exec(`
          CREATE TABLE commands_backup AS SELECT * FROM commands;
          DROP TABLE commands;
        `, (backupErr) => {
                    if (backupErr) {
                        reject(backupErr);
                        return;
                    }
                    console.log('✅ Database backup created and old table dropped');
                    resolve();
                });
            });
        });
    }
    async seedDefaultCommands() {
        // No default commands - users add their own scripts
        return Promise.resolve();
    }
    async addCommand(command) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO commands (type, name, script_original, script_windows, script_unix, script_cross_platform, original_platform, script_type, platform, alias, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                command.type,
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
            ], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async updateCommand(type, name, updates) {
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
            values.push(type, name);
            this.db.run(`UPDATE commands SET ${fields.join(', ')} WHERE type = ? AND name = ?`, values, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    async removeCommand(type, name) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM commands WHERE type = ? AND name = ?', [type, name], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.changes > 0);
                }
            });
        });
    }
    async getCommand(type, name) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM commands WHERE type = ? AND name = ?', [type, name], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? row : null);
                }
            });
        });
    }
    async getCommandByAlias(alias) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM commands WHERE alias = ?', [alias], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row ? row : null);
                }
            });
        });
    }
    async listCommands(type) {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            if (type) {
                this.db.all('SELECT * FROM commands WHERE type = ? ORDER BY name', [type], (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            }
            else {
                this.db.all('SELECT * FROM commands ORDER BY type, name', (err, rows) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(rows);
                    }
                });
            }
        });
    }
    async getInitCommand(name = 'default') {
        return this.getCommand('init', name);
    }
    async hasInitCommand(name = 'default') {
        await this.initPromise;
        return new Promise((resolve, reject) => {
            this.db.get('SELECT COUNT(*) as count FROM commands WHERE type = ? AND name = ?', ['init', name], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row.count > 0);
                }
            });
        });
    }
    close() {
        this.db.close();
    }
}
exports.ScaffoldDatabase = ScaffoldDatabase;
//# sourceMappingURL=database.js.map