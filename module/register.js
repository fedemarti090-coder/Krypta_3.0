import crypto from 'node:crypto';
import argon2 from 'argon2';
import Database from 'better-sqlite3';

import { new_log } from './log_sistem.js';

async function register(username, password) {

    const saltBuffer = crypto.randomBytes(32);


    const master_key = await argon2.hash(password, {
        type: argon2.argon2id,
        salt: saltBuffer,
        memoryCost: 1048576, // 1 GB
        timeCost: 4,
        parallelism: 4,
        hashLength: 64,
        raw: true
    });


    const kEnc = Buffer.from(crypto.hkdfSync('sha512', master_key, '', 'pqc_vault_encryption', 32));
    const kAuth = Buffer.from(crypto.hkdfSync('sha512', master_key, '', 'pqc_vault_authentication', 32));


    master_key.fill(0);


    const auth_hash_hex = crypto.createHash('sha256').update(kAuth).digest('hex');
    const plain_text = JSON.stringify({ accounts: [] });


    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', kEnc, iv);

    let encrypted_ext = cipher.update(plain_text, 'utf8', 'hex');
    encrypted_ext += cipher.final('hex');
    const auth_tag_hex = cipher.getAuthTag().toString('hex');

    const encrypted_data_payload = `${iv.toString('hex')}:${auth_tag_hex}:${encrypted_ext}`;

    const kEncSession = Buffer.from(kEnc);

    kEnc.fill(0);
    kAuth.fill(0);

    try {
        const db = new Database('./db/vault_user.db');
        const stmt = db.prepare(`
            INSERT INTO user_vault (username, salt, auth_hash, encrypted_data)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run(username, saltBuffer.toString('hex'), auth_hash_hex, encrypted_data_payload);
        new_log(username, ["Account registrato", "SUCCESS"]);

        return {
            status: true,
            kEnc: kEncSession
        };
    } catch (error) {
        kEncSession.fill(0);
        return {
            status: false,
            message: "Username gia in uso"
        }
    }
}

export { register };