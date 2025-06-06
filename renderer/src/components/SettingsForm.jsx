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

const SaveButton = styled.button`
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const BackButton = styled.button`
  background-color: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  align-self: flex-start;
  margin-bottom: 1rem;
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

function SettingsForm({ onClose }) {
  const [steamID, setSteamID] = useState('');

  useEffect(() => {
    window.electronAPI.readConfig().then(config => {
      if (config?.steamID) setSteamID(config.steamID);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    window.electronAPI.writeConfig({ steamID });
  };

  return (
    <Container>
      <BackButton onClick={onClose}>← Back</BackButton>
      <Title>Settings</Title>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="steamID">Steam ID</Label>
        <Input
          id="steamID"
          value={steamID}
          onChange={(e) => setSteamID(e.target.value)}
        />
        <SaveButton type="submit">Save</SaveButton>
      </Form>
    </Container>
  );
}

export default SettingsForm;
