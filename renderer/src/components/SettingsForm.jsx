// SettingsForm.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
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

function SettingsForm() {
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
    <Form onSubmit={handleSubmit}>
      <Label htmlFor="steamID">Steam ID</Label>
      <Input
        id="steamID"
        value={steamID}
        onChange={(e) => setSteamID(e.target.value)}
      />
      <SaveButton type="submit">Save</SaveButton>
    </Form>
  );
}

export default SettingsForm;
