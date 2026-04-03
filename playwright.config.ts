import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from '@playwright/test'

const rootDir = path.dirname(fileURLToPath(import.meta.url))
const demoScript = path.resolve(rootDir, 'scripts/run-demo-app.mjs')
const consumerScript = path.resolve(
  rootDir,
  'scripts/run-react-published-package-consumer-app.mjs',
)
const demoPort = Number(process.env.PLAYWRIGHT_PORT ?? 4174)
const consumerPort = Number(process.env.PLAYWRIGHT_CONSUMER_PORT ?? 4175)
const baseURL = `http://127.0.0.1:${demoPort}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: `"${process.execPath}" "${demoScript}" --preview`,
      url: `${baseURL}/`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: String(demoPort),
      },
    },
    {
      command: `"${process.execPath}" "${consumerScript}" --preview`,
      url: `http://127.0.0.1:${consumerPort}/`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: String(consumerPort),
      },
    },
  ],
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
