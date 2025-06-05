// SettingsForm.jsx
import React, { useState, useEffect } from 'react';

export default function SettingsForm({ onClose }) {
  const [steamID, setSteamID] = useState('');
  const [configPath, setConfigPath] = useState('');
  const [fullConfig, setFullConfig] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const result = await window.electronAPI?.readConfig?.();
        if (!result) return;

        const { path, config } = result;
        setConfigPath(path);
        setFullConfig(config || {});
        setSteamID(config?.Paths?.SteamID || '');
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      const updatedConfig = {
        ...fullConfig,
        Paths: {
          ...fullConfig.Paths,
          SteamID: steamID
        }
      };
      await window.electronAPI?.writeConfig?.(updatedConfig, configPath);
      setStatus('✅ Saved!');
    } catch (err) {
      console.error('Failed to save config:', err);
      setStatus('❌ Save failed');
    }
  };

  return (
    <div>
      <h5>Settings</h5>
      <div className="mb-3">
        <label htmlFor="steamID" className="form-label">Steam ID</label>
        <input
          type="text"
          className="form-control"
          id="steamID"
          value={steamID}
          onChange={(e) => setSteamID(e.target.value)}
        />
      </div>
      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave}>Save</button>
      </div>
      {status && <div className="text-success small mt-2">{status}</div>}
      {configPath && <div className="text-muted small mt-1">Config path: {configPath}</div>}
    </div>
  );
}
