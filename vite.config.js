// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adjust base if necessary
  base: '/', // or '/subdirectory/' if deployed there

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },

  server: {
    historyApiFallback: true, // Ensures fallback to index.html for SPA routing
  },

  define: {
    "process.env": process.env,
  },
});