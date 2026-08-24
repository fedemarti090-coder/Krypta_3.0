const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    register: (username, password) => ipcRenderer.invoke('register', username, password),
    login: (username, password) => ipcRenderer.invoke('login', username, password),

    leggi_data: () => ipcRenderer.invoke('read-data'),
    aggiungi_data: (new_data) => ipcRenderer.invoke('add-data', new_data),
    svuota_data: () => ipcRenderer.invoke('clear-data')
});

