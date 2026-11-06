import { reqresnext } from '../../../reqresnext.js'
import intercept from '../../../../../main/js/servlet/corsproxy/middlewares/intercept.js'
import { GET, OPTIONS, PUT, HEAD, POST, DELETE } from '../../../../../main/js/servlet/common/method.js'
import { FORBIDDEN, OK } from '../../../../../main/js/servlet/common/status.js'

describe('corsproxy.middleware.intercept', () => {
  it('captures request by method match', () => {
    const headers = { foo: 'bar' }
    const body = 'Baz'
    const methods = [GET, POST, PUT, OPTIONS, HEAD, DELETE]

    methods.forEach(method => {
      const { req, res, next } = reqresnext({
        method,
        proxy: {
          rule: {
            interceptions: [{
              req: { method },
              res: { status: FORBIDDEN, headers, body }
            }]
          }
        }
      })

      intercept(req, res, next)
      expect(res.statusCode).toBe(FORBIDDEN)
      expect(res.getHeaders()).toMatchObject(headers)
      expect(res.body).toBe(method === HEAD ? undefined : body) // HEAD responses carry no body
    })
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
    expect(res.statusCode).toBe(OK)
    expect(res.body).toBe(body)
  })

  it('proceeds to next if no match found', () => {
    const next = vi.fn()
    const { req, res } = reqresnext()

    intercept(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(res.body).toBeUndefined()
  })
})
