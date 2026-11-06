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
})
