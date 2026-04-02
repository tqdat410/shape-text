import { spawn } from 'node:child_process'
import path from 'node:path'

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

function getNpmExecPath() {
  const npmExecPath = String(process.env.npm_execpath ?? '')

  if (!npmExecPath) {
    throw new Error('npm_execpath is missing; cannot invoke npm publish')
  }

  return npmExecPath
}

const rootDir = getPackageRoot()
const npmExecPath = getNpmExecPath()
const publishArgs = ['publish', '--access', 'public', ...process.argv.slice(2)]

const child = spawn(process.execPath, [npmExecPath, ...publishArgs], {
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
