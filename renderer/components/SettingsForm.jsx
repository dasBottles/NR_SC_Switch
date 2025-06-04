import React, { useState, useEffect } from 'react';

export default function SettingsForm({ onClose }) {
  const [steamID, setSteamID] = useState('');
  const [gameDir, setGameDir] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    window.electronAPI?.loadConfig?.(({ steamID, gameDir }) => {
      setSteamID(steamID);
      setGameDir(gameDir);
    });
  }, []);

  const handleSave = () => {
    window.electronAPI?.saveConfig?.({ steamID, gameDir });
    setStatus('✅ Saved successfully');
  };

  return (
    <div className="card mx-auto p-4" style={{ maxWidth: '400px' }}>
      <h2 className="card-title h5 mb-3">Settings</h2>
      <div className="mb-3">
        <label htmlFor="steamID" className="form-label">SteamID</label>
        <input id="steamID" type="text" className="form-control" value={steamID} onChange={(e) => setSteamID(e.target.value)} />
      </div>
      <div className="mb-3">
        <label htmlFor="gameDir" className="form-label">Game Directory (optional)</label>
        <input id="gameDir" type="text" className="form-control" value={gameDir} onChange={(e) => setGameDir(e.target.value)} />
      </div>
      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
      {status && <div className="text-success mt-2 small">{status}</div>}
    </div>
  );
}
