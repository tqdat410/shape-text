import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const appDir = path.resolve(rootDir, 'examples/react-published-package-consumer')
const viteCli = path.resolve(rootDir, 'node_modules/vite/bin/vite.js')
const viteConfig = path.resolve(appDir, 'vite.config.ts')
const port = String(Number(process.env.PORT ?? 4175))
const isPreview = process.argv.includes('--preview')
const isBuildOnly = process.argv.includes('--build')

function spawnVite(args) {
  return spawn(process.execPath, [viteCli, ...args], {
    cwd: appDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: port,
    },
  })
}

function runVite(args) {
  return new Promise((resolve, reject) => {
    const child = spawnVite(args)

    child.once('error', reject)
    child.once('exit', code => {
      if (code && code !== 0) {
        reject(new Error(`vite exited with code ${code}`))
        return
      }

      resolve()
    })
  })
}

if (isBuildOnly || isPreview) {
  await runVite(['build', '--config', viteConfig])
}

if (isBuildOnly) {
  process.exit(0)
}

const serveArgs = [
  ...(isPreview ? ['preview'] : []),
  '--config',
  viteConfig,
  '--host',
  '127.0.0.1',
  '--port',
  port,
]

if (process.env.CI) {
  serveArgs.push('--strictPort')
}

const child = spawnVite(serveArgs)

child.once('error', error => {
  console.error(error)
  process.exit(1)
})

child.once('exit', code => {
  process.exit(code ?? 0)
})
