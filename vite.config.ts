import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './ui',
  plugins: [ react() ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: './build',
    emptyOutDir: true,
  },
  clearScreen: false,
  logLevel: 'warn',
});
