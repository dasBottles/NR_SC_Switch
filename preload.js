// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

const configPath = path.join(__dirname, 'assets', 'config.ini');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = ini.parse(raw);
      return { config: parsed, path: configPath };
    } catch (err) {
      console.error('Failed to read config.ini:', err);
      return { config: null, path: configPath };
    }
  },

  updateConfig: (section, key, value) => {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = ini.parse(raw);
      parsed[section] = parsed[section] || {};
      parsed[section][key] = value;
      fs.writeFileSync(configPath, ini.stringify(parsed));
      return true;
    } catch (err) {
      console.error('Failed to update config.ini:', err);
      return false;
    }
  },

  updateSteamId: (steamId) => {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = ini.parse(raw);
      parsed.Paths = parsed.Paths || {};
      parsed.Paths.SteamID = steamId;
      fs.writeFileSync(configPath, ini.stringify(parsed));
      return true;
    } catch (err) {
      console.error('Failed to update SteamID in config.ini:', err);
      return false;
    }
  },
});
