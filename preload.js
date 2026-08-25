const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    register: (username, password, remember) => ipcRenderer.invoke('register', username, password, remember),
    login: (username, password, remember) => ipcRenderer.invoke('login', username, password, remember),

    leggi_data: () => ipcRenderer.invoke('read-data'),
    aggiungi_data: (new_data) => ipcRenderer.invoke('add-data', new_data),
    svuota_data: () => ipcRenderer.invoke('clear-data'),

    load_pref: () => ipcRenderer.invoke('load-preferencie'),
    load_html: (path) => ipcRenderer.invoke("load-html", path),

    download_db: (protect) => ipcRenderer.invoke('download-db', protect),
    importa_backup: () => ipcRenderer.invoke('import-backup')
});

