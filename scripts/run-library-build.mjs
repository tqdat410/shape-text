import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { spawn } from 'node:child_process'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const distDir = path.resolve(rootDir, 'dist')
const typeScriptCli = path.resolve(rootDir, 'node_modules/typescript/bin/tsc')

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

await rm(distDir, { recursive: true, force: true })
await runNode(typeScriptCli, ['-p', 'tsconfig.build.json'])
