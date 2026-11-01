import { defineConfig } from 'vite'

// Creator deck at join.c-verse.co: own root, public dir, and output, deployed
// by wrangler.join.jsonc as a separate Worker from the Coming Soon page.
export default defineConfig({
  root: 'join',
  server: { host: true, port: 5175 },
  preview: { host: true, port: 4175 },
  build: { outDir: '../dist-join', emptyOutDir: true, assetsDir: 'assets' },
})
