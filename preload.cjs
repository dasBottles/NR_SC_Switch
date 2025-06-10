// preload.js
const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig:    () => ipcRenderer.invoke('read-config'),
  writeConfig:   d => ipcRenderer.invoke('write-config', d),
  readNrscSettings: () => ipcRenderer.invoke('read-nrsc-settings'),
  updatePlayerCount: c => ipcRenderer.invoke('update-player-count', c),
  runEnvSwitch:  e => ipcRenderer.invoke('run-env-switch', e)
});