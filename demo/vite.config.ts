import path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(configDir, '..')
const port = Number(process.env.PORT ?? 4173)

export default defineConfig({
  root: configDir,
  cacheDir: path.resolve(rootDir, 'node_modules/.vite-demo'),
  plugins: [react()],
  resolve: {
    alias: {
      'shape-text': path.resolve(rootDir, 'src/index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port,
  },
  preview: {
    host: '127.0.0.1',
    port,
  },
  build: {
    outDir: path.resolve(configDir, 'dist'),
    emptyOutDir: true,
  },
})
