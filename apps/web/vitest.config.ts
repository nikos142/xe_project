import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',             // a fake browser (document, window) inside Node
    setupFiles: ['./src/test/setup.ts'],
  },
});
