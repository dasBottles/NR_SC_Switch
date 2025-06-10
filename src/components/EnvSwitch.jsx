// /src/env-switch.js
export async function switchEnvironment(env) {
  // 1) Read user config (SteamID, GameDir, launchers)
  const cfg = await window.electronAPI.readConfig();
  const steamID = cfg.Paths.SteamID;
  const gameDir = cfg.Paths.GameDir;
  const launchers = cfg.Launchers || {};
  const liveLauncher   = launchers.LiveLauncher;
  const moddedLauncher = launchers.ModdedLauncher;

  // 2) Detect current environment via the presence of dinput8.disabled
  const dllPath         = `${gameDir}\\dinput8.dll`;
  const dllDisabledPath = `${gameDir}\\dinput8.disabled`;
  const isDisabled      = await window.electronAPI.fileExists(dllDisabledPath);
  const currentEnv      = isDisabled ? 'live' : 'modded';

  console.log(`[env-switch] current=${currentEnv} requested=${env}`);

  // 3) Only swap saves & DLL if changing env
  if (currentEnv !== env) {
    const saveDir = `${process.env.APPDATA}\\NightReign\\${steamID}`;

    if (env === 'live') {
      // .co2 -> .sl2
      const co2 = `${saveDir}\\NR0000.co2`;
      if (await window.electronAPI.fileExists(co2)) {
        await window.electronAPI.copyFile(co2, `${saveDir}\\NR0000.sl2`);
      }
      // disable DLL
      if (await window.electronAPI.fileExists(dllPath)) {
        await window.electronAPI.renameFile(dllPath, 'dinput8.disabled');
      }
    } else {
      // .sl2 -> .co2
      const sl2 = `${saveDir}\\NR0000.sl2`;
      if (await window.electronAPI.fileExists(sl2)) {
        await window.electronAPI.copyFile(sl2, `${saveDir}\\NR0000.co2`);
      }
      // re-enable DLL
      if (await window.electronAPI.fileExists(dllDisabledPath)) {
        await window.electronAPI.renameFile(dllDisabledPath, 'dinput8.dll');
      }
    }
  } else {
    console.log(`[env-switch] skipping conversion (already ${env})`);
  }

  // 4) Launch the game
  if (env === 'live') {
    console.log('[env-switch] launching live via', liveLauncher);
    await window.electronAPI.openExternal(liveLauncher);
  } else {
    const exePath = `${gameDir}\\${moddedLauncher}`;
    console.log('[env-switch] launching modded via', exePath);
    await window.electronAPI.execFile(exePath, { cwd: gameDir });
  }

  return `Launched ${env}`;
}
