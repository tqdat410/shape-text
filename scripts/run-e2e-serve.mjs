import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const skipBuild = process.argv.includes('--skip-build')

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['./node_modules/typescript/lib/tsc.js', '-p', 'tsconfig.build.json'],
      {
        cwd: rootDir,
        stdio: 'inherit',
      },
    )

    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Build failed with exit code ${code ?? 'unknown'}`))
    })
  })
}

if (!skipBuild) {
  await runBuild()
}

await import('./serve-static-e2e.mjs')
