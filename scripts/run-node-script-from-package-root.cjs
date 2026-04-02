const { spawn } = require('node:child_process')
const path = require('node:path')

function getPackageRoot() {
  let packageJsonPath = String(process.env.npm_package_json ?? '')

  if (
    packageJsonPath.charCodeAt(0) === 92 &&
    packageJsonPath.charCodeAt(1) === 92 &&
    packageJsonPath.charCodeAt(2) === 63 &&
    packageJsonPath.charCodeAt(3) === 92
  ) {
    packageJsonPath = packageJsonPath.slice(4)
  }

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
