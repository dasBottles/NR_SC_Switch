// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runEnvSwitch: (envChoice) => ipcRenderer.send('run-env-switch', envChoice),
  onRunResult: (callback) => ipcRenderer.on('run-result', (_event, result) => callback(result)),
  saveConfig: (data) => ipcRenderer.send('save-config', data),
  loadConfig: (callback) => ipcRenderer.once('load-config', (_event, data) => callback(data))
});
