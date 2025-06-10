// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Project root (where index.html lives)
  root: '.',

  // Base public path when served or built
  base: './',

  // Directory to serve as-is
  publicDir: 'public',

  build: {
    // output dir
    outDir: 'dist',
    // clean outDir on build
    emptyOutDir: true,
    // ensure index.html is the entry
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },

  resolve: {
    // so you can import from '@/components/SettingsForm'
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  plugins: [
    // enable React Fast Refresh, JSX, etc.
    react(),
    tailwindcss(),
  ],

  css: {
    postcss: {},
  }
});
