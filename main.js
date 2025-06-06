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

// IPC handlers using configState
ipcMain.handle('read-config', async () => {
  return configState;
});

ipcMain.handle('write-config', async (_event, data) => {
  // Merge updates into state
  configState.Paths = configState.Paths || {};
  if (data.steamID !== undefined) configState.Paths.SteamID = data.steamID;
  if (data.gameDir !== undefined) configState.Paths.GameDir = data.gameDir;
  // Optionally update Launchers if provided
  configState.Launchers = configState.Launchers || {};
  if (data.liveLauncher !== undefined)   configState.Launchers.LiveLauncher   = data.liveLauncher;
  if (data.moddedLauncher !== undefined) configState.Launchers.ModdedLauncher = data.moddedLauncher;

  // Write back to disk
  try {
    fs.writeFileSync(CONFIG_PATH, ini.stringify(configState), 'utf-8');
    console.log('💾 Config saved:', configState);
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to write config:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('run-env-switch', async (_event, env) => {
  // env arrives raw, use directly
  const steamID = configState.Paths?.SteamID || '';
  const gameDir = configState.Paths?.GameDir  || '';

  // Log state anytime before launch
  console.log('🚀 Launching environment:', env);
  console.log('🔑 SteamID:', steamID);
  console.log('🎮 GameDir:', gameDir);

  // Build PowerShell command
  const psScript = path.join(__dirname, 'scripts', 'NightShift.ps1');
  const args = [
    '-NoProfile',
    '-NonInteractive',
    '-ExecutionPolicy', 'Bypass',
    '-File', psScript,
    env,
    steamID,
    gameDir
  ];

  return new Promise((resolve) => {
    execFile('powershell.exe', args, (err, stdout, stderr) => {
      if (err) {
        console.error('❌ PowerShell error:', stderr);
        resolve({ success: false, error: stderr });
      } else {
        console.log('✅ PowerShell stdout:', stdout);
        resolve({ success: true, output: stdout });
      }
    });
  });
});
