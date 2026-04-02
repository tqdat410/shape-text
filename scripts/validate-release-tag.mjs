import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const packageJsonPath = path.resolve(rootDir, 'package.json')

const tag = process.argv[2]
if (typeof tag !== 'string' || tag.length === 0) {
  throw new Error('release tag is required')
}

if (!/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(tag)) {
  throw new Error(`release tag "${tag}" must match v<semver>`)
}

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
const version = packageJson.version

if (typeof version !== 'string' || version.length === 0) {
  throw new Error('package.json version is missing')
}

if (`v${version}` !== tag) {
  throw new Error(
    `release tag "${tag}" does not match package.json version "v${version}"`,
  )
}
