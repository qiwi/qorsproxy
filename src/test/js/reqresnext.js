// Express req/res/next stubs for middleware tests.
// Replaces the `reqresnext` package: it predates Node.js 24, where its responses lose header storage.
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import express from 'express'

const app = express().set('trust proxy', true)

const assignMissing = (target, props) => {
  for (const [key, value] of Object.entries(props)) {
    if (!(key in target)) target[key] = value
  }
}

const createRequest = ({ url = '/', method, headers = {}, body, params = {}, ...rest }) => {
  const req = new IncomingMessage(new Socket())
  Object.setPrototypeOf(req, app.request)

  req.app = app
  req.url = url
  req.method = method
  req.headers = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  req.headers.host ??= 'localhost'
  req.body = body
  req.params = params
  assignMissing(req, rest)

  return req
}

const createResponse = (req, { statusCode, status = statusCode ?? 200, headers = {}, ...rest }) => {
  const res = new ServerResponse(req)
  Object.setPrototypeOf(res, app.response)

  let body
  Object.defineProperty(res, 'body', {
    get: () => body,
    set () { throw new Error('Use .send(), .write() or .json()') }
  })

  // Collect the output instead of flushing it into a socket
  const write = res.write.bind(res)
  res.write = (chunk, encoding, cb) => {
    if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
      body = (body ?? '') + chunk.toString(encoding)
    }
    if (chunk !== undefined) write(chunk, encoding, cb)
    return res
  }
  res.end = (chunk, encoding) => {
    res.write(chunk, encoding)
    res.emit('finish')
    return res
  }

  res.app = app
  res.req = req
  req.res = res
  res.status(status)
  res.set(headers)
  assignMissing(res, rest)

  return res
}

export const reqresnext = (reqOpts, resOpts, next = () => {}) => {
  const req = createRequest(reqOpts || {})
  const res = createResponse(req, resOpts || {})

  return { req, res, next }
}
