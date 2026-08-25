import crypto from 'node:crypto';
import argon2 from 'argon2';
import Database from 'better-sqlite3';

import { writeFile } from 'node:fs/promises';

const DB_PATH = "./db/vault_user.db"

function find_user(username) {
    let db;
    try {
        db = new Database(DB_PATH);
        const userRow = db.prepare('SELECT salt, auth_hash, encrypted_data, created_at FROM user_vault WHERE username = ?').get(username);
        return userRow || null;
    } catch (error) {
        console.error("Errore lettura DB in find_user:", error.message);
        return null;
    } finally {
        if (db) db.close();
    }
}

function decrypt_payload(kEnc, encryptedDataPayload) {
    try {
        const [ivHex, authTagHex, encryptedText] = encryptedDataPayload.split(':');

        const decipher = crypto.createDecipheriv('aes-256-gcm', kEnc, Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

        let decryptedJson = decipher.update(encryptedText, 'hex', 'utf8');
        decryptedJson += decipher.final('utf8');

        return JSON.parse(decryptedJson);
    } catch (error) {
        return null;
    }
}

function encrypt_payload(kEnc, vaultObj) {
    const plainText = JSON.stringify(vaultObj);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', kEnc, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

async function read_user_data(username, kEnc) {
    const userRow = find_user(username);
    console.log(userRow, username, kEnc);
    if (!userRow) {
        return { status: false, message: "Utente non trovato" };
    }
    console.log(userRow);

    const payload = decrypt_payload(kEnc, userRow.encrypted_data);
    if (!payload) {
        return { status: false, message: "Impossibile decifrare i dati. Chiave non valida o dati corrotti." };
    }

    return { status: true, data: payload, username: username, created_at: userRow.created_at };
}

async function add_user_data(username, kEnc, newAccount) {
    const userRow = find_user(username);
    if (!userRow) {
        return { status: false, message: "Utente non trovato" };
    }

    const vaultObj = decrypt_payload(kEnc, userRow.encrypted_data);
    if (!vaultObj) {
        return { status: false, message: "Errore durante la decifratura del vault." };
    }

    vaultObj.accounts.push(newAccount);

    const newEncryptedPayload = encrypt_payload(kEnc, vaultObj);

    try {
        const db = new Database(DB_PATH);
        const stmt = db.prepare('UPDATE user_vault SET encrypted_data = ? WHERE username = ?');
        stmt.run(newEncryptedPayload, username);
        db.close();

        return { status: true, message: "Account salvato con successo", data: vaultObj };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

async function clear_user_data(username, kEnc) {
    const userRow = find_user(username);
    if (!userRow) {
        return { status: false, message: "Utente non trovato" };
    }

    const emptyVault = { accounts: [] };
    const newEncryptedPayload = encrypt_payload(kEnc, emptyVault);

    try {
        const db = new Database(DB_PATH);
        const stmt = db.prepare('UPDATE user_vault SET encrypted_data = ? WHERE username = ?');
        stmt.run(newEncryptedPayload, username);
        db.close();

        return { status: true, message: "Vault svuotato con successo", data: emptyVault };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

async function remember_me(username) {
    const payload = { remember: true, username: username};
    await writeFile('./setting.json', JSON.stringify(payload, null, 2), 'utf8');
    
}



export { read_user_data, add_user_data, clear_user_data, remember_me, decrypt_payload };