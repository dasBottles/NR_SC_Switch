// SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

function SettingsForm() {
  const [steamID, setSteamID] = useState('');
  const [gameDir, setGameDir] = useState('');

  useEffect(() => {
    // Load settings from backend if available
    window.api.readConfig().then(config => {
      if (config) {
        setSteamID(config.SteamID || '');
        setGameDir(config.GameDir || '');
      }
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.api.writeConfig({
      SteamID: steamID,
      GameDir: gameDir
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Settings</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formSteamID" className="mb-3">
          <Form.Label>Steam ID</Form.Label>
          <Form.Control
            type="text"
            value={steamID}
            onChange={(e) => setSteamID(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formGameDir" className="mb-3">
          <Form.Label>Game Directory</Form.Label>
          <Form.Control
            type="text"
            value={gameDir}
            onChange={(e) => setGameDir(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save
        </Button>
      </Form>
    </div>
  );
}

export default SettingsForm;
