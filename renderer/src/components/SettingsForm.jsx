// SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
`;

const Button = styled.button`
  background-color: ${(props) =>
    props.variant === 'save' ? '#3b82f6' : 'transparent'};
  color: ${(props) => (props.variant === 'save' ? 'white' : '#374151')};
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;

  &:hover {
    background-color: ${(props) =>
      props.variant === 'save' ? '#2563eb' : '#f3f4f6'};
  }
`;

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
`;

export default function SettingsForm({ onClose }) {
  // ‣ your two pieces of form state
  const [steamID, setSteamID] = useState('');
  const [playerCount, setPlayerCount] = useState('2');

  // ‣ status for feedback
  const [status, setStatus] = useState('');

  // load both values on mount
useEffect(() => {
  window.electronAPI.readConfig().then(({ steamID }) => {
    if (steamID) setSteamID(steamID);
  });

  window.electronAPI.readNrscSettings().then(({playerCount}) => {
    setPlayerCount(playerCount);
  });
}, []);

  // save SteamID alone
  const handleSaveSteamID = async (e) => {
    e.preventDefault();
    const result = await window.electronAPI.writeConfig({ steamID });
    if (result.success) {
      setStatus('✅ SteamID saved');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  // save PlayerCount alone
const handleSavePlayerCount = async (e) => {
  e.preventDefault();
  const result = await window.electronAPI.updatePlayerCount(playerCount);
      if (result.success) {
      setStatus('✅ Player count saved');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
};


  return (
    <Container>
      <Button variant="back" onClick={onClose}>
        ← Back
      </Button>
      <Title>Settings</Title>

      <Form onSubmit={handleSaveSteamID}>
        <Label htmlFor="steamID">Steam ID</Label>
        <Input
          id="steamID"
          value={steamID}
          onChange={(e) => setSteamID(e.target.value)}
        />
        <Button type="submit" variant="save">
          Save SteamID
        </Button>
      </Form>

    <Form onSubmit={handleSavePlayerCount} style={{ marginTop: '1rem' }}>
      <Label>Player Count</Label>
      <div>
        <label>
          <input
            type="radio"
            value="2"
            checked={playerCount === '2'}
            onChange={() => setPlayerCount('2')}
          />{' '}
          2 Players
        </label>{' '}
        <label style={{ marginLeft: '1rem' }}>
          <input
            type="radio"
            value="3"
            checked={playerCount === '3'}
            onChange={() => setPlayerCount('3')}
          />{' '}
          3 Players
        </label>
      </div>
      <Button type="submit" variant="save">
        Save Player Count
      </Button>
      {status && <p style={{ color: status.startsWith('✅') ? 'green' : 'red', marginTop: '1rem' }}>
        {status}
      </p>}
    </Form>
  </Container>
  );
}
