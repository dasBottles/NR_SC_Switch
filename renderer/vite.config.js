import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: './dist',         // Output goes to root-level ./dist
    emptyOutDir: true,
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});
