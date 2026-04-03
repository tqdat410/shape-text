import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      'shape-text': path.resolve(rootDir, 'src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['e2e/**', '**/node_modules/**', 'dist/**', 'demo/dist/**', '.claude/**', 'coverage/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'demo/src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts', 'src/types.ts', 'demo/src/**/*.test.ts', 'demo/src/main.tsx'],
    },
  },
})
