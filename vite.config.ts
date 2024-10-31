import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    commonjsOptions: {
      include: [/pdfjs-dist/]
    },
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
  },
  esbuild: {
    target: 'es2020'
  }
});