// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <-- 1. MUST BE HERE (Requires npm install path)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Thesis_and_project_management",
  resolve: { 
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- 2. MUST BE HERE
    },
  },
  server: {
    port: 5173,
    strictPort: true
  }
});