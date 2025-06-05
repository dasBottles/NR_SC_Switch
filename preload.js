const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

const configPath = path.join(__dirname, 'assets', 'config.ini');

console.log('✅ Preload script loaded');

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => {
    try {
      const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('📖 Read config from:', configPath);
      return { path: configPath, config };
    } catch (err) {
      console.error('❌ Failed to read config:', err);
      return { path: configPath, config: {} };
    }
  },

  writeConfig: (config, filePath) => {
    try {
      fs.writeFileSync(filePath, ini.stringify(config));
      console.log('💾 Wrote config to:', filePath);
    } catch (err) {
      console.error('❌ Failed to write config:', err);
    }
  },

  getConfigPath: () => configPath
});
