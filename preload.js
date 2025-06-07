// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig:        () => ipcRenderer.invoke('read-config'),
  writeConfig:       data => ipcRenderer.invoke('write-config', data),
  readNrscSettings:  () => ipcRenderer.invoke('read-nrsc-settings'),
  updatePlayerCount: count => ipcRenderer.invoke('update-player-count', count),
  runEnvSwitch:      env   => ipcRenderer.invoke('run-env-switch', env),
  handleLaunch:      env   => ipcRenderer.invoke('run-env-switch', env)

});
