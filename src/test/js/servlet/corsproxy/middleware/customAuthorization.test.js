import reqresnext from 'reqresnext'

import { transport } from '../../../../../main/js/transport/index.js'
import customAuthorization from '../../../../../main/js/servlet/corsproxy/middlewares/customAuthorization.js'

const sandbox = sinon.createSandbox()

describe('corsproxy.middleware.customAuthorization', () => {
  afterEach(() => sandbox.restore())

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

  it('adds Authorization to headers ', (done) => {
    sandbox.stub(transport, 'request')
      .callsFake((url, opts) => ({
        then (cb) {
          expect(url).to.equal(rule.customAuthorization.authorizationUrl)
          cb({ statusCode, body: [authBody], headers })
          return this
        },
        catch () { return this }
      }))

    const { req, res, next } = reqresnext.default(
      { proxy, url: targetUrl, headers },
      {},
      () => {
        expect(req.url).to.equal(targetUrl)
        expect(req.headers.Authorization).to.equal('SuchSecretMuchSecurity')
        done()
      }
    )
    customAuthorization(req, res, next)
  })
})
