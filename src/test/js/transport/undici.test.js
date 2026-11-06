import http from 'node:http'
import { request } from '../../../main/js/transport/undici.js'
import { ECONNREFUSED } from '../../../main/js/servlet/common/error.js'

const collect = async (body) => {
  const chunks = []
  for await (const chunk of body) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString()
}

describe('transport.undici', () => {
  const port = 8095
  const url = `http://127.0.0.1:${port}/foo?bar=baz`
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
  let server

  beforeAll(async () => {
    server = http.createServer(async (req, res) => {
      if (req.url === '/stall') return
      if (req.url === '/stall-body') return res.writeHead(200).write('partial')

      const body = await collect(req)
      res.setHeader('set-cookie', ['a=1', 'b=2'])
      res.setHeader('x-multi', ['c', 'd'])
      if (req.headers['x-foo']) res.setHeader('x-foo', req.headers['x-foo'])
      res.writeHead(201)
      res.end(`${req.method} ${req.url} ${body}`)
    })
    await new Promise(resolve => server.listen(port, '127.0.0.1', resolve))
  })

  afterAll(() => {
    server.closeAllConnections()
    server.close()
  })

  it('resolves with statusCode, headers and iterable body', async () => {
    const { statusCode, headers, body } = await request(url, { method: 'POST', headers: { 'x-foo': 'qux' }, body: Buffer.from('payload') })

    expect(statusCode).toBe(201)
    expect(headers['x-foo']).toBe('qux')
    expect(headers['set-cookie']).toEqual(['a=1', 'b=2'])
    expect(headers['x-multi']).toEqual(['c', 'd'])
    expect(await collect(body)).toBe('POST /foo?bar=baz payload')
  })

  it('sends GET without body by default', async () => {
    const { body } = await request(url, { body: null })

    expect(await collect(body)).toBe('GET /foo?bar=baz ')
  })

  it('rejects on connection error', async () => {
    const error = await request('http://127.0.0.1:8096').catch(e => e)

    expect(error.code).toBe(ECONNREFUSED)
  })

  it('refuses protocol switching', async () => {
    const upgrade = await request(url, { headers: { upgrade: 'websocket' } }).catch(e => e)
    const connection = await request(url, { headers: { Connection: 'Upgrade' } }).catch(e => e)

    expect(upgrade.code).toBe('UND_ERR_INVALID_ARG')
    expect(connection.code).toBe('UND_ERR_INVALID_ARG')
    expect(await collect((await request(url, { headers: { connection: 'close' } })).body)).toBe('GET /foo?bar=baz ')
  })

  it('rejects unsupported protocols', async () => {
    const error = await request('ftp://127.0.0.1').catch(e => e)

    expect(error.code).toBe('ERR_INVALID_PROTOCOL')
  })

  it('fails on headers timeout', async () => {
    const error = await request(`http://127.0.0.1:${port}/stall`, { headersTimeout: 50 }).catch(e => e)

    expect(error.code).toBe('UND_ERR_HEADERS_TIMEOUT')
  })

  it('fails on body timeout', async () => {
    const { statusCode, body } = await request(`http://127.0.0.1:${port}/stall-body`, { bodyTimeout: 50 })
    const error = await collect(body).catch(e => e)

    expect(statusCode).toBe(200)
    expect(error.code).toBe('UND_ERR_BODY_TIMEOUT')
  })

  it('does not time out keep-alive sockets between requests', async () => {
    const opts = { headersTimeout: 50, bodyTimeout: 50 }
    await collect((await request(url, opts)).body)
    await sleep(150)

    expect(await collect((await request(url, opts)).body)).toBe('GET /foo?bar=baz ')
  })
})
