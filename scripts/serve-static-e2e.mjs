import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT ?? 4173)
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
])

function resolveRequestPath(urlPath) {
  const normalizedPath = urlPath === '/' ? '/e2e/fixtures/index.html' : urlPath
  const diskPath = path.resolve(rootDir, `.${normalizedPath}`)

  if (!diskPath.startsWith(rootDir)) {
    return null
  }

  return diskPath
}

const server = createServer(async (request, response) => {
  const requestPath = request.url ? new URL(request.url, `http://127.0.0.1:${port}`).pathname : '/'
  const diskPath = resolveRequestPath(requestPath)

  if (diskPath === null) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const file = await readFile(diskPath)
    const ext = path.extname(diskPath)
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': contentTypes.get(ext) ?? 'application/octet-stream',
    })
    response.end(file)
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end(`Not found: ${requestPath}`)
  }
})

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`shape-text e2e server listening on http://127.0.0.1:${port}\n`)
})

