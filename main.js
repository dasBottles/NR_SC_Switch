// main.js
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs    = require('fs');
const path  = require('path');
const ini   = require('ini');
const { execFile } = require('child_process');

// where user data lives
const USER_CFG_DIR  = app.getPath('userData');
const USER_CFG_PATH = path.join(USER_CFG_DIR, 'config.ini');

// ensure we have a writable config copy
function ensureConfig() {
  if (!fs.existsSync(USER_CFG_DIR)) fs.mkdirSync(USER_CFG_DIR, { recursive: true });
  if (!fs.existsSync(USER_CFG_PATH)) {
    fs.copyFileSync(path.join(__dirname,'assets','config.ini'), USER_CFG_PATH);
  }
}

// load and parse
function loadConfig() {
  try {
    const raw = fs.readFileSync(USER_CFG_PATH, 'utf-8');
    return ini.parse(raw);
  } catch {
    return {};
  }
}

// save only the keys passed in
function saveConfig(updates) {
  const cfg = loadConfig();
  cfg.Paths = cfg.Paths || {};
  Object.assign(cfg.Paths, updates);
  fs.writeFileSync(USER_CFG_PATH, ini.stringify(cfg), 'utf-8');
}

// Expose IPC
ipcMain.handle('read-config',    () => loadConfig());
ipcMain.handle('write-config',   (_e, upd) => (saveConfig(upd), true));

app.whenReady().then(() => {
  ensureConfig();
  const win = new BrowserWindow({
    width: 400, height: 500,
    webPreferences: { preload: path.join(__dirname,'preload.js'), contextIsolation:true }
  });
  win.loadFile(path.join(__dirname,'renderer','dist','index.html'));
});
