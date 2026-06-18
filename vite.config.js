import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
    port: 5173,
  }
});
