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
    importa_backup: () => ipcRenderer.invoke('import-backup'),
    elimina_user_data: () => ipcRenderer.invoke('elimina-user-data'),

    log_out: () => ipcRenderer.invoke("log-out"),

    check_pin_saved: () => ipcRenderer.invoke('pin-da-settare'),
    set_pin: (pin) => ipcRenderer.invoke('set-pin', pin),
    check_pin: (pin) => ipcRenderer.invoke('controlla-pin', pin),
    save_plain_text: (content, pin) => ipcRenderer.invoke('save-text', content, pin),

    read_log: () => ipcRenderer.invoke('leggi-log'),
    svuota_log: () => ipcRenderer.invoke('clear-log'),
    
    salva_pref: (section, data) => ipcRenderer.invoke('salva-pref', section, data)
});

