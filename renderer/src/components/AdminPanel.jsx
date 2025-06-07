// renderer/src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border: 1px dashed #d1d5db;
  background: #fafafa;
`;

const Title = styled.h4` margin-bottom: 1rem; `;
const ConfigList = styled.ul` list-style: none; padding: 0; margin: 0 0 1rem; `;
const ConfigItem = styled.li` font-size: 0.875rem; margin-bottom: 0.25rem; `;
const Button = styled.button`
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: 1px solid #9ca3af;
  background: #f9fafb;
  cursor: pointer;
  &:hover { background: #e5e7eb; }
`;

export default function AdminPanel() {
  // initialize with empty shape to avoid undefined properties
  const [config, setConfig] = useState({
    Paths: { SteamID: '', GameDir: '' },
    Launchers: { LiveLauncher: '', ModdedLauncher: '' }
  });

  useEffect(() => {
    // always await the promise, and give the result a distinct name
    window.electronAPI.readConfig()
      .then((cfg) => {
        setConfig(cfg);
      })
      .catch((err) => {
        console.error('Failed to load config:', err);
      });
  }, []);

  const run = async (action) => {
    const res = await window.electronAPI.adminAction(action);
    console.log('Admin action result:', action, res);
  };

  return (
    <Panel>
      <Title>Dev Admin Panel</Title>
      <ConfigList>
        <ConfigItem>SteamID: {config.Paths.SteamID || 'N/A'}</ConfigItem>
        <ConfigItem>GameDir: {config.Paths.GameDir || 'N/A'}</ConfigItem>
        <ConfigItem>LiveLauncher: {config.Launchers.LiveLauncher || 'N/A'}</ConfigItem>
        <ConfigItem>ModdedLauncher: {config.Launchers.ModdedLauncher || 'N/A'}</ConfigItem>
      </ConfigList>
      <div>
        <Button onClick={() => run('backup')}>Backup Saves</Button>
        <Button onClick={() => run('restoreLive')}>Restore Live</Button>
        <Button onClick={() => run('restoreModded')}>Restore Modded</Button>
        <Button onClick={() => run('disableDinput')}>Disable dinput8.dll</Button>
        <Button onClick={() => run('enableDinput')}>Enable dinput8.dll</Button>
      </div>
    </Panel>
  );
}
