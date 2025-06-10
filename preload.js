// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig:  ()    => ipcRenderer.invoke('read-config'),
  writeConfig: upd  => ipcRenderer.invoke('write-config', upd),
  openExternal: url => ipcRenderer.invoke('open-external', url),
  execFile:    (exe, args) => ipcRenderer.invoke('exec-file', exe, args)
});
