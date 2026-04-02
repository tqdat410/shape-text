import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { spawn } from 'node:child_process'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const buildScript = path.resolve(rootDir, 'scripts/run-library-build.mjs')
const skipBuild = process.argv.includes('--skip-build')

function resolveCommand(command) {
  if (process.platform === 'win32' && command === 'npm') {
    return 'npm.cmd'
  }

  return command
}

function quoteShellArg(value) {
  if (value === '') {
    return '""'
  }

  if (!/[ \t"]/u.test(value)) {
    return value
  }

  return `"${value.replace(/"/g, '\\"')}"`
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const resolvedCommand = resolveCommand(command)
    const useShell = process.platform === 'win32' && !path.isAbsolute(resolvedCommand)
    const child = spawn(
      useShell
        ? [command, ...args].map(quoteShellArg).join(' ')
        : resolvedCommand,
      useShell ? [] : args,
      {
      cwd: options.cwd ?? rootDir,
      env: options.env ?? process.env,
      stdio: options.capture ? 'pipe' : 'inherit',
      shell: useShell,
    })

    let stdout = ''
    let stderr = ''

    if (options.capture) {
      child.stdout?.on('data', chunk => {
        stdout += String(chunk)
      })
      child.stderr?.on('data', chunk => {
        stderr += String(chunk)
      })
    }

    child.once('error', reject)
    child.once('exit', code => {
      if (code && code !== 0) {
        reject(
          new Error(
            `${command} ${args.join(' ')} exited with code ${code}${
              stderr ? `\n${stderr.trim()}` : ''
            }`,
          ),
        )
        return
      }

      resolve(stdout.trim())
    })
  })
}

async function createConsumerWorkspace(prefix, runner) {
  const consumerDir = await mkdtemp(path.join(os.tmpdir(), `${prefix}-`))
  const packageJson = {
    name: prefix,
    private: true,
    type: 'module',
  }
const smokeScript = `import { normalizeTextStyleToFont, prepareTextForLayout } from 'shape-text'

const style = normalizeTextStyleToFont({
  family: 'Arial, sans-serif',
  size: 16,
  weight: 700,
})

if (!style.font.includes('16px')) {
  throw new Error('Expected normalized font to include 16px')
}

const prepared = prepareTextForLayout('A B', style.font, {
  measureText(text) {
    return text.length * 10
  },
})

if (prepared.tokens.length !== 2) {
  throw new Error('Expected two measured tokens for A B')
}
`

  await writeFile(path.join(consumerDir, 'package.json'), JSON.stringify(packageJson, null, 2))
  await writeFile(path.join(consumerDir, 'smoke.mjs'), smokeScript)

  return {
    consumerDir,
    install(tarballPath) {
      return run(runner, runner === 'bun' ? ['add', tarballPath] : ['install', tarballPath], {
        cwd: consumerDir,
      })
    },
    execute() {
      return run(runner === 'bun' ? 'bun' : 'node', ['smoke.mjs'], {
        cwd: consumerDir,
      })
    },
  }
}

async function createTarball(packDir) {
  const npmPackOutput = await run(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', packDir],
    { capture: true },
  )
  const parsed = JSON.parse(npmPackOutput)
  const tarballName = parsed[0]?.filename
  if (typeof tarballName !== 'string') {
    throw new Error('npm pack did not return a tarball filename')
  }

  return path.resolve(packDir, tarballName)
}

if (!skipBuild) {
  await run(process.execPath, [buildScript])
}

const packDir = await mkdtemp(path.join(os.tmpdir(), 'shape-text-pack-'))

try {
  const tarballPath = await createTarball(packDir)

  await run('bun', ['pm', 'pack', '--ignore-scripts', '--dry-run'])

  const npmConsumer = await createConsumerWorkspace('shape-text-npm-smoke', 'npm')
  const bunConsumer = await createConsumerWorkspace('shape-text-bun-smoke', 'bun')

  try {
    await npmConsumer.install(tarballPath)
    await npmConsumer.execute()
    await bunConsumer.install(tarballPath)
    await bunConsumer.execute()
  } finally {
    await rm(npmConsumer.consumerDir, { recursive: true, force: true })
    await rm(bunConsumer.consumerDir, { recursive: true, force: true })
  }
} finally {
  await rm(packDir, { recursive: true, force: true })
}
