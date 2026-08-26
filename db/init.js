import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';


const dbPath = path.resolve('./db/log_user.db');
const dbDir = path.dirname(dbPath);


if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Cartella db creata in:', dbDir);
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

/*
db.exec(`
    CREATE TABLE IF NOT EXISTS user_vault (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        salt TEXT NOT NULL,
        auth_hash TEXT NOT NULL,
        encrypted_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes_encrypted TExT,
        notes_iv TEXT,
        notes_auth_tag TEXT,
        notes_salt TEXT
    );
`);*/

db.exec(`
    CREATE TABLE IF NOT EXISTS user_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        log TEXT NOT NULL,
        hmac TEXT NOT NULL
        
    );
`);

console.log('Database e tabella user_vault creati con successo in:', dbPath);

db.close();