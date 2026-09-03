import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standalone Vite build for free static hosting (e.g. GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
});
