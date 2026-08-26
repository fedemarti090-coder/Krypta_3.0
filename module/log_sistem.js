import Database from "better-sqlite3";
import crypto from "crypto";

const LOG_SECRET_KEY = process.env.LOG_SECRET_KEY || "krypta_log_default_secret_key_32bytes_hex_fallback";

function calculateHMAC(secret, username, logsJsonString) {
    return crypto.createHmac("sha256", secret).update(`${username}|${logsJsonString}`).digest("hex");
}

export function new_log(username, content = []) {
    
    try {
        const db = new Database('./db/log_user.db');

        
        db.exec(`
            CREATE TABLE IF NOT EXISTS user_log (
                username TEXT PRIMARY KEY,
                log TEXT NOT NULL,
                hmac TEXT NOT NULL
            );
        `);

        
        const row = db.prepare('SELECT log FROM user_log WHERE username = ?').get(username);

        let logsArray = [];
        if (row && row.log) {
            try {
                logsArray = JSON.parse(row.log);
            } catch (e) {
                logsArray = [];
            }
        }

        
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const [description = "", status = "INFO"] = content;
        const newEntry = [`${timestamp} - ${description}`, status];

        
        logsArray.push(newEntry);

        
        if (logsArray.length > 15) {
            logsArray = logsArray.slice(logsArray.length - 15);
        }

        
        const logsJsonString = JSON.stringify(logsArray);
        const hmac = calculateHMAC(LOG_SECRET_KEY, username, logsJsonString);

        
        db.prepare(`
            INSERT INTO user_log (username, log, hmac)
            VALUES (?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                log = excluded.log,
                hmac = excluded.hmac
        `).run(username, logsJsonString, hmac);

        db.close();
        return true;
    } catch (err) {
        console.error("Errore durante la creazione del log:", err);
        return false;
    }
}

export function leggi_log(username) {
    try {
        const db = new Database('./db/log_user.db');

        
        const row = db.prepare('SELECT log, hmac FROM user_log WHERE username = ?').get(username);
        db.close();

        
        if (!row || !row.log) {
            return {
                valid: true,
                logs: []
            };
        }

        const expectedHmac = calculateHMAC(LOG_SECRET_KEY, username, row.log);

        const isAuthentic = crypto.timingSafeEqual(
            Buffer.from(row.hmac, 'hex'),
            Buffer.from(expectedHmac, 'hex')
        );

        let logsArray = [];
        try {
            logsArray = JSON.parse(row.log);
        } catch (parseErr) {
            return {
                valid: false,
                logs: []
            };
        }

        return {
            valid: isAuthentic,
            logs: logsArray,
            username: username
        };

    } catch (err) {
        console.error("Errore durante la lettura dei log:", err);
        return {
            valid: false,
            logs: [],
            username: username
            
        };
    }
}

export function svuota_log(username) {
    try {
        const db = new Database('./db/log_user.db');

        db.exec(`
            CREATE TABLE IF NOT EXISTS user_log (
                username TEXT PRIMARY KEY,
                log TEXT NOT NULL,
                hmac TEXT NOT NULL
            );
        `);

        const emptyLogsJson = JSON.stringify([]);
        const hmac = calculateHMAC(LOG_SECRET_KEY, username, emptyLogsJson);

        db.prepare(`
            INSERT INTO user_log (username, log, hmac)
            VALUES (?, ?, ?)
            ON CONFLICT(username) DO UPDATE SET
                log = excluded.log,
                hmac = excluded.hmac
        `).run(username, emptyLogsJson, hmac);

        db.close();
        return true;
    } catch (err) {
        console.error("Errore durante lo svuotamento dei log:", err);
        return false;
    }
}