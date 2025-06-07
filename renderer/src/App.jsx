// App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import SettingsForm from './components/SettingsForm';


const Container = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
`;

const Card = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 350px;
  max-width: 90vw;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.125rem;
  font-weight: 600;
`;

const SettingsButton = styled.button`
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  background-color: transparent;
  cursor: pointer;
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subheading = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: grid;
  gap: 1rem;
`;

const LaunchButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border-radius: 0.375rem;
  color: white;
  border: none;
  cursor: pointer;
  background-color: ${(props) => (props.variant === 'modded' ? '#10b981' : '#3b82f6')};
  &:hover {
    background-color: ${(props) => (props.variant === 'modded' ? '#059669' : '#2563eb')};
  }
`;

function App() {
  const [showSettings, setShowSettings] = useState(false);
  console.log('🔌 electronAPI =', window.electronAPI);
const handleLaunch = async (env) => {
    console.log('Calling handleLaunch with:', env);
    // setStatus(`Launching ${env}…`);
    try {
      // if you aliased it in preload to handleLaunch:
      const result = await window.electronAPI.handleLaunch(env);
      console.log('↩️ got result:', result);
      // setStatus(result);
    } catch (err) {
      console.error('💥 handleLaunch error:', err);
      // setStatus(`Error: ${err.message}`);
    }
  };
  return (
    <Container>
      <Card>
        {showSettings ? (
          <SettingsForm onClose={() => setShowSettings(false)} />
        ) : (
          <>
            <Header>
              <Title>NightShift</Title>
              <SettingsButton onClick={() => setShowSettings(true)}>
                Settings
              </SettingsButton>
            </Header>
            <Heading>Welcome to NightShift</Heading>
            <Subheading>Choose an environment to launch</Subheading>
            <ButtonGroup>
              <LaunchButton onClick={() => handleLaunch('Live')}>Launch Live</LaunchButton>
              <LaunchButton variant="modded" onClick={() => handleLaunch('Modded')}>
                Launch Modded
              </LaunchButton>
            </ButtonGroup>
          </>
        )}
      </Card>
    </Container>
  );
}

export default App;
