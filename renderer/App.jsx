// App.jsx
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
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4 w-100" style={{ maxWidth: '480px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h4 mb-0">Elden Ring: <span className="text-primary">NightShift</span></h2>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
          >
            ⚙
          </button>
        </div>

        {showSettings ? (
          <SettingsForm onClose={() => setShowSettings(false)} />
        ) : (
          <>
            <div className="d-grid gap-3 mb-3">
              <button className="btn btn-primary" onClick={() => launchEnv('1')}>
                🚀 Launch Live
              </button>
              <button className="btn btn-success" onClick={() => launchEnv('2')}>
                🧪 Launch Modded
              </button>
            </div>
            <p className="text-center text-muted small mb-0">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
