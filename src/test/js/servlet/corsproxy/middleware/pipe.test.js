import reqresnext from 'reqresnext'
import pipe from '../../../../../main/js/servlet/corsproxy/middlewares/pipe.js'
import { transport } from '../../../../../main/js/transport/index.js'
import { ECONNREFUSED } from '../../../../../main/js/servlet/common/error.js'
import { GET } from '../../../../../main/js/servlet/common/method.js'
import { OK, REMOTE_IS_DOWN, REMOTE_UNKNOWN } from '../../../../../main/js/servlet/common/status.js'

const sandbox = sinon.createSandbox()

describe('corsproxy.middleware.pipe', () => {
  const method = GET
  const statusCode = OK
  const headers = { foo: 'bar' }
  const body = Buffer.from('Baz')

  afterEach(() => {
    sandbox.restore()
  })

  it('transmits request to target dst', (done) => {
    const { req, res, next } = reqresnext.default(
      // req
      {
        method,
        url: 'https://example.com'
      },
      // res
      null,
      // next
      () => {
        expect(res.piped.statusCode).to.equal(statusCode)
        expect(res.piped.headers).to.equal(headers)
        expect(res.piped.body.toString()).to.equal(body.toString())
        done()
      }
    )

    sandbox.stub(transport, 'request')
      .callsFake((url, opts) => ({
        then (cb) { cb({ statusCode, body: [body], headers }); return this },
        catch () { return this }
      }))

    pipe(req, res, next)
  })

  it('handles ECONNREFUSED error', (done) => {
    const { req, res, next } = reqresnext.default({
      method,
      url: 'https://example.com'
    })

    sandbox.stub(transport, 'request')
      .callsFake((url, opts) => ({
        then () { return this },
        catch (cb) {
          cb({ code: ECONNREFUSED }) // eslint-disable-line
          expect(res.statusCode).to.equal(REMOTE_IS_DOWN)
          done()
          return this
        }
      }))

    pipe(req, res, next)
  })

  it('handles unexpected error', (done) => {
    const { req, res, next } = reqresnext.default({
      method,
      url: 'https://example.com'
    })

    sandbox.stub(transport, 'request')
      .callsFake((url, opts) => ({
        then () { return this },
        catch (cb) {
          cb({ code: 'unknown' }) // eslint-disable-line
          expect(res.statusCode).to.equal(REMOTE_UNKNOWN)
          done()
          return this
        }
      }))

    pipe(req, res, next)
  })
})
