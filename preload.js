// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: (data) => ipcRenderer.invoke('write-config', data),
  launchEnv: (env) => ipcRenderer.invoke('run-env-switch', env)
});
