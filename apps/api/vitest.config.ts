import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Set before any app module is imported, so db.ts and area.ts read these values
    env: {
      DB_PATH: ':memory:',
      PLACES_API: 'https://places.test/?input=',
    },
  },
});
