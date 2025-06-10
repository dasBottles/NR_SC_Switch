// preload.js
const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // config
  readConfig:          ()       => ipcRenderer.invoke('read-config'),
  writeConfig:         data     => ipcRenderer.invoke('write-config', data),
  readNrscSettings:    ()       => ipcRenderer.invoke('read-nrsc-settings'),
  updatePlayerCount:   c        => ipcRenderer.invoke('update-player-count', c),
  runEnvSwitch:        env      => ipcRenderer.invoke('run-env-switch', env),
  detectEnv: () => ipcRenderer.invoke('detect-env'),

  // file ops
  fileExists:          path     => ipcRenderer.invoke('file-exists', path),
  copyFile:            (src,d)  => ipcRenderer.invoke('copy-file', src, d),
  renameFile:          (src,nm) => ipcRenderer.invoke('rename-file', src, nm),

  // launchers
  openExternal:        url      => ipcRenderer.invoke('open-external', url),
  execFile:            (exe,opts) => ipcRenderer.invoke('exec-file', exe, opts),
});
