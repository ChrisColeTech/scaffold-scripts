/**
 * Mock SQLite3 Database for Testing
 * 
 * Lightweight in-memory replacement for sqlite3 that provides
 * the same API but runs much faster in tests without file I/O.
 * 
 * @see TESTING_STRATEGY.md for usage guidelines
 */

class MockDatabase {
  filename: string | undefined;
  mode: number;
  isOpen: boolean;
  inTransactionState: boolean;
  tables: Map<string, Map<number, any>>;
  lastInsertRowid: number;
  changes: number;
  serialized: boolean;
  statements: Map<string, any>;

  constructor(filename?: string, mode?: any, callback?: (err: Error | null) => void) {
    // Handle different argument patterns
    if (typeof mode === 'function') {
      callback = mode
      mode = null
    }
    
    this.filename = filename
    this.mode = mode || 1 // OPEN_READWRITE | OPEN_CREATE
    this.isOpen = true
    this.inTransactionState = false
    this.tables = new Map()
    this.lastInsertRowid = 0
    this.changes = 0
    this.serialized = false
    this.statements = new Map()
    
    // Simulate async database opening
    if (callback) {
      process.nextTick(() => callback(null))
    }
  }

  // Simulate database.run() method
  run(sql: string, params?: any[] | ((err: Error | null) => void), callback?: (err: Error | null) => void) {
    try {
      const result = this._executeSql(sql, params)
      if (callback) {
        process.nextTick(() => callback.call({ lastID: this.lastInsertRowid, changes: result.changes }, null))
      }
      return this
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return this
    }
  }

  // Simulate database.get() method
  get(sql, params, callback) {
    try {
      const result = this._executeSql(sql, params)
      const row = result.rows && result.rows.length > 0 ? result.rows[0] : undefined
      if (callback) {
        process.nextTick(() => callback(null, row))
      }
      return this
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return this
    }
  }

  // Simulate database.all() method
  all(sql, params, callback) {
    try {
      const result = this._executeSql(sql, params)
      if (callback) {
        process.nextTick(() => callback(null, result.rows || []))
      }
      return this
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return this
    }
  }

  // Simulate database.close() method
  close(callback?: (err: Error | null) => void) {
    this.isOpen = false
    this.tables.clear()
    if (callback) {
      process.nextTick(() => callback(null))
    }
    return this
  }

  // Simulate database.each() method
  each(sql, params, rowCallback, completeCallback) {
    // Handle different argument patterns
    if (typeof params === 'function') {
      completeCallback = rowCallback
      rowCallback = params
      params = []
    }
    
    try {
      const result = this._executeSql(sql, params)
      const rows = result.rows || []
      
      let index = 0
      const processNext = () => {
        if (index >= rows.length) {
          if (completeCallback) {
            process.nextTick(() => completeCallback(null, rows.length))
          }
          return
        }
        
        const row = rows[index++]
        if (rowCallback) {
          process.nextTick(() => {
            rowCallback(null, row)
            processNext()
          })
        } else {
          processNext()
        }
      }
      
      processNext()
    } catch (error) {
      if (rowCallback) {
        process.nextTick(() => rowCallback(error))
      }
    }
    return this
  }

