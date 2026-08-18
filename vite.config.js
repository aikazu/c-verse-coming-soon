import { defineConfig } from 'vite'

export default defineConfig({
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  // Three.js is inherently >500kB; a single-page hero gains nothing from code-splitting.
  build: { outDir: 'dist', assetsDir: 'assets', chunkSizeWarningLimit: 700 },
})
