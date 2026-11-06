// Smoke tests: the real CLI proxies real traffic. Built on node:* modules only,
// so they run on the lowest supported Node.js version as well.
// QORSPROXY_PKG points them to an installed package instead of the sources.
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const pkgDir = process.env.QORSPROXY_PKG || root
const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'))
const cli = path.join(pkgDir, pkg.bin)
const api = pathToFileURL(path.join(pkgDir, pkg.exports['.'].import)).href
const tls = {
  cert: fs.readFileSync(path.join(root, 'ssl/cert.pem')),
  key: fs.readFileSync(path.join(root, 'ssl/key.pem'))
}
const xlsx = fs.readFileSync(path.join(root, 'src/test/fixtures/test.xlsx'))

const listen = (server) => new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)))
const freePort = async () => {
  const server = http.createServer()
  const port = await listen(server)
  await new Promise(resolve => server.close(resolve))
  return port
}
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Array bodies are written chunk by chunk, so node:http switches to chunked transfer encoding
const request = (url, { method = 'GET', headers = {}, body } = {}) => new Promise((resolve, reject) => {
  const client = url.startsWith('https:') ? https : http
  const req = client.request(url, { method, headers, rejectUnauthorized: false }, async (res) => {
    const chunks = []
    for await (const chunk of res) chunks.push(chunk)
    resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() })
  })
  req.on('error', reject)
  ;[].concat(body ?? []).forEach(chunk => req.write(chunk))
  req.end()
})

describe('cli', () => {
  const hits = []
  const echo = async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    hits.push(req.url)
    res.setHeader('set-cookie', ['a=1', 'b=2'])
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ method: req.method, url: req.url, headers: req.headers, body: Buffer.concat(chunks).toString('base64') }))
  }
  const upstream = http.createServer(echo)
  const secureUpstream = https.createServer(tls, echo)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qorsproxy-smoke-'))
  let proxy, port, securePort, upstreamPort, secureUpstreamPort, stderr = ''

  before(async () => {
    upstreamPort = await listen(upstream)
    secureUpstreamPort = await listen(secureUpstream)
    port = await freePort()
    securePort = await freePort()

    const config = path.join(tmp, 'qorsproxy.yaml')
    fs.writeFileSync(config, [
      'log:',
      `  dir: ${tmp}`,
      'server:',
      '  host: 127.0.0.1',
      `  port: ${port}`,
      '  secure:',
      `    port: ${securePort}`,
      'rules:',
      '  local:',
      "    from: ['*']",
      "    to: ['*']",
      '    interceptions:',
      '      - req: { method: OPTIONS }',
      '        res: { status: 204 }',
      ''
    ].join('\n'))

    // Upstreams use a self-signed cert
    proxy = spawn(process.execPath, [cli, '--config', config], { env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: '0' } })
    proxy.stderr.on('data', chunk => { stderr += chunk })

    for (let i = 0; ; i++) {
      assert.equal(proxy.exitCode, null, `CLI exited: ${stderr}`)
      if (await request(`http://127.0.0.1:${port}/health`).then(({ status }) => status === 200, () => false)) break
      assert.ok(i < 100, `CLI is not ready: ${stderr}`)
      await sleep(100)
    }
  })

  after(async () => {
    proxy?.kill()
    upstream.close()
    secureUpstream.close()
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('exposes the public API', async () => {
    const { App } = await import(api)

    assert.equal(typeof App.main, 'function')
  })

  it('prints its version', () => {
    assert.equal(execFileSync(process.execPath, [cli, '--version'], { encoding: 'utf8' }).trim(), pkg.version)
  })

  it('reports health', async () => {
    const { status, body } = await request(`http://127.0.0.1:${port}/health`)

    assert.equal(status, 200)
    assert.equal(JSON.parse(body).status, 'UP')
  })

  it('proxies requests with query, basic auth and CORS', async () => {
    const authorization = 'Basic ' + Buffer.from('foo:bar').toString('base64')
    const origin = 'http://example.com'
    const { status, headers, body } = await request(`http://127.0.0.1:${port}/http://127.0.0.1:${upstreamPort}/path?x=1`, { headers: { authorization, origin } })
    const echoed = JSON.parse(body)

    assert.equal(status, 200)
    assert.equal(echoed.method, 'GET')
    assert.equal(echoed.url, '/path?x=1')
    assert.equal(echoed.headers.authorization, authorization)
    assert.equal(headers['access-control-allow-origin'], origin)
    assert.deepEqual(headers['set-cookie'], ['a=1', 'b=2'])
  })

  it('pipes binary multipart bodies', async () => {
    const boundary = 'qorsproxy'
    const multipart = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.xlsx"\r\nContent-Type: application/octet-stream\r\n\r\n`),
      xlsx,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])
    const { status, body } = await request(`http://127.0.0.1:${port}/http://127.0.0.1:${upstreamPort}/upload`, {
      method: 'POST',
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}`, 'content-length': multipart.length },
      body: multipart
    })
    const echoed = JSON.parse(body)

    assert.equal(status, 200)
    assert.equal(echoed.headers['content-type'], `multipart/form-data; boundary=${boundary}`)
    assert.equal(echoed.body, multipart.toString('base64'))
  })

  it('pipes chunked bodies', async () => {
    const { status, body } = await request(`http://127.0.0.1:${port}/http://127.0.0.1:${upstreamPort}/chunked`, {
      method: 'PUT',
      body: ['hello', ' ', 'world']
    })
    const echoed = JSON.parse(body)

    assert.equal(status, 200)
    assert.equal(Buffer.from(echoed.body, 'base64').toString(), 'hello world')
  })

  it('proxies to https upstreams', async () => {
    const { status, body } = await request(`http://127.0.0.1:${port}/https://localhost:${secureUpstreamPort}/secure`)

    assert.equal(status, 200)
    assert.equal(JSON.parse(body).url, '/secure')
  })

  it('serves https', async () => {
    const { status, body } = await request(`https://127.0.0.1:${securePort}/http://127.0.0.1:${upstreamPort}/via-https`)

    assert.equal(status, 200)
    assert.equal(JSON.parse(body).url, '/via-https')
  })

  it('intercepts requests by rule', async () => {
    const { status } = await request(`http://127.0.0.1:${port}/http://127.0.0.1:${upstreamPort}/intercepted`, { method: 'OPTIONS' })

    assert.equal(status, 204)
    assert.ok(!hits.includes('/intercepted'))
  })

  it('reports unreachable destinations', async () => {
    const { status, body } = await request(`http://127.0.0.1:${port}/http://127.0.0.1:${await freePort()}/`)

    assert.equal(status, 521)
    assert.match(JSON.parse(body).message, /^Connection refused/)
  })
})
