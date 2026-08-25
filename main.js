import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { register } from './module/register.js';
import { login } from './module/login.js';
import { read_user_data, add_user_data, clear_user_data, remember_me, decrypt_payload } from './module/user_data_manager.js';

import data from './setting.json' with { type: 'json' };


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
        if (remember) { remember_me(username) };
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
        if (remember) { remember_me(username) };
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

ipcMain.handle('load-preferencie', async (event) => {
    return data;
})

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
        let prefix = "`error`";

        if (protect) {
            fileName = "Lista_password_cryptata.json";
            data = userRow;
            prefix = `protect`;
        } else {
            fileName = "Lista_password_in_chiaro.json";
            data = await decrypt_payload(session.kEnc, userRow.encrypted_data);
            prefix = `clear`;
        }

        const downloadsPath = app.getPath('downloads');
        const filePath = path.join(downloadsPath, fileName);
        const jsonString = JSON.stringify(data, null, 2);

        await fs.writeFile(filePath, prefix + jsonString, 'utf-8'); // oppure fs.writeFile se usi fs/promises
        return { status: true, path: filePath };

    } catch (error) {
        if (db && db.open) db.close();
        return {
            status: false,
            message: "Errore durante l'esportazione del database"
        };
    }
});

ipcMain.handle("import-baackup", async (event) => {

    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return {
            status: false,
            message: "Nessun file selezionato"
        };
    }

    const path = result.filePaths[0];

    try {
        const raw_data = await fs.readFile(path, 'utf-8');
        const data = JSON.parse(raw_data);

        return {
            status: true,
            data: data
        };
    } catch (err) {
        return {
            status: false,
            message: "Json errato o corrotto"
        };
    }
});
