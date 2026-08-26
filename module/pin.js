import { randomBytes, hkdfSync, createCipheriv, createDecipheriv } from 'crypto';
import argon2 from 'argon2';
import Database from 'better-sqlite3';

import { new_log } from './log_sistem.js';

export async function salva_pin(username, pin, plain_text_note, kEnc) {
    const notes_salt = randomBytes(16);

    const derivate_pin_buffer = await argon2.hash(pin, {
        type: argon2.argon2id,
        salt: notes_salt,
        timeCost: 3,
        memoryCost: 65536,
        parallelism: 4,
        hashLength: 32,
        raw: true
    });

    const info_domain = Buffer.from('app.krypta.notes.v1', 'utf8');
    const k_notes = Buffer.from(hkdfSync('sha256', kEnc, derivate_pin_buffer, info_domain, 32));

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', k_notes, iv);

    let encrypted_text = cipher.update(plain_text_note, 'utf8', 'hex');
    encrypted_text += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    k_notes.fill(0);
    derivate_pin_buffer.fill(0);

    try {

        const db = new Database('./db/vault_user.db');

        const userRow = db.prepare('SELECT id FROM user_vault WHERE username = ?').get(username);

        if (!userRow) {
            db.close();
            return { status: false, message: "Username non trovato" };
        }

        const stmt = db.prepare(`
            UPDATE user_vault 
            SET notes_encrypted = ?, 
                notes_iv = ?, 
                notes_auth_tag = ?, 
                notes_salt = ? 
            WHERE username = ?
        `);

        stmt.run(
            encrypted_text,
            iv.toString('hex'),
            authTag.toString('hex'),
            notes_salt.toString('hex'),
            username
        );

        db.close();

        new_log(username, ["Pin configurato correttamente", "SUCCESS"]);

        return { status: true, message: "Pin configurato correttamente" };

    } catch (err) {
        return { status: false, message: "Errore nel salvataggio del PIN" }
    }

}

export async function pin_da_settare(username) {
    try {
        const db = new Database('./db/vault_user.db');

        const userRow = db.prepare('SELECT notes_iv FROM user_vault WHERE username = ?').get(username);

        if (!userRow) {
            db.close();
            return { status: false, message: "Utente non trovato" };
        }
        const daSettare = !userRow.notes_iv || userRow.notes_iv.trim() === "";
        db.close();

        return {
            status: true,
            set: daSettare
        };

    } catch (err) {

        return { status: false, message: err };
    }
}

export async function verifica_e_leggi_nota(username, pin, kEnc) {
    let db;
    try {
        db = new Database('./db/vault_user.db');

        const userRow = db.prepare(`
            SELECT notes_encrypted, notes_iv, notes_auth_tag, notes_salt 
            FROM user_vault 
            WHERE username = ?
        `).get(username);

        if (!userRow || !userRow.notes_encrypted || !userRow.notes_salt) {
            db.close();
            return { status: false, message: "Nota o PIN non ancora configurati" };
        }


        const notes_salt = Buffer.from(userRow.notes_salt, 'hex');
        const iv = Buffer.from(userRow.notes_iv, 'hex');
        const auth_tag = Buffer.from(userRow.notes_auth_tag, 'hex');

        const derivate_pin_buffer = await argon2.hash(pin, {
            type: argon2.argon2id,
            salt: notes_salt,
            timeCost: 3,
            memoryCost: 65536,
            parallelism: 4,
            hashLength: 32,
            raw: true
        });

        const info_domain = Buffer.from('app.krypta.notes.v1', 'utf8');
        const k_notes = Buffer.from(hkdfSync('sha256', kEnc, derivate_pin_buffer, info_domain, 32));

        const decipher = createDecipheriv('aes-256-gcm', k_notes, iv);
        decipher.setAuthTag(auth_tag);

        let decrypted_text = decipher.update(userRow.notes_encrypted, 'hex', 'utf8');
        decrypted_text += decipher.final('utf8');

        k_notes.fill(0);
        derivate_pin_buffer.fill(0);

        db.close();
        new_log(username, ["PIN inserito corretto nota sbloccata", "SUCCESS"]);

        return {
            status: true,
            content: decrypted_text
        };

    } catch (err) {
        if (db) db.close();
        new_log(username, ["PIN inserito errato", "FAILED"]);

        return { status: false, message: "PIN errato" };
    }
}

export async function salva_nota_db(username, pin, kEnc, content) {
    let db;
    try {
        db = new Database('./db/vault_user.db');


        const notes_salt = randomBytes(16);
        const iv = randomBytes(12);


        const derivate_pin_buffer = await argon2.hash(pin, {
            type: argon2.argon2id,
            salt: notes_salt,
            timeCost: 3,
            memoryCost: 65536,
            parallelism: 4,
            hashLength: 32,
            raw: true
        });


        const info_domain = Buffer.from('app.krypta.notes.v1', 'utf8');
        const k_notes = Buffer.from(hkdfSync('sha256', kEnc, derivate_pin_buffer, info_domain, 32));


        const cipher = createCipheriv('aes-256-gcm', k_notes, iv);
        let encrypted = cipher.update(content, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const auth_tag = cipher.getAuthTag().toString('hex');


        k_notes.fill(0);
        derivate_pin_buffer.fill(0);


        const stmt = db.prepare(`
            UPDATE user_vault 
            SET notes_encrypted = ?, notes_iv = ?, notes_auth_tag = ?, notes_salt = ? 
            WHERE username = ?
        `);

        stmt.run(encrypted, iv.toString('hex'), auth_tag, notes_salt.toString('hex'), username);

        db.close();
        new_log(username, ["Note protetta correttamente salvata", "SUCCESS"]);

        return { status: true };

    } catch (err) {
        if (db) db.close();
        console.error("Errore salvataggio nota DB:", err);
        return { status: false, message: "Impossibile salvare la nota cifrata" };
    }
}