import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const configDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(configDir, '..', '..')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'shape-text': path.resolve(rootDir, 'src/index.ts'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4175,
  },
  preview: {
    host: '127.0.0.1',
    port: 4175,
  },
})
