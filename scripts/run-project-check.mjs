import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const typeScriptCli = path.resolve(rootDir, 'node_modules/typescript/bin/tsc')
const vitestCli = path.resolve(rootDir, 'node_modules/vitest/vitest.mjs')

function runNode(entryPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [entryPath, ...args], {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    })

    child.once('error', reject)
    child.once('exit', code => {
      if (code && code !== 0) {
        reject(new Error(`${path.basename(entryPath)} exited with code ${code}`))
        return
      }

      resolve()
    })
  })
}

await runNode(typeScriptCli, ['-p', 'tsconfig.json', '--noEmit'])
await runNode(vitestCli, ['run'])
