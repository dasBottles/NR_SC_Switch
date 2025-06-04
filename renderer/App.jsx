import React, { useState } from 'react';
import SettingsForm from './components/SettingsForm';

export default function App() {
  const [status, setStatus] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const launchEnv = (env) => {
    setStatus('Launching...');
    window.electronAPI?.runEnvSwitch?.(env);
  };

  window.electronAPI?.onRunResult?.((result) => {
    setStatus(result);
  });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">Elden Ring: NightShift</h1>
        <button className="btn btn-outline-secondary" onClick={() => setShowSettings(true)}>⚙ Settings</button>
      </div>
      {showSettings ? (
        <SettingsForm onClose={() => setShowSettings(false)} />
      ) : (
        <div className="text-center">
          <div className="btn-group mb-3">
            <button className="btn btn-primary" onClick={() => launchEnv('1')}>Launch Live</button>
            <button className="btn btn-success" onClick={() => launchEnv('2')}>Launch Modded</button>
          </div>
          <p className="text-muted">{status}</p>
        </div>
      )}
    </div>
  );
}
