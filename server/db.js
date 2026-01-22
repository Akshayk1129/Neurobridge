import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'neurobridge.db');

const db = new Database(dbPath, { verbose: console.log });
db.pragma('journal_mode = WAL');

// Initialize Schema
function initDb() {
    // Users Table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age_string TEXT,
      parent_email TEXT
    )
  `);

    // Screenings Table (Stores both Vision AI & Simulated EEG data)
    db.exec(`
    CREATE TABLE IF NOT EXISTS screenings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      overall_score REAL,
      risk_level TEXT,
      vision_score REAL,
      eeg_score REAL,
      attention_metric REAL,
      motor_metric REAL,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

    // Seed default user if not exists
    const stmt = db.prepare('SELECT count(*) as count FROM users');
    const result = stmt.get();
    if (result.count === 0) {
        console.log('Seeding default user...');
        db.prepare('INSERT INTO users (name, age_string, parent_email) VALUES (?, ?, ?)')
            .run('Alex', '3 years, 2 months', 'parent@example.com');
    }
}

initDb();

export default db;
