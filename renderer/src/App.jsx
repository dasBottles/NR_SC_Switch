// App.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import SettingsForm from './components/SettingsForm';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f3f4f6;
  color: #1f2937;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 28rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;

const SettingsButton = styled.button`
  padding: 0.25rem 0.75rem;
  border: 1px solid #9ca3af;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  &:hover {
    background-color: #e5e7eb;
  }
`;

const CenterText = styled.div`
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const SubText = styled.p`
  color: #4b5563;
  margin-bottom: 1.5rem;
`;

const LaunchButton = styled.button`
  padding: 0.5rem 1rem;
  color: white;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
  margin-bottom: 0.75rem;

  &:first-of-type {
    background-color: #2563eb;
    &:hover {
      background-color: #1d4ed8;
    }
  }

  &:last-of-type {
    background-color: #16a34a;
    &:hover {
      background-color: #15803d;
    }
  }
`;

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Container>
      <Wrapper>
        <Header>
          <Title>NightShift</Title>
          <SettingsButton onClick={() => setShowSettings(!showSettings)}>
            {showSettings ? 'Back' : 'Settings'}
          </SettingsButton>
        </Header>

        {showSettings ? (
          <SettingsForm />
        ) : (
          <CenterText>
            <Heading>Welcome to NightShift</Heading>
            <SubText>Choose an environment to launch</SubText>
            <div className="d-flex flex-column align-items-center">
              <LaunchButton onClick={() => window.electronAPI.launchEnv('Live')}>
                Launch Live
              </LaunchButton>
              <LaunchButton onClick={() => window.electronAPI.launchEnv('Modded')}>
                Launch Modded
              </LaunchButton>
            </div>
          </CenterText>
        )}
      </Wrapper>
    </Container>
  );
}

export default App;
