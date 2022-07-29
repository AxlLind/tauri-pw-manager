import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './ui',
  plugins: [ react() ],
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
  clearScreen: false,
});
