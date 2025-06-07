// main.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path    = require('path');
const fs      = require('fs');
const ini     = require('ini');
const { execFile } = require('child_process');

// 1) Bundled default lives in your asar at ./assets/config.ini
const DEFAULT_CONFIG = path.join(__dirname, 'assets', 'config.ini');
// 2) Writable copy lives in %APPDATA%/NightShift/config.ini
const USER_CONFIG_DIR  = path.join(app.getPath('userData'));
const USER_CONFIG_PATH = path.join(USER_CONFIG_DIR, 'config.ini');

// Ensure userData/config.ini exists
if (!fs.existsSync(USER_CONFIG_PATH)) {
  fs.mkdirSync(USER_CONFIG_DIR, { recursive: true });
  fs.copyFileSync(DEFAULT_CONFIG, USER_CONFIG_PATH);
  console.log('📄 Copied default config →', USER_CONFIG_PATH);
}

// Helper: load that one writable config
function loadUserConfig() {
  try {
    return ini.parse(fs.readFileSync(USER_CONFIG_PATH, 'utf-8'));
  } catch (e) {
    console.error('❌ Failed to load user config:', e);
    return {};
  }
}

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

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });


// ─── IPC: CONFIG CRUD ───────────────────────────────────────────────────────────

// Read SteamID & GameDir
ipcMain.handle('read-config', async () => {
  const cfg = loadUserConfig();
  return {
    steamID: cfg.Paths?.SteamID || '',
    gameDir: cfg.Paths?.GameDir  || ''
  };
});

// Write only SteamID back
ipcMain.handle('write-config', async (_e, { steamID }) => {
  try {
    const cfg = loadUserConfig();
    cfg.Paths = cfg.Paths || {};
    cfg.Paths.SteamID = steamID;
    fs.writeFileSync(USER_CONFIG_PATH, ini.stringify(cfg), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('❌ write-config failed:', err);
    return { success: false, error: err.message };
  }
});


// ─── IPC: NRSC SETTINGS ────────────────────────────────────────────────────────

// Read player_count
ipcMain.handle('read-nrsc-settings', async () => {
  const cfg = loadUserConfig();
  const gameDir = cfg.Paths?.GameDir || '';
  const nrscIni = path.join(gameDir, 'SeamlessCoop', 'nrsc_settings.ini');
  try {
    const raw  = fs.readFileSync(nrscIni, 'utf-8');
    const o    = ini.parse(raw);
    return { playerCount: o.GAMEPLAY?.player_count || '2' };
  } catch (err) {
    console.error('❌ read-nrsc-settings failed:', err);
    return { playerCount: '2' };
  }
});

// Update player_count
ipcMain.handle('update-player-count', async (_e, newCount) => {
  const cfg = loadUserConfig();
  const gameDir = cfg.Paths?.GameDir || '';
  const nrscIni = path.join(gameDir, 'SeamlessCoop', 'nrsc_settings.ini');
  try {
    const raw  = fs.readFileSync(nrscIni, 'utf-8')
                     .split(/\r?\n/)
                     .map(line => line.replace(
                       /^\s*player_count\s*=\s*\d+/,
                       `player_count = ${newCount}`
                     ))
                     .join('\r\n');
    fs.writeFileSync(nrscIni, raw, 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('❌ update-player-count failed:', err);
    return { success: false, error: err.message };
  }
});


// ─── IPC: ENV SWITCH / LAUNCH ──────────────────────────────────────────────────

function getPSScriptPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts', 'NightShift.ps1')
    : path.join(__dirname, 'scripts', 'NightShift.ps1');
}

ipcMain.handle('run-env-switch', async (_e, env) => {
  const cfg = loadUserConfig();
  const steamID = cfg.Paths?.SteamID || '';
  const gameDir = cfg.Paths?.GameDir  || '';
  const script  = getPSScriptPath();
  console.log('🔔 run-env-switch:', { env, steamID, gameDir, script });

  const psArgs = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', script,
    env, steamID, gameDir
  ];

  return new Promise(resolve => {
    execFile('powershell.exe', psArgs, (err, stdout, stderr) => {
      console.log('🔔 PS stdout:', stdout);
      console.error('🔔 PS stderr:', stderr);
      if (err) {
        resolve(`❌ Error: ${err.message}`);
        return;
      }
      // launch
      if (env.toLowerCase() === 'live') {
        shell.openExternal(cfg.Launchers?.LiveLauncher);
      } else {
        const exe = path.join(gameDir, cfg.Launchers?.ModdedLauncher || '');
        execFile(exe, { cwd: gameDir }, () => {});
      }
      resolve(`✅ Launched ${env}`);
    });
  });
});
