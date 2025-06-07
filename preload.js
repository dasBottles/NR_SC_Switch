// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => ipcRenderer.invoke('read-config'),
  writeConfig: data => ipcRenderer.invoke('write-config', data),
  readNrscSettings: () => ipcRenderer.invoke('read-nrsc-settings'),
  updatePlayerCount: count => ipcRenderer.invoke('update-player-count', count),
  runEnvSwitch: env => ipcRenderer.invoke('run-env-switch', env),
  handleLaunch: (env) => {
    console.log('🔔 preload.handleLaunch called with', env);
    return ipcRenderer.invoke('run-env-switch', env);
  }  // … any other methods you already had …
});
