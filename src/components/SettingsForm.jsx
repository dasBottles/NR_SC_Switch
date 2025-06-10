// renderer/src/SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: .5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-width: 500px;
  margin: 2rem auto;
`;
const Back = styled.button`
  background: transparent;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: .9rem;
  margin-bottom: 1rem;
`;
const Title = styled.h2`
  margin: 0 0 1rem;
  color: #333;
`;
const FormGroup = styled.form`
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin-bottom: 1.5rem;
`;
const Label = styled.label`
  font-size: .9rem;
  color: #444;
`;
const Input = styled.input`
  padding: .5rem;
  border: 1px solid #ccc;
  border-radius: .25rem;
`;
const Button = styled.button`
  align-self: flex-start;
  padding: .5rem 1rem;
  background: #0078d4;
  color: #fff;
  border: none;
  border-radius: .25rem;
  cursor: pointer;
  &:hover { background: #005a9e; }
`;
const Status = styled.p`
  margin-top: 1rem;
  color: ${p => (p.error ? 'tomato' : 'green')};
`;

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
    <Panel>
      <Back onClick={onClose}>← Back</Back>
      <Title>Settings</Title>

      <FormGroup onSubmit={savePaths}>
        <Label>Steam ID</Label>
        <Input value={steamID} onChange={e=>setSteamID(e.target.value)} />

        <Label>Game Directory</Label>
        <Input value={gameDir} onChange={e=>setGameDir(e.target.value)} />

        <Label>Live Launcher (Steam URL)</Label>
        <Input value={liveLauncher} onChange={e=>setLiveLauncher(e.target.value)} />

        <Label>Modded Launcher (EXE)</Label>
        <Input value={moddedLauncher} onChange={e=>setModdedLauncher(e.target.value)} />

        <Button type="submit">Save Paths</Button>
      </FormGroup>

      <FormGroup onSubmit={saveCount}>
        <Label>Player Count</Label>
        <div>
          {['2','3'].map(n => (
            <label key={n} style={{marginRight:'1rem'}}>
              <input
                type="radio"
                value={n}
                checked={playerCount===n}
                onChange={()=>setPlayerCount(n)}
              />{' '}
              {n} Players
            </label>
          ))}
        </div>
        <Button type="submit">Save Player Count</Button>
      </FormGroup>

      {status && (
        <Status error={status.error}>{status.text}</Status>
      )}
    </Panel>
  );
}
