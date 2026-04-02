const { spawn } = require('node:child_process')
const path = require('node:path')

function getPackageRoot() {
  const packageJsonPath = String(process.env.npm_package_json ?? '').replace(/^\\\\\?\\/, '')

  if (!packageJsonPath) {
    throw new Error('npm_package_json is missing; cannot resolve package root')
  }

  return path.dirname(packageJsonPath)
}

function run(relativeEntryPath, args = []) {
  const rootDir = getPackageRoot()
  const entryPath = path.resolve(rootDir, relativeEntryPath)
  const child = spawn(process.execPath, [entryPath, ...args], {
    cwd: rootDir,
    stdio: 'inherit',
    env: process.env,
  })

  child.once('error', error => {
    console.error(error)
    process.exit(1)
  })

  child.once('exit', code => {
    process.exit(code ?? 0)
  })
}

module.exports = {
  run,
}
