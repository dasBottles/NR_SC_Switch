// renderer/src/components/SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;         /* center everything horizontally */
  justify-content: center;     /* center vertically if you give it a height */
  min-height: 100vh;           /* fill viewport vertically */
  background: #f3f4f6;
  padding: 2rem;
`;

const Panel = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Back = styled.button`
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  margin: 0 0 1.5rem;
  text-align: center;
  color: #1f2937;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;                   /* bigger gap between field groups */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;         /* center label+input+button */
  text-align: center;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0.5rem;       /* space below the label */
`;

const Input = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 0.75rem;      /* space below the input */
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  min-width: 140px;
  &:hover {
    background: #2563eb;
  }
`;

const Status = styled.p`
  margin-top: 1rem;
  font-size: 0.85rem;
  color: ${props => (props.error ? 'tomato' : 'green')};
  text-align: center;
`;

export default function SettingsForm({ onClose }) {
  const [steamID, setSteamID]         = useState('');
  const [playerCount, setPlayerCount] = useState('2');
  const [status, setStatus]           = useState(null);

  useEffect(() => {
    window.electronAPI.readConfig()
      .then(({ steamID }) => setSteamID(steamID))
      .catch(console.error);
    window.electronAPI.readNrscSettings()
      .then(({ playerCount }) => setPlayerCount(playerCount))
      .catch(console.error);
  }, []);

  const saveSteam = async () => {
    await window.electronAPI.writeConfig({ steamID });
    setStatus({ text: 'SteamID saved!', error: false });
  };

  const saveCount = async () => {
    const res = await window.electronAPI.updatePlayerCount(playerCount);
    if (res.success) {
      setStatus({ text: 'Player count saved!', error: false });
    } else {
      setStatus({ text: `Error: ${res.error}`, error: true });
    }
  };

  return (
    <Container>
      <Panel>
        <Back onClick={onClose}>← Back</Back>
        <Title>Settings</Title>
        <Form>
          <FormGroup>
            <Label htmlFor="steamID">Steam ID</Label>
            <Input
              id="steamID"
              value={steamID}
              placeholder={steamID}
              onChange={e => setSteamID(e.target.value)}
            />
            <Button onClick={saveSteam}>Save SteamID</Button>
          </FormGroup>

          <FormGroup>
            <Label>Player Count</Label>
            <RadioGroup>
              {['2','3'].map(val => (
                <RadioLabel key={val}>
                  <input
                    type="radio"
                    name="playerCount"
                    value={val}
                    checked={playerCount===val}
                    onChange={() => setPlayerCount(val)}
                  />
                  {val} Players
                </RadioLabel>
              ))}
            </RadioGroup>
            <Button onClick={saveCount}>Save Player Count</Button>
          </FormGroup>
        </Form>

        {status && (
          <Status error={status.error}>{status.text}</Status>
        )}
      </Panel>
    </Container>
  );
}
