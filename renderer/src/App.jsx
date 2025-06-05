// App.jsx
import React, { useState } from 'react';
import SettingsForm from './components/SettingsForm';
import './index.css';

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="w-full max-w-md p-6 bg-white rounded shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold">NightShift</h4>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1 border border-gray-400 rounded text-sm hover:bg-gray-200"
          >
            {showSettings ? 'Back' : 'Settings'}
          </button>
        </div>

        {showSettings ? (
          <SettingsForm />
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to NightShift</h2>
            <p className="text-gray-600 mb-6">Choose an environment to launch</p>
            <div className="flex flex-col gap-3">
              <button
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
                onClick={() => window.electronAPI.launchEnv('Live')}
              >
                Launch Live
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition"
                onClick={() => window.electronAPI.launchEnv('Modded')}
              >
                Launch Modded
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
