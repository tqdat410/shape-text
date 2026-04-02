import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['e2e/**', 'examples/**', 'node_modules/**', 'dist/**', 'demo/dist/**', '.claude/**', 'coverage/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'demo/src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts', 'src/types.ts', 'demo/src/**/*.test.ts', 'demo/src/main.tsx'],
    },
  },
})
