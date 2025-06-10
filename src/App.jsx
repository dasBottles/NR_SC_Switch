// renderer/src/App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import SettingsForm from './components/SettingsForm';
import { switchEnvironment } from './components/EnvSwitch';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Button = styled.button`
  margin: 0.5rem;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  cursor: pointer;
`;

const Status = styled.p`
  margin-top: 1rem;
`;

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [status, setStatus]             = useState('');

  const handleLaunch = async env => {
    setStatus(`Launching ${env}…`);
    try {
      const result = await switchEnvironment(env);
      setStatus(result);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  if (showSettings) {
    return <SettingsForm onClose={()=>setShowSettings(false)} />;
  }

  return (
    <Container>
      <h1>NightShift</h1>
      <Button onClick={()=>handleLaunch('live')}>Launch Live</Button>
      <Button onClick={()=>handleLaunch('modded')}>Launch Modded</Button>
      <Button onClick={()=>setShowSettings(true)}>Settings</Button>
      {status && <Status>{status}</Status>}
    </Container>
  );
}
