import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from '@playwright/test'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const demoScript = path.resolve(rootDir, 'scripts/run-demo-app.mjs')
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4174)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `"${process.execPath}" "${demoScript}" --preview`,
    url: `${baseURL}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      PORT: String(port),
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: {
          width: 1440,
          height: 900,
        },
      },
    },
  ],
})
