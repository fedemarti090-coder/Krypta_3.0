import crypto from 'node:crypto';
import argon2 from 'argon2';
import Database from 'better-sqlite3';

import { new_log } from './log_sistem.js';

async function login(username, password) {
    let userRow = null;
    try {
        const db = new Database('./db/vault_user.db');
        userRow = db.prepare('SELECT salt, auth_hash, encrypted_data FROM user_vault WHERE username = ?').get(username);
    } catch (error) {
        return {
            status: false,
            message: "username non attivo"
        }
    };
    if (!userRow) {
        return {
            status: false,
            message: "Username non trovato"
        };
    }
    const salt_buffer = Buffer.from(userRow.salt, 'hex');

    const master_key = await argon2.hash(password, {
        type: argon2.argon2id,
        salt: salt_buffer,
        memoryCost: 1048576, // 1 GB
        timeCost: 4,
        parallelism: 4,
        hashLength: 64,
        raw: true
    });

    const kEnc = Buffer.from(crypto.hkdfSync('sha512', master_key, '', 'pqc_vault_encryption', 32));
    const kAuth = Buffer.from(crypto.hkdfSync('sha512', master_key, '', 'pqc_vault_authentication', 32));

    master_key.fill(0);

    const calculated_auth_hash = crypto.createHash('sha256').update(kAuth).digest();
    const stored_auth_hash = Buffer.from(userRow.auth_hash, 'hex');

    const isValidPassword = crypto.timingSafeEqual(calculated_auth_hash, stored_auth_hash);

    if (!isValidPassword) {
        new_log(username, ["Accesso negato per password errata", "FAILED"]);
        return {
            status: false,
            message: "Password errata"
        }
    }
    /*
        const [ivHex, authTagHex, encryptedText] = userRow.encrypted_data.split(':');
    
        const decipher = crypto.createDecipheriv('aes-256-gcm', kEnc, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
        let decryptedJson = decipher.update(encryptedText, 'hex', 'utf8');
        decryptedJson += decipher.final('utf8');
    
        const vaultObj = JSON.parse(decryptedJson);
    */
    const kEncSession = Buffer.from(kEnc);

    kEnc.fill(0);
    kAuth.fill(0);
    new_log(username, ["Accesso effettuato", "SUCCESS"])
    return {
        status: true,
        message: "Login effettuato",
        kEnc: kEncSession
    }

}

export { login }