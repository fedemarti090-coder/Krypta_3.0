import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { register } from './module/register.js';
import { login } from './module/login.js';
import { read_user_data, add_user_data, clear_user_data } from './module/user_data_manager.js';

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

ipcMain.handle('register', async (event, username, password) => {
    const ans = await register(username, password);
    if (ans.status) {
        session.current_username = username;
        session.kEnc = ans.kEnc;
        return {
            status: true,
            message: "Registrazione effettuata"
        }
    } else {
        return ans;
    }

})

ipcMain.handle('login', async (event, username, password) => {
    const ans = await login(username, password);
    if (ans.status) {
        session.current_username = username;
        session.kEnc = ans.kEnc;
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