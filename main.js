const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const ini = require('ini');

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('🧪 Preload path:', preloadPath);
  console.log('🧪 Exists:', fs.existsSync(preloadPath));

  const win = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: false,         // ✅ Important fix
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'));
}

app.whenReady().then(createWindow);


ipcMain.on('save-config', (_event, data) => {
    const configPath = path.join(__dirname, 'assets', 'config.ini');
    
    const iniContent = [
        '[Paths]',
        `SteamID = ${data.steamID}`,
        ...(data.gameDir ? [`GameDir = ${data.gameDir}`] : []),
        ''
    ].join('\n');
    
    try {
        fs.writeFileSync(configPath, iniContent, 'utf-8');
    } catch (err) {
        console.error('Failed to write config.ini:', err);
    }
});

ipcMain.once('load-config', (event) => {
  const configPath = path.join(__dirname, 'assets', 'config.ini');

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const parsed = ini.parse(content);
    event.reply('load-config', {
      steamID: parsed.Paths?.SteamID || '',
      gameDir: parsed.Paths?.GameDir || ''
    });
  } catch (err) {
    console.warn('Config not found or unreadable:', err.message);
    event.reply('load-config', { steamID: '', gameDir: '' });
  }
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
    const { ipcMain } = require('electron');
    const fs = require('fs');
    const path = require('path');
});

