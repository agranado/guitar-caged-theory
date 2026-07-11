/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built site works from GitHub Pages (project subpath)
// and directly from the file:// protocol.
// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // jsdom only exposes localStorage for a non-opaque origin.
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    setupFiles: ['./src/test-setup.ts'],
  },
})
