// import proxyquire from 'proxyquire'
import reqresnext from 'reqresnext'

import customAuthorization from '../../../../../main/js/servlet/corsproxy/middlewares/customAuthorization.js'
const _request = customAuthorization.request
const stubRequest = request => { customAuthorization.request = request }

after(() => stubRequest(_request))

describe('corsproxy.middleware.customAuthorization', () => {
  const authBody = '{"key1":{"key2":"SuchSecretMuchSecurity"}}'
  const rule = {
    customAuthorization: {
      targetUrl: 'http://target',
      authorizationUrl: 'http://authorization',
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
  const body = {
    bodyKey: 'bodyKey Value'
  }
  const expectedAuthEndpointHeaders = {
    authorization: '1',
    additionalheader: '2'
  }
  const expectedTargetEndpointHeaders = {
    authorization: 'SuchSecretMuchSecurity',
    additionalheader: '2',
    badheader: '3',
    host: 'localhost'
  }
  const targetUrl = '/http://target'
  const otherUrl = '/http://other'

  it('adds Authorization to headers ', () => {
    let authReqOpts = {}
    let proxyedReqOpts = {}
    const request = sinon.stub().callsFake((opts, cb) => {
      proxyedReqOpts = opts
      return { pipe: sinon.stub() }
    })
    sinon.stub(request, 'get').callsFake((opts, cb) => {
      authReqOpts = opts
      cb(null, {}, authBody)
    })
    stubRequest(request)

    const { req, res, next } = reqresnext.default(
      { proxy, url: targetUrl, headers },
      {}
    )
    customAuthorization(req, res, next)

    expect(authReqOpts.headers).to.containSubset(expectedAuthEndpointHeaders)
    expect(proxyedReqOpts.headers).to.containSubset(expectedTargetEndpointHeaders)
  })

  it('transmits body to target endpoint', () => {
    let authReqOpts = {}
    let proxyedReqOpts = {}
    const request = sinon.stub().callsFake((opts, cb) => {
      proxyedReqOpts = opts
      return { pipe: sinon.stub() }
    })
    sinon.stub(request, 'get').callsFake((opts, cb) => {
      authReqOpts = opts
      cb(null, {}, authBody)
    })
    stubRequest(request)

    const { req, res, next } = reqresnext.default(
      { proxy, url: targetUrl, headers, body },
      {}
    )
    customAuthorization(req, res, next)

    expect(proxyedReqOpts.body).to.be.equal(body)
    expect(authReqOpts).to.containSubset({
      url: 'http://authorization',
      headers: {
        authorization: '1',
        additionalheader: '2'
      }
    })
  })

  it('does nothing to urls not from config', () => {
    const request = sinon.stub()
    stubRequest(request)
    const pass = sinon.stub()

    const { req, res } = reqresnext.default(
      { proxy, url: otherUrl, headers },
      {}
    )
    customAuthorization(req, res, pass)

    expect(pass.called).to.be.true()
    expect(request.called).to.be.false()
  })
})
