import React, { createContext, useContext, useEffect, useState } from 'react';

const ConfigContext = createContext();

export function ConfigProvider({children}) {
  const [config, setRawConfig] = useState({Paths:{}});

  useEffect(() => {
    window.electronAPI.readConfig().then(parsed => setRawConfig(parsed));
  }, []);

  const writeConfig = async (update) => {
    await window.electronAPI.writeConfig(update);
    const refreshed = await window.electronAPI.readConfig();
    setRawConfig(refreshed);
  };

  return (
    <ConfigContext.Provider value={{config, writeConfig}}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() { return useContext(ConfigContext); }
