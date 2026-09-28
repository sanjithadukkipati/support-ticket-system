require('dotenv').config();
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let dbDriver = null;
let sqliteDb = null;

// Initialize database adapter
async function getPool() {
  if (dbDriver) return dbDriver;

  // Try MySQL first if credentials provided
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    try {
      const mysqlPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'support_tickets',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      // Test query
      const conn = await mysqlPool.getConnection();
      conn.release();
      console.log('✅ Connected to MySQL Database successfully.');
      dbDriver = {
        type: 'mysql',
        execute: async (sql, params = []) => {
          const [rows, fields] = await mysqlPool.execute(sql, params);
          return [rows, fields];
        },
        query: async (sql, params = []) => {
          const [rows, fields] = await mysqlPool.query(sql, params);
          return [rows, fields];
        }
      };
      return dbDriver;
    } catch (err) {
      console.warn('⚠️ Could not connect to MySQL server. Falling back to embedded SQLite mode for zero-config execution.', err.message);
    }
  }

  // SQLite fallback mode (Zero external setup needed)
  console.log('📦 Initializing embedded SQLite database...');
  const dbPath = process.env.NODE_ENV === 'test' 
    ? ':memory:' 
    : path.join(__dirname, '..', 'database.sqlite');
    
  sqliteDb = new sqlite3.Database(dbPath);

  // Promisify sqlite methods
  const runAsync = (sql, params = []) => new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

  const allAsync = (sql, params = []) => new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const execAsync = (sql) => new Promise((resolve, reject) => {
    sqliteDb.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // Setup Tables
  await execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'agent')) NOT NULL DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      status TEXT CHECK(status IN ('open', 'in_progress', 'closed')) DEFAULT 'open',
      assigned_to INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ticket_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Seed default data if users table is empty
  const usersCount = await allAsync('SELECT COUNT(*) as count FROM users');
  if (usersCount[0].count === 0) {
    console.log('🌱 Seeding initial demo users and tickets into database...');
    const customerPassHash = await bcrypt.hash('sanjitha@123', 10);
    const agentPassHash = await bcrypt.hash('agentpass123', 10);

    await runAsync(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      [1, 'Dukkipati Sanjitha', 'sanjithadukkipati06@gmail.com', customerPassHash, 'customer']
    );
    await runAsync(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      [3, 'Sarah Connor (Support)', 'agent@example.com', agentPassHash, 'agent']
    );
    await runAsync(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      [4, 'Mark Davis (Support)', 'agent2@example.com', agentPassHash, 'agent']
    );

    await runAsync(
      `INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [1, 1, 'Cannot access billing dashboard after subscription renewal', 'Whenever I click on the Billing tab in my account settings, it returns a 500 server error page. Please help resolve this urgent issue.', 'high', 'open', null]
    );
    await runAsync(
      `INSERT INTO tickets (id, user_id, subject, description, priority, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [2, 1, 'Feature Request: Dark Mode Toggle for Web UI', 'I would love to have a dark theme option in the customer portal for working at night.', 'low', 'in_progress', 3]
    );

    await runAsync(
      `INSERT INTO ticket_comments (id, ticket_id, user_id, comment) VALUES (?, ?, ?, ?)`,
      [1, 2, 3, 'Hello Sanjitha! We are currently working on a modern dark mode design system and hope to release it soon.']
    );
    await runAsync(
      `INSERT INTO ticket_comments (id, ticket_id, user_id, comment) VALUES (?, ?, ?, ?)`,
      [2, 2, 1, 'That sounds awesome Sarah, thank you for the quick response!']
    );
  }

  dbDriver = {
    type: 'sqlite',
    execute: async (sql, params = []) => {
      const trimmed = sql.trim().toUpperCase();
      if (trimmed.startsWith('SELECT')) {
        const rows = await allAsync(sql, params);
        return [rows, null];
      } else if (trimmed.startsWith('INSERT')) {
        const res = await runAsync(sql, params);
        return [{ insertId: res.lastID, affectedRows: res.changes }, null];
      } else {
        const res = await runAsync(sql, params);
        return [{ affectedRows: res.changes }, null];
      }
    },
    query: async (sql, params = []) => {
      return dbDriver.execute(sql, params);
    }
  };

  return dbDriver;
}

// Proxy object so pool.execute can be called immediately
const dbProxy = {
  execute: async (sql, params = []) => {
    const pool = await getPool();
    return pool.execute(sql, params);
  },
  query: async (sql, params = []) => {
    const pool = await getPool();
    return pool.query(sql, params);
  }
};

module.exports = dbProxy;
