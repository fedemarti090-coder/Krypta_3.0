import crypto from 'node:crypto';
import argon2 from 'argon2';
import Database from 'better-sqlite3';

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { new_log } from './log_sistem.js';

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
    if (!userRow) {
        return { status: false, message: "Utente non trovato" };
    }

    const payload = decrypt_payload(kEnc, userRow.encrypted_data);
    if (!payload) {
        return { status: false, message: "Impossibile decifrare i dati. Chiave non valida o dati corrotti." };
    }

    return { status: true, data: payload, username: username, created_at: userRow.created_at };
}

async function add_user_data(username, kEnc, importedData, isEncryptedPayload = false) {
    const userRow = find_user(username);
    if (!userRow) {
        return { status: false, message: "Utente non trovato" };
    }


    let currentVault = await decrypt_payload(kEnc, userRow.encrypted_data);
    if (!currentVault || !Array.isArray(currentVault.accounts)) {
        currentVault = { accounts: [] };
    }

    let incomingAccounts = [];

    if (isEncryptedPayload) {

        const importedVault = await decrypt_payload(kEnc, importedData);
        if (!importedVault || !Array.isArray(importedVault.accounts)) {
            return { status: false, message: "Impossibile decifrare il backup protetto." };
        }
        incomingAccounts = importedVault.accounts;
    } else {

        if (Array.isArray(importedData.accounts)) {
            incomingAccounts = importedData.accounts;
        } else if (Array.isArray(importedData)) {
            incomingAccounts = importedData;
        } else {

            incomingAccounts = [importedData];
        }
    }

    const existingIds = new Set(currentVault.accounts.map(acc => acc.id || JSON.stringify(acc)));

    for (const acc of incomingAccounts) {
        const identifier = acc.id || JSON.stringify(acc);
        if (!existingIds.has(identifier)) {
            currentVault.accounts.push(acc);
            existingIds.add(identifier);
        }
    }

    const newEncryptedPayload = await encrypt_payload(kEnc, currentVault);

    let db = null;
    try {
        db = new Database(DB_PATH);
        const stmt = db.prepare('UPDATE user_vault SET encrypted_data = ? WHERE username = ?');
        stmt.run(newEncryptedPayload, username);
        db.close();
        new_log(username, ["Backup importato", "SUCCESS"]);

        return { status: true, message: "Backup importato e unite le password con successo", data: currentVault };
    } catch (error) {
        if (db && db.open) db.close();
        return { status: false, message: "Errore durante il salvataggio nel database: " + error.message };
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

        new_log(username, ["Tutte le password sono state eliminate", "SUCCESS"]);

        return { status: true, message: "Vault svuotato con successo", data: emptyVault };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

async function remember_me(payload) {
    try {
        let currentConfig = {};

        try {
            const fileContent = await readFile('./setting.json', 'utf8');
            currentConfig = JSON.parse(fileContent);
        } catch (readError) {
            currentConfig = {};
        }

        const updatedConfig = {
            ...currentConfig,
            ...payload
        };

        await writeFile('./setting.json', JSON.stringify(updatedConfig, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error("Errore durante l'aggiornamento di setting.json:", error);
        return false;
    }
}

function delete_user_data(username) {
    const targetUser = username;
    if (!targetUser) return { status: false, message: "Username mancante" };

    let db = null;
    try {
        db = new Database(DB_PATH);
        const info = db.prepare('DELETE FROM user_vault WHERE username = ?').run(targetUser);
        db.close();

        return info.changes > 0
            ? { status: true, message: "Utente eliminato" }
            : { status: false, message: "Utente non trovato" };
    } catch (error) {
        if (db && db.open) db.close();
        return { status: false, message: error.message };
    }
};



export { read_user_data, add_user_data, clear_user_data, remember_me, decrypt_payload, delete_user_data };