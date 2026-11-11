import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'

// Keep the independently deployed sites on one visitor notice source.
const privacyNotice = () => readFileSync(new URL('./public/privacy.html', import.meta.url), 'utf8')

// Creator deck at join.c-verse.co: own root, public dir, and output, deployed
// by wrangler.join.jsonc as a separate Worker from the Coming Soon page.
export default defineConfig({
  root: 'join',
  plugins: [{
    name: 'shared-privacy-notice',
    configureServer(server) {
      server.middlewares.use('/privacy.html', (_request, response) => {
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(privacyNotice())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'privacy.html', source: privacyNotice() })
    },
  }],
  server: { host: true, port: 5175 },
  preview: { host: true, port: 4175 },
  build: { outDir: '../dist-join', emptyOutDir: true, assetsDir: 'assets' },
})
