// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const { execFile } = require('child_process');

// Path to config.ini
const CONFIG_PATH = path.join(__dirname, 'assets', 'config.ini');

// Load and store config as state
let configState = {};
function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    configState = ini.parse(raw);
    console.log('🔄 Config loaded:', configState);
  } catch (err) {
    console.warn('⚠️ Failed to load config:', err.message);
    configState = {};
  }
}

// Initial load
loadConfig();

// Watch for external changes to config.ini and reload state (optional)
fs.watchFile(CONFIG_PATH, () => {
  console.log('📁 config.ini changed, reloading state...');
  loadConfig();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

    win.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// read/write your config.ini (SteamID / GameDir)
ipcMain.handle('read-config', async () => {
  const cfg = ini.parse(fs.readFileSync(path.join(__dirname,'assets','config.ini'),'utf-8'));
  return {
    steamID: cfg.Paths?.SteamID || '',
    gameDir: cfg.Paths?.GameDir || ''
  };
});
ipcMain.handle('write-config', async (_evt, { steamID }) => {
  const cfgPath = path.join(__dirname,'assets','config.ini');
  const raw     = fs.readFileSync(cfgPath,'utf-8');
  const cfg     = ini.parse(raw);
  cfg.Paths = cfg.Paths || {};
  cfg.Paths.SteamID = steamID;
  fs.writeFileSync(cfgPath, ini.stringify(cfg), 'utf-8');
  return { success: true };
});

// read/write the player_count in SeamlessCoop/nrsc_settings.ini
ipcMain.handle('read-nrsc-settings', async () => {
  const cfg    = ini.parse(fs.readFileSync(path.join(__dirname,'assets','config.ini'),'utf-8'));
  const gameDir = cfg.Paths?.GameDir||'';
  const iniPath = path.join(gameDir,'SeamlessCoop','nrsc_settings.ini');
  try {
    const raw  = fs.readFileSync(iniPath,'utf-8');
    const nrsc = ini.parse(raw);
    return { playerCount: nrsc.GAMEPLAY?.player_count || '2' };
  } catch (e) {
    console.error('read-nrsc-settings failed:', e);
    return { playerCount: '2' };
  }
});

ipcMain.handle('update-player-count', async (_evt, count) => {
  const cfg    = ini.parse(fs.readFileSync(path.join(__dirname,'assets','config.ini'),'utf-8'));
  const gameDir = cfg.Paths?.GameDir||'';
  const iniPath = path.join(gameDir,'SeamlessCoop','nrsc_settings.ini');
  try {
    const raw   = fs.readFileSync(iniPath,'utf-8');
    const nrsc  = ini.parse(raw);
    nrsc.GAMEPLAY = nrsc.GAMEPLAY || {};
    nrsc.GAMEPLAY.player_count = count;
    fs.writeFileSync(iniPath, ini.stringify(nrsc), 'utf-8');
    return { success: true };
  } catch (e) {
    console.error('update-player-count failed:', e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('run-env-switch', async (_evt, env) => {
  // read config.ini
  const cfgRaw = fs.readFileSync(path.join(__dirname,'assets','config.ini'),'utf-8');
  const cfg    = ini.parse(cfgRaw);
  const steamID = cfg.Paths?.SteamID  || '';
  const gameDir = cfg.Paths?.GameDir  || '';

  console.log(`[ELECTRON] Launching environment: ${env}`);
  console.log(`[ELECTRON] SteamID: ${steamID}`);
  console.log(`[ELECTRON] GameDir: ${gameDir}`);

  const psScript = path.join(__dirname,'scripts','NightShift.ps1');
  const psArgs   = [
    '-NoProfile', '-NonInteractive',
    '-ExecutionPolicy','Bypass',
    '-File', psScript,
    env,       // "Live" or "Modded" exactly as you passed in
    steamID,
    gameDir
  ];

  return new Promise(resolve => {
    execFile('powershell.exe', psArgs, (err, stdout, stderr) => {
      if (err) {
        console.error('[ELECTRON] PowerShell error:', stderr);
        resolve(`PowerShell failed: ${stderr}`);
      } else {
        console.log('[ELECTRON] PowerShell stdout:', stdout);
        resolve(`Launched ${env}`);
      }
    });
  });
});