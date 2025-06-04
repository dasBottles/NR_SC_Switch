import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'renderer',
  base: './',
  build: {
    outDir: 'dist',         // ✅ Relative to 'root', not full path
    emptyOutDir: true
  },
  plugins: [react()]
});
