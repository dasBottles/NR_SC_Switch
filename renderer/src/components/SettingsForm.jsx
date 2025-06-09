// SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  color: #1f2937;
`;

const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
`;

const Button = styled.button`
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: white;
  background: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1rem;
`;

const Status = styled.p`
  margin-top: 1rem;
  font-size: 0.85rem;
  color: ${p => (p.error ? 'tomato' : 'green')};
`;

export default function SettingsForm({ onClose }) {
  // state for each setting
  const [steamID, setSteamID]       = useState('');
  const [gameDir, setGameDir]       = useState('');
  const [liveLauncher, setLiveLauncher]   = useState('');
  const [moddedLauncher, setModdedLauncher] = useState('');
  const [playerCount, setPlayerCount] = useState('2');
  const [status, setStatus]         = useState(null);

  // load them on mount
  useEffect(() => {
    window.electronAPI.readConfig().then(cfg => {
      setSteamID(cfg.steamID || '');
      setGameDir(cfg.gameDir || '');
      setLiveLauncher(cfg.launchers?.live || '');
      setModdedLauncher(cfg.launchers?.modded || '');
    });
    window.electronAPI.readNrscSettings().then(({ playerCount }) => {
      setPlayerCount(playerCount);
    });
  }, []);

  // Save handlers
  const savePaths = async e => {
    e.preventDefault();
    const result = await window.electronAPI.writeConfig({
      steamID,
      gameDir,
      liveLauncher,
      moddedLauncher
    });
    if (result.success) setStatus({ text: '✅ Paths saved', error: false });
    else                setStatus({ text: `❌ ${result.error}`, error: true });
  };

  const savePlayerCount = async e => {
    e.preventDefault();
    const result = await window.electronAPI.updatePlayerCount(playerCount);
    if (result.success) setStatus({ text: '✅ Player count saved', error: false });
    else                setStatus({ text: `❌ ${result.error}`, error: true });
  };

  return (
    <Container>
      <BackButton onClick={onClose}>← Back</BackButton>
      <Title>Settings</Title>

      {/* SteamID + Paths */}
      <FormGroup onSubmit={savePaths}>
        <Label htmlFor="steamID">Steam ID</Label>
        <Input
          id="steamID"
          value={steamID}
          onChange={e => setSteamID(e.target.value)}
        />

        <Label htmlFor="gameDir">Game Directory</Label>
        <Input
          id="gameDir"
          value={gameDir}
          onChange={e => setGameDir(e.target.value)}
          placeholder="C:\Program Files (x86)\Steam\…\Game"
        />

        <Label htmlFor="liveLauncher">Live Launcher (Steam URL)</Label>
        <Input
          id="liveLauncher"
          value={liveLauncher}
          onChange={e => setLiveLauncher(e.target.value)}
          placeholder="steam://rungameid/2622380"
        />

        <Label htmlFor="moddedLauncher">Modded Launcher (EXE)</Label>
        <Input
          id="moddedLauncher"
          value={moddedLauncher}
          onChange={e => setModdedLauncher(e.target.value)}
          placeholder="nrsc_launcher.exe"
        />

        <Button type="submit">Save Paths</Button>
      </FormGroup>

      {/* Player Count */}
      <FormGroup onSubmit={savePlayerCount}>
        <Label>Player Count</Label>
        <div>
          {['2','3'].map(val => (
            <label key={val} style={{ marginRight: '1rem' }}>
              <input
                type="radio"
                name="playerCount"
                value={val}
                checked={playerCount===val}
                onChange={() => setPlayerCount(val)}
              />{' '}
              {val} Players
            </label>
          ))}
        </div>
        <Button type="submit">Save Player Count</Button>
      </FormGroup>

      {status && (
        <Status error={status.error}>{status.text}</Status>
      )}
    </Container>
  );
}
