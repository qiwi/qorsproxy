import { reqresnext } from '../../../reqresnext.js'

import { transport } from '../../../../../main/js/transport/index.js'
import customAuthorization from '../../../../../main/js/servlet/corsproxy/middlewares/customAuthorization.js'

describe('corsproxy.middleware.customAuthorization', () => {
  afterEach(() => vi.restoreAllMocks())

  const statusCode = 200
  const authBody = Buffer.from('{"key1":{"key2":"SuchSecretMuchSecurity"}}')
  const rule = {
    customAuthorization: {
      targetUrl: 'https://target',
      authorizationUrl: 'https://authorization',
      headers: ['authorization', 'additionalheader'],
      authPath: 'key1.key2'
    }
  }
  const proxy = { rule }
  const headers = {
    authorization: '1',
    additionalheader: '2',
    badheader: '3',
    host: null
  }
  const targetUrl = '/https://target'

  it('adds Authorization to headers ', async () => {
    vi.spyOn(transport, 'request').mockResolvedValue({ statusCode, body: [authBody], headers })

    const { req, res } = reqresnext({ proxy, url: targetUrl, headers }, {})
    const err = await new Promise(resolve => customAuthorization(req, res, resolve))

    expect(err).toBeUndefined()
    expect(transport.request).toHaveBeenCalledWith(rule.customAuthorization.authorizationUrl, expect.anything())
    expect(req.url).toBe(targetUrl)
    expect(req.headers.Authorization).toBe('SuchSecretMuchSecurity')
  })

  it('responds 403 if the token is not found', async () => {
    vi.spyOn(transport, 'request').mockResolvedValue({ statusCode, body: [Buffer.from('not a json')], headers })

    const { req, res } = reqresnext({ proxy, url: targetUrl, headers }, {})
    const next = vi.fn()
    const finished = new Promise(resolve => res.on('finish', resolve))
    customAuthorization(req, res, next)
    await finished

    expect(next).not.toHaveBeenCalled()
    expect(res.statusCode).toBe(403)
    expect(res.body).toBe('auth failed')
  })

  it('passes transport errors to next', async () => {
    const error = new Error('unreachable')
    vi.spyOn(transport, 'request').mockRejectedValue(error)

    const { req, res } = reqresnext({ proxy, url: targetUrl, headers }, {})

    expect(await new Promise(resolve => customAuthorization(req, res, resolve))).toBe(error)
  })

  it('skips requests out of the target url', () => {
    vi.spyOn(transport, 'request')
    const next = vi.fn()
    const { req, res } = reqresnext({ proxy, url: '/https://other', headers }, {})

    customAuthorization(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(transport.request).not.toHaveBeenCalled()
  })
})
