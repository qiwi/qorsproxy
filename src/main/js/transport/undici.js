// A drop-in replacement for `undici.request()` built on `node:http(s)`.
// Covers the part of its API qorsproxy relies on: `request(url, { method, headers, body, headersTimeout, bodyTimeout })`
// resolves with `{ statusCode, headers, body }`, where `body` is an async iterable of chunks.
// Matches undici's defaults and error codes: 300s timeouts (0 disables), 4s keep-alive, repeated response headers as arrays,
// no protocol switching.
import http from 'node:http'
import https from 'node:https'

// Idle sockets are dropped before the common 5s server keep-alive expires them under a new request
const agentOptions = { keepAlive: true, timeout: 4_000 }
const clients = {
  'http:': [http, new http.Agent(agentOptions)],
  'https:': [https, new https.Agent(agentOptions)]
}

const error = (message, code) => Object.assign(new Error(message), { code })

// node:http would hand the socket over on `101 Switching Protocols` and never settle
const assertHeaders = (headers = {}) => {
  for (const [key, value] of Object.entries(headers)) {
    const name = key.toLowerCase()
    if (name === 'upgrade') throw error('invalid upgrade header', 'UND_ERR_INVALID_ARG')
    if (name === 'connection' && !['close', 'keep-alive'].includes(typeof value === 'string' && value.toLowerCase())) throw error('invalid connection header', 'UND_ERR_INVALID_ARG')
  }
}

const parseHeaders = (raw) => {
  const headers = {}
  for (let i = 0; i < raw.length; i += 2) {
    const key = raw[i].toLowerCase()
    headers[key] = Object.prototype.hasOwnProperty.call(headers, key) ? [].concat(headers[key], raw[i + 1]) : raw[i + 1]
  }
  return headers
}

export const request = (url, { method = 'GET', headers, body, headersTimeout = 300_000, bodyTimeout = 300_000 } = {}) => new Promise((resolve, reject) => {
  assertHeaders(headers)

  // Unsupported protocols fall through to `http.request()`, which throws ERR_INVALID_PROTOCOL
  const [client, agent] = clients[new URL(url).protocol] ?? [http]
  const onHeadersTimeout = () => req.destroy(error('Headers Timeout Error', 'UND_ERR_HEADERS_TIMEOUT'))
  const req = client.request(url, { method, headers, agent }, (res) => {
    req.off('timeout', onHeadersTimeout)
    req.setTimeout(bodyTimeout, () => res.destroy(error('Body Timeout Error', 'UND_ERR_BODY_TIMEOUT')))
    resolve({ statusCode: res.statusCode, headers: parseHeaders(res.rawHeaders), body: res })
  })

  req
    .setTimeout(headersTimeout, onHeadersTimeout)
    .on('error', reject)
    .end(body || undefined)
})