  // Simulate database.exec() method
  exec(sql, callback) {
    try {
      const statements = sql.split(';').filter(s => s.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          this._executeSql(statement.trim(), [])
        }
      }
      if (callback) {
        process.nextTick(() => callback(null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Simulate database.prepare() method
  prepare(sql, params, callback) {
    // Handle different argument patterns
    if (typeof params === 'function') {
      callback = params
      params = []
    }
    
    try {
      const statement = new MockStatement(this, sql)
      if (params && params.length > 0) {
        statement.bind(params)
      }
      if (callback) {
        process.nextTick(() => callback(null, statement))
      }
      return statement
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
      return null
    }
  }

  // Simulate database.serialize() method
  serialize(callback) {
    this.serialized = true
    if (callback) {
      callback()
    }
    return this
  }

  // Simulate database.parallelize() method
  parallelize(callback) {
    this.serialized = false
    if (callback) {
      callback()
    }
    return this
  }

  // Simulate database.interrupt() method
  interrupt() {
    // In a real implementation, this would interrupt running queries
    // For mock, we just simulate the behavior
    return this
  }

  // Property to check if database is in transaction
  get inTransaction() {
    return this.inTransactionState
  }

  // Simulate transaction begin
  _beginTransaction() {
    this.inTransactionState = true
  }

  // Simulate transaction commit
  _commitTransaction() {
    this.inTransactionState = false
  }

  // Simulate transaction rollback
  _rollbackTransaction() {
    this.inTransactionState = false
  }

  // Error simulation for testing
  _simulateError(message) {
    const error = new Error(message)
    error.errno = 1
    error.code = 'SQLITE_ERROR'
    return error
  }

  // Internal SQL execution simulation
  _executeSql(sql, params = []) {
    const normalizedSql = sql.trim().toLowerCase()
    
    // Handle CREATE TABLE
    if (normalizedSql.includes('create table')) {
      const tableName = this._extractTableName(sql)
      this.tables.set(tableName, new Map())
      return { changes: 0, rows: [] }
    }
    
    // Handle INSERT
    if (normalizedSql.startsWith('insert')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      this.lastInsertRowid++
      const row = this._createRowFromInsert(sql, params, this.lastInsertRowid)
      table.set(this.lastInsertRowid, row)
      this.tables.set(tableName, table)
      return { changes: 1, rows: [] }
    }
    
    // Handle SELECT
    if (normalizedSql.startsWith('select')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      const rows = Array.from(table.values())
      return { changes: 0, rows: this._filterRows(rows, sql, params) }
    }
    
    // Handle UPDATE
    if (normalizedSql.startsWith('update')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      let changes = 0
      for (const [id, row] of table.entries()) {
        if (this._matchesWhere(row, sql, params)) {
          const updatedRow = this._updateRow(row, sql, params)
          table.set(id, updatedRow)
          changes++
        }
      }
      return { changes, rows: [] }
    }
    
    // Handle DELETE
    if (normalizedSql.startsWith('delete')) {
      const tableName = this._extractTableName(sql)
      const table = this.tables.get(tableName) || new Map()
      let changes = 0
      for (const [id, row] of table.entries()) {
        if (this._matchesWhere(row, sql, params)) {
          table.delete(id)
          changes++
        }
      }
      return { changes, rows: [] }
    }
    
    // Handle schema queries
    if (normalizedSql.includes('pragma') || normalizedSql.includes('sqlite_master')) {
      return { changes: 0, rows: [] }
    }
    
    return { changes: 0, rows: [] }
  }

  _extractTableName(sql) {
    const match = sql.match(/(?:from|into|table|update)\s+([\w_]+)/i)
    return match ? match[1] : 'unknown'
  }

  _createRowFromInsert(sql, params, id) {
    // Simple row creation - in real tests, this would be more sophisticated
    return { id, name: params[0] || 'test', content: params[1] || 'test content', created_at: new Date().toISOString() }
  }

  _filterRows(rows, sql, params) {
    // Simple filtering - in real tests, this would parse WHERE clauses
    if (sql.includes('WHERE') && params.length > 0) {
      return rows.filter(row => row.name === params[0])
    }
    return rows
  }

  _matchesWhere(row, sql, params) {
    // Simple WHERE matching - would be more sophisticated in real implementation
    return params.length === 0 || row.name === params[0]
  }

  _updateRow(row, sql, params) {
    // Simple update - would parse SET clauses in real implementation
    return { ...row, content: params[0] || row.content }
  }
}

// Mock Statement class for prepared statements
class MockStatement {
  database: MockDatabase;
  sql: string;
  boundParams: any[];
  finalized: boolean;

  constructor(database: MockDatabase, sql: string) {
    this.database = database
    this.sql = sql
    this.boundParams = []
    this.finalized = false
  }

  // Bind parameters to the statement
  bind(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    try {
      this.boundParams = params.flat()
      if (callback) {
        process.nextTick(() => callback(null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Reset the statement
  reset(callback) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    try {
      // Reset preserves bound parameters but clears result cursor
      if (callback) {
        process.nextTick(() => callback(null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Finalize the statement
  finalize(callback) {
    if (!this.finalized) {
      this.finalized = true
      this.boundParams = []
      if (callback) {
        process.nextTick(() => callback(null))
      }
    }
    return this
  }

  // Execute statement (like database.run)
  run(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    const allParams = params.length > 0 ? params : this.boundParams
    
    try {
      const result = this.database._executeSql(this.sql, allParams)
      if (callback) {
        process.nextTick(() => callback.call({ 
          lastID: this.database.lastInsertRowid, 
          changes: result.changes 
        }, null))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Get single row (like database.get)
  get(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    const allParams = params.length > 0 ? params : this.boundParams
    
    try {
      const result = this.database._executeSql(this.sql, allParams)
      const row = result.rows && result.rows.length > 0 ? result.rows[0] : undefined
      if (callback) {
        process.nextTick(() => callback(null, row))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }

  // Get all rows (like database.all)
  all(...params) {
    if (this.finalized) {
      throw new Error('Statement has been finalized')
    }
    
    let callback
    if (typeof params[params.length - 1] === 'function') {
      callback = params.pop()
    }
    
    const allParams = params.length > 0 ? params : this.boundParams
    
    try {
      const result = this.database._executeSql(this.sql, allParams)
      if (callback) {
        process.nextTick(() => callback(null, result.rows || []))
      }
    } catch (error) {
      if (callback) {
        process.nextTick(() => callback(error))
      }
    }
    return this
  }
}

// Export MockDatabase and MockStatement directly
export { MockDatabase }
export { MockStatement }

// Also export as Database and Statement for SQLite3 compatibility
export { MockDatabase as Database }
export { MockStatement as Statement }

// SQLite constants
export const OPEN_READWRITE = 1
export const OPEN_CREATE = 2
export const OPEN_READONLY = 4
export const OPEN_FULLMUTEX = 16
export const OPEN_URI = 64
export const OPEN_SHAREDCACHE = 131072
export const OPEN_PRIVATECACHE = 262144

// Error codes
export const SQLITE_OK = 0
export const SQLITE_ERROR = 1
export const SQLITE_INTERNAL = 2
export const SQLITE_PERM = 3
export const SQLITE_ABORT = 4
export const SQLITE_BUSY = 5
export const SQLITE_LOCKED = 6
export const SQLITE_NOMEM = 7
export const SQLITE_READONLY = 8
export const SQLITE_INTERRUPT = 9
export const SQLITE_IOERR = 10
export const SQLITE_CORRUPT = 11
export const SQLITE_NOTFOUND = 12
export const SQLITE_FULL = 13
export const SQLITE_CANTOPEN = 14
export const SQLITE_PROTOCOL = 15
export const SQLITE_EMPTY = 16
export const SQLITE_SCHEMA = 17
export const SQLITE_TOOBIG = 18
export const SQLITE_CONSTRAINT = 19
export const SQLITE_MISMATCH = 20
export const SQLITE_MISUSE = 21
export const SQLITE_NOLFS = 22
export const SQLITE_AUTH = 23
export const SQLITE_FORMAT = 24
export const SQLITE_RANGE = 25
export const SQLITE_NOTADB = 26

// Default export for compatibility
export default {
  Database: MockDatabase,
  Statement: MockStatement,
  OPEN_READWRITE,
  OPEN_CREATE,
  OPEN_READONLY,
  OPEN_FULLMUTEX,
  OPEN_URI,
  OPEN_SHAREDCACHE,
  OPEN_PRIVATECACHE,
  SQLITE_OK,
  SQLITE_ERROR,
  SQLITE_INTERNAL,
  SQLITE_PERM,
  SQLITE_ABORT,
  SQLITE_BUSY,
  SQLITE_LOCKED,
  SQLITE_NOMEM,
  SQLITE_READONLY,
  SQLITE_INTERRUPT,
  SQLITE_IOERR,
  SQLITE_CORRUPT,
  SQLITE_NOTFOUND,
  SQLITE_FULL,
  SQLITE_CANTOPEN,
  SQLITE_PROTOCOL,
  SQLITE_EMPTY,
  SQLITE_SCHEMA,
  SQLITE_TOOBIG,
  SQLITE_CONSTRAINT,
  SQLITE_MISMATCH,
  SQLITE_MISUSE,
  SQLITE_NOLFS,
  SQLITE_AUTH,
  SQLITE_FORMAT,
  SQLITE_RANGE,
  SQLITE_NOTADB
}
