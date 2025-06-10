// renderer/src/SettingsForm.jsx
import React, { useState, useEffect } from 'react';

export default function SettingsForm({ onClose }) {
  const [steamID, setSteamID]               = useState('');
  const [gameDir, setGameDir]               = useState('');
  const [liveLauncher, setLiveLauncher]     = useState('');
  const [moddedLauncher, setModdedLauncher] = useState('');
  const [playerCount, setPlayerCount]       = useState('2');
  const [status, setStatus]                 = useState(null);

  // load initial values
  useEffect(() => {
    window.electronAPI.readConfig()
      .then(cfg => {
        setSteamID(cfg.Paths.SteamID  || '');
        setGameDir(cfg.Paths.GameDir  || '');
        setLiveLauncher(cfg.Launchers.LiveLauncher   || '');
        setModdedLauncher(cfg.Launchers.ModdedLauncher || '');
      });
    window.electronAPI.readNrscSettings()
      .then(({ playerCount }) => {
        setPlayerCount(playerCount);
      });
  }, []);

  // Save only the fields the user changed
  const savePaths = async e => {
    e.preventDefault();
    const updates = {};
    if (steamID)       updates.steamID       = steamID;
    if (gameDir)       updates.gameDir       = gameDir;
    if (liveLauncher)  updates.liveLauncher  = liveLauncher;
    if (moddedLauncher)updates.moddedLauncher= moddedLauncher;

    if (Object.keys(updates).length === 0) {
      setStatus({ text: 'Nothing to save', error: true });
      return;
    }
    const res = await window.electronAPI.writeConfig(updates);
    setStatus(res.success
      ? { text: 'Paths saved!', error: false }
      : { text: `Error: ${res.error}`, error: true }
    );
  };

  const saveCount = async e => {
    e.preventDefault();
    const res = await window.electronAPI.updatePlayerCount(playerCount);
    setStatus(res.success
      ? { text: 'Player count saved!', error: false }
      : { text: `Error: ${res.error}`, error: true }
    );
  };

 return (
    <form className="space-y-6" onSubmit={savePaths}>
      <button
        type="button"
        className="text-gray-600 hover:text-gray-800"
        onClick={onClose}
      >
        ← Back
      </button>

      <h2 className="text-xl font-bold">Settings</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700">Steam ID</label>
        <input
          type="text"
          value={steamID}
          onChange={e => setSteamID(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Game Directory</label>
        <input
          type="text"
          value={gameDir}
          onChange={e => setGameDir(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Live Launcher URL</label>
        <input
          type="text"
          value={liveLauncher}
          onChange={e => setLiveLauncher(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Modded Launcher EXE</label>
        <input
          type="text"
          value={moddedLauncher}
          onChange={e => setModdedLauncher(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* <button
        type="submit"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
      >
        Save Paths
      </button> */}

      <fieldset className="mt-8">
        <legend className="text-sm font-medium text-gray-700 mb-2">Player Count</legend>
        <div className="space-x-4">
          {['2','3'].map(n => (
            <label key={n} className="inline-flex items-center space-x-1">
              <input
                type="radio"
                value={n}
                checked={playerCount === n}
                onChange={() => setPlayerCount(n)}
                className="text-blue-600"
              />
              <span>{n} Players</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={saveCount}
          className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
        >
          Save Player Count
        </button>
      </fieldset>

      {status && (
        <p className={`mt-4 text-sm ${status.error ? 'text-red-600' : 'text-green-600'}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}