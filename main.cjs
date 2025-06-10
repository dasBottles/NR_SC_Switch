// main.cjs
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs        = require('fs');
const fsp       = fs.promises;
const path      = require('path');
const exists    = fs.existsSync;
const ini       = require('ini');
const { execFile } = require('child_process');

const USER_CFG_DIR  = app.getPath('userData');
const USER_CFG_PATH = path.join(USER_CFG_DIR, 'config.ini');

// 1) Ensure we have a writable copy of config.ini
function ensureConfig() {
  if (!fs.existsSync(USER_CFG_DIR)) fs.mkdirSync(USER_CFG_DIR, { recursive: true });
  // copy out our template on first run
  if (!exists(USER_CFG_PATH)) {
    // look for template in assets/config.template.ini (you should add this file)
    const devTpl  = path.join(__dirname, 'assets', 'config.template.ini');
    const prodTpl = path.join(process.resourcesPath, 'assets', 'config.template.ini');
    const tpl     = app.isPackaged && fs.existsSync(prodTpl) ? prodTpl : devTpl;
    fs.copyFileSync(tpl, USER_CFG_PATH);
  }  }


// 2) Load & parse the INI
function loadConfig() {
  try {
    const raw = fs.readFileSync(USER_CFG_PATH, 'utf-8');
    return ini.parse(raw);
  } catch {
    return {};
  }
}

// 3) Merge‐in only the fields passed
function saveConfig(updates) {
  const cfg = loadConfig();
  cfg.Paths = cfg.Paths || {};
  Object.assign(cfg.Paths, updates);
  fs.writeFileSync(USER_CFG_PATH, ini.stringify(cfg), 'utf-8');
}

// ─── CONFIG IPC ───────────────────────────────────────────────────────────────
ipcMain.handle('read-config',  ()    => loadConfig());
ipcMain.handle('write-config', (_e,u) => (saveConfig(u), true));

// ─── NRSC SETTINGS IPC ───────────────────────────────────────────────────────
ipcMain.handle('read-nrsc-settings', async () => {
  const cfg     = loadConfig();
  const gameDir = cfg.Paths?.GameDir || '';
  const iniPath = path.join(gameDir, 'SeamlessCoop', 'nrsc_settings.ini');
  try {
    const raw  = await fsp.readFile(iniPath, 'utf-8');
    const o    = ini.parse(raw);
    return { playerCount: o.GAMEPLAY?.player_count || '2' };
  } catch {
    return { playerCount: '2' };
  }
});

// ─── Detect current environment ─────────────────────────────────────────────
ipcMain.handle('detect-env', () => {
  const cfg = loadConfig();
  const gameDir = cfg.Paths?.GameDir || '';
  const dll       = path.join(gameDir, 'dinput8.dll');
  const disabled  = path.join(gameDir, 'dinput8.disabled');
  if (fs.existsSync(disabled))  return 'live';
  if (fs.existsSync(dll))       return 'modded';
  return 'unknown';
});

ipcMain.handle('update-player-count', async (_e, newCount) => {
  const cfg     = loadConfig();
  const gameDir = cfg.Paths?.GameDir || '';
  const iniPath = path.join(gameDir, 'SeamlessCoop', 'nrsc_settings.ini');
  try {
    const lines = (await fsp.readFile(iniPath, 'utf-8'))
      .split(/\r?\n/)
      .map(line => line.match(/^\s*player_count\s*=/)
        ? `player_count = ${newCount}`
        : line
      );
    await fsp.writeFile(iniPath, lines.join('\r\n'), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('update-player-count failed:', err);
    return { success: false, error: err.message };
  }
});

// ─── FILESYSTEM IPC ─────────────────────────────────────────────────────────
ipcMain.handle('file-exists',  (_e, p)       => fs.existsSync(p));
ipcMain.handle('copy-file',    async (_e,s,d) => {
  try { await fsp.copyFile(s,d); return { success:true } }
  catch(err){ return { success:false, error:err.message } }
});
ipcMain.handle('rename-file',  async (_e,s,nm) => {
  try {
    const dest = path.join(path.dirname(s), nm);
    await fsp.rename(s,dest);
    return { success: true };
  } catch(err) {
    return { success:false, error:err.message };
  }
});

// ─── PROCESS & URL IPC ───────────────────────────────────────────────────────
ipcMain.handle('open-external', (_e, url) => shell.openExternal(url));
ipcMain.handle('exec-file',      (_e, exe, opts={}) => {
  return new Promise(resolve => {
    const args = opts.args || [];
    const cwd  = opts.cwd  || path.dirname(exe);
    execFile(exe, args, { cwd }, (err, stdout, stderr) => {
      if (err) resolve({ success:false, error: stderr||err.message });
      else     resolve({ success:true, output: stdout });
    });
  });
});

// ─── ENV SWITCH IPC ──────────────────────────────────────────────────────────
function getPSScript() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts','NightShift.ps1')
    : path.join(__dirname, 'scripts','NightShift.ps1');
}

ipcMain.handle('run-env-switch', async (_e, env) => {
  const cfg       = loadConfig();
  const steamID   = cfg.Paths?.SteamID  || '';
  const gameDir   = cfg.Paths?.GameDir  || '';
  const launchers = cfg.Launchers    || {};
  const liveL     = launchers.LiveLauncher;
  const modL      = launchers.ModdedLauncher;
  const script    = getPSScript();

  // detect current env
  const dll       = path.join(gameDir,'dinput8.dll');
  const disabled  = path.join(gameDir,'dinput8.disabled');
  const isLive    = fs.existsSync(disabled);
  const current   = isLive ? 'live' : 'modded';

  if (current !== env) {
    // run PS1 to swap saves & DLL
    await new Promise(res => {
      execFile('powershell.exe',[
        '-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass',
        '-File', script, env, steamID, gameDir
      ],()=> res());
    });
  }

  // launch
  if (env==='live') {
    await shell.openExternal(liveL);
  } else {
    await execFile(path.join(gameDir,modL), [], { cwd:gameDir });
  }
  return `launched ${env}`;
});

// ─── CREATE WINDOW ──────────────────────────────────────────────────────────
app.whenReady().then(()=>{
  ensureConfig();
  const win = new BrowserWindow({
    width:400, height:500,
    webPreferences:{
      preload: path.join(__dirname,'preload.cjs'),
      contextIsolation:true,
      nodeIntegration:false,
      sandbox:false
    }
  });
  if (process.env.NODE_ENV==='development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname,'dist','index.html'));
  }
});

app.on('window-all-closed',()=>{ if(process.platform!=='darwin') app.quit(); });
