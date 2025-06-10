// renderer/src/App.jsx
import React, { useState, useEffect } from 'react';
import SettingsForm from './components/SettingsForm';
import { switchEnvironment } from './components/EnvSwitch';


export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus]             = useState('');
  const [currentEnv, setCurrentEnv]     = useState('null');

  const handleLaunch = async env => {
    setStatus(`Launching ${env}…`);
    try {
      const result = await switchEnvironment(env);
      setStatus(result);
      
      const newEnv = await window.electronAPI.detectEnv().then(setCurrentEnv);
      
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    window.electronAPI
    .detectEnv()
    .then(env => setCurrentEnv(env))
    .catch(() => setCurrentEnv('unknown'));
  }, []);

    if (currentEnv === null) {
    return <Container>Detecting environment...</Container>;
  }

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <SettingsForm onClose={() => setShowSettings(false)} />
        </div>
      </div>
    );
  }

  return (
 <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">NightShift</h1>
        <p className="text-gray-600 mb-6">Current Env: <span className="font-medium">{currentEnv || 'detecting…'}</span></p>

        <button
          className="w-full py-3 mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
          onClick={() => handleLaunch('live')}
        >
          Launch Live
        </button>

        <button
          className="w-full py-3 mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded"
          onClick={() => handleLaunch('modded')}
        >
          Launch Modded
        </button>

        <button
          className="text-blue-500 hover:underline font-medium"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>

        {status && (
          <p className="mt-4 text-gray-700">{status}</p>
        )}
      </div>
    </div>
  );
}