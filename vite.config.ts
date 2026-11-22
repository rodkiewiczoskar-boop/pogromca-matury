/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: './',
  plugins: [preact()],
  build: { chunkSizeWarningLimit: 6000 },
  test: { setupFiles: ['tests/setup.ts'], testTimeout: 60000 },
});
