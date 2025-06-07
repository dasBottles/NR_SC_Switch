// main.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const ini = require('ini');
const { execFile } = require('child_process');

// Path to config.ini
const CONFIG_PATH = path.join(__dirname, 'assets', 'config.ini');
const userConfigPath = path.join(app.getPath('userData'), 'config.ini');

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
  if (!fs.existsSync(userConfigPath)) {
    fs.mkdirSync(path.dirname(userConfigPath), { recursive: true });
    fs.copyFileSync(CONFIG_PATH, userConfigPath);
    console.log('📄 Default config copied to userData:', userConfigPath);
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Read config.ini from userData
ipcMain.handle('read-config', async () => {
  try {
    const raw    = fs.readFileSync(userConfigPath, 'utf-8');
    const parsed = ini.parse(raw);
    return {
      steamID: parsed.Paths?.SteamID || '',
      gameDir: parsed.Paths?.GameDir  || ''
    };
  } catch (err) {
    console.error('read-config failed:', err);
    return { steamID: '', gameDir: '' };
  }
});

// Write only the SteamID back to the userData config
ipcMain.handle('write-config', async (_evt, { steamID }) => {
  try {
    const raw    = fs.readFileSync(userConfigPath, 'utf-8');
    const parsed = ini.parse(raw);
    parsed.Paths = parsed.Paths || {};
    parsed.Paths.SteamID = steamID;
    fs.writeFileSync(userConfigPath, ini.stringify(parsed), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('write-config failed:', err);
    return { success: false, error: err.message };
  }
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
  const cfg     = ini.parse(fs.readFileSync(userConfigPath,'utf-8'));
  const gameDir = cfg.Paths?.GameDir || '';
  const settingsPath = path.join(gameDir, 'SeamlessCoop', 'nrsc_settings.ini');

  try {
    const lines = fs.readFileSync(settingsPath, 'utf-8').split(/\r?\n/);
    const out = lines.map(line => {
      if (line.match(/^\s*player_count\s*=/)) {
        return `player_count = ${count}`;
      }
      return line;
    }).join('\r\n');

    fs.writeFileSync(settingsPath, out, 'utf-8');
    
    return { success: true };
  } catch (err) {
    console.error('update-player-count failed:', err);
    return { success: false, error: err.message };
  }
});

function getScriptPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts', 'NightShift.ps1');
  } else {
    return path.join(__dirname, 'scripts', 'NightShift.ps1');
  }
}

ipcMain.handle('run-env-switch', async (_evt, env) => {
  // 1) Load your *writable* config.ini from userData (or assets)
  const cfgPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'config.ini')
    : path.join(__dirname, 'assets', 'config.ini');
  const cfg     = ini.parse(fs.readFileSync(cfgPath, 'utf-8'));

  // 2) Destructure SteamID + GameDir out of your [Paths] section
  const steamID = cfg.Paths?.SteamID  || '';
  const gameDir = cfg.Paths?.GameDir  || '';

  // 3) Build the full PS script path
  const scriptPath = getScriptPath();
  console.log('🔔 run-env-switch:', { env, steamID, gameDir, scriptPath });

  // 4) Invoke PowerShell *with all three* parameters
  const psArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', scriptPath,
    env,        // $Environment
    steamID,    // $SteamID
    gameDir     // $GameDir
  ];

  return new Promise(resolve => {
    execFile('powershell.exe', psArgs, (err, stdout, stderr) => {
      console.log('🔔 PS stdout:', stdout);
      console.error('🔔 PS stderr:', stderr);
      if (err) {
        resolve(`❌ Error: ${err.message}`);
      } else {
        // 5) After PS completes, launch the game
        if (env.toLowerCase() === 'live') {
          const url = cfg.Launchers?.LiveLauncher;
          if (url?.startsWith('steam://')) shell.openExternal(url);
        } else {
          const exe = path.join(gameDir, cfg.Launchers?.ModdedLauncher || '');
          execFile(exe, { cwd: gameDir }, () => {});
        }
        resolve(`✅ Launched ${env}`);
      }
    });
  });
});