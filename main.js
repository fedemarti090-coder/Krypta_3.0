import 'dotenv/config'

import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { register } from './module/register.js';
import { login } from './module/login.js';
import { read_user_data, add_user_data, clear_user_data, remember_me, decrypt_payload, delete_user_data } from './module/user_data_manager.js';
import { salva_pin, pin_da_settare, verifica_e_leggi_nota, salva_nota_db } from './module/pin.js';
import { new_log, leggi_log, svuota_log } from './module/log_sistem.js';



const session = {
    current_username: null,
    kEnc: null
}
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'img', 'logo.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile('public/login/index.html');

}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('register', async (event, username, password, remember) => {
    const ans = await register(username, password);

    if (ans.status) {
        session.current_username = username;
        session.kEnc = ans.kEnc;
        if (remember) { remember_me({ global: { remember: true, username: username } }) };
        return {
            status: true,
            message: "Registrazione effettuata"
        }
    } else {
        return ans;
    }

})

ipcMain.handle('login', async (event, username, password, remember) => {
    const ans = await login(username, password);

    if (ans.status) {
        session.current_username = username;
        session.kEnc = ans.kEnc;
        if (remember) { remember_me({ global: { remember: true, username: username } }) };
        return {
            status: true,
            message: "Registrazione effettuata"
        }
    } else {
        return ans;
    }

})

ipcMain.handle('read-data', async (event) => {
    return await read_user_data(session.current_username, session.kEnc);
})

ipcMain.handle('add-data', async (event, new_data) => {
    return await add_user_data(session.current_username, session.kEnc, new_data);
})

ipcMain.handle('clear-data', async (event) => {
    return await clear_user_data(session.current_username, session.kEnc);
})

const configPath = path.join(__dirname, 'setting.json');

ipcMain.handle('load-preferencie', async (event) => {
    try {
        const fileContent = await fs.readFile(configPath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error("Errore durante la lettura del file setting.json:", error);
        return {};
    }
});
ipcMain.handle('load-html', async (event, percorso) => {
    win.loadFile(path.join('public', percorso, 'index.html'));
})

ipcMain.handle('download-db', async (event, protect) => {
    let db = null;
    try {
        db = new Database('./db/vault_user.db');
        const userRow = db.prepare('SELECT salt, auth_hash, encrypted_data FROM user_vault WHERE username = ?').get(session.current_username);

        db.close();

        if (!userRow) {
            return {
                status: false,
                message: "Username non trovato"
            };
        }

        let fileName = "";
        let data = {};
        let prefix = "error";

        if (protect) {
            fileName = "Lista_password_cryptata.json";
            data = userRow;
            prefix = "protect";
        } else {
            fileName = "Lista_password_in_chiaro.json";
            data = await decrypt_payload(session.kEnc, userRow.encrypted_data);
            prefix = "clear";
        }
        data.prefix_key = prefix;
        data.username = session.current_username;

        const downloadsPath = app.getPath('downloads');
        const filePath = path.join(downloadsPath, fileName);
        const jsonString = JSON.stringify(data, null, 2);

        await fs.writeFile(filePath, jsonString, 'utf-8');
        new_log(session.current_username, ["Backup database correttamente scaricato", "SUCCESS"]);

        return { status: true, path: filePath };

    } catch (error) {
        if (db && db.open) db.close();
        return {
            status: false,
            message: "Errore durante l'esportazione del database"
        };
    }
});

ipcMain.handle("import-backup", async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { status: false, message: "Nessun file selezionato" };
    }

    const path = result.filePaths[0];
    let data = null;

    try {
        const raw_data = await fs.readFile(path, 'utf-8');
        data = JSON.parse(raw_data);
    } catch (err) {
        return { status: false, message: "JSON errato o corrotto" };
    }

    if (!data.prefix_key) {
        return { status: false, message: "JSON non valido per il ripristino" };
    }

    if (data.username !== session.current_username) {
        return { status: false, message: "Backup appartenente a un altro utente" };
    }

    if (data.prefix_key === 'protect') {

        return await add_user_data(session.current_username, session.kEnc, data.encrypted_data, true);
    } else if (data.prefix_key === 'clear') {

        return await add_user_data(session.current_username, session.kEnc, data, false);
    }

    return { status: false, message: "Formato backup sconosciuto" };
});


ipcMain.handle('elimina-user-data', async (event) => {
    const ans = await delete_user_data(session.current_username);
    return await log_out();
})

async function log_out() {
    try {
        new_log(session.current_username, ["Logout effettuato", "SUCCESS"]);

        session.current_username = null;
        session.kEnc = null;

        if (win && win.webContents) {
            await win.webContents.session.clearCache();
            await win.webContents.executeJavaScript('sessionStorage.clear();');
        }

        await win.loadFile(path.join(__dirname, 'public', 'login', 'index.html'));



        return { status: true, message: "Logout effettuato con successo" };
    } catch (error) {
        return { status: false, message: error.message };
    }
}

ipcMain.handle('log-out', async (event) => {
    return await log_out();
});

ipcMain.handle("pin-da-settare", async (event) => {
    return await pin_da_settare(session.current_username);
})

ipcMain.handle("set-pin", async (event, pin) => {
    return await salva_pin(session.current_username, pin, "Questa è la tua nota protetta...", session.kEnc);
})

ipcMain.handle('controlla-pin', async (event, pin) => {
    return await verifica_e_leggi_nota(session.current_username, pin, session.kEnc);
})

ipcMain.handle('save-text', async (event, content, pin) => {
    return await salva_nota_db(session.current_username, pin, session.kEnc, content)
})

ipcMain.handle('leggi-log', async (event) => {
    return await leggi_log(session.current_username);
})

ipcMain.handle('clear-log', async (event) => {
    return await svuota_log(session.current_username);
})

ipcMain.handle('salva-pref', async (event, sectionName, data) => {
    try {
        let config = {};

        try {
            const fileContent = await fs.readFile(configPath, 'utf8');
            config = JSON.parse(fileContent);
        } catch (readError) {
            config = {};
        }

        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            config[sectionName] = {
                ...(config[sectionName] || {}),
                ...data
            };
        } else {

            config[sectionName] = data;
        }

        await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

        return true;
    } catch (error) {
        console.error(`Errore durante il salvataggio della sezione '${sectionName}':`, error);
        return false;
    }
});