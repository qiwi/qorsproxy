import reqresnext from 'reqresnext'
import intercept from '../../../../../main/js/servlet/corsproxy/middlewares/intercept'
import { GET } from '../../../../../main/js/servlet/const/method'
import { FORBIDDEN, OK } from '../../../../../main/js/servlet/const/status'

describe('corsproxy.middleware.intercept', () => {
  it('captures request by method match', () => {
    const headers = { foo: 'bar' }
    const body = 'Baz'
    const { req, res, next } = reqresnext({
      method: GET,
      proxy: {
        rule: {
          interceptions: [{
            req: { method: GET },
            res: { status: FORBIDDEN, headers, body }
          }]
        }
      }
    })

    intercept(req, res, next)
    expect(res.statusCode).to.equal(FORBIDDEN)
    expect(res.getHeaders()).to.include(headers)
    expect(res.body).to.equal(body)
  })

  it('captures request by header match', () => {
    const headers = { foo: 'bar' }
    const body = 'Baz'
    const { req, res, next } = reqresnext({
      method: GET,
      headers,
      proxy: {
        rule: {
          interceptions: [{
            req: { headers },
            res: { body }
          }]
        }
      }
    })

    intercept(req, res, next)
    expect(res.statusCode).to.equal(OK)
    expect(res.body).to.equal(body)
  })

  it('proceeds to next if no match found', () => {
    const next = sinon.spy(() => {})
    const { req, res } = reqresnext()

    intercept(req, res, next)
    expect(next).to.be.called()
    expect(res.body).to.equal(undefined)
  })
})
