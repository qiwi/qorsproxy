import { reqresnext } from '../../../reqresnext.js'
import end from '../../../../../main/js/servlet/corsproxy/middlewares/end.js'

describe('corsproxy.middleware.end', () => {
  it('transfers piped data to response', () => {
    const headers = { foo: 'bar' }
    const statusCode = 200
    const body = 'Baz'
    const { req, res, next } = reqresnext({}, { piped: { headers, statusCode, body } })

    end(req, res, next)
    expect(res.statusCode).toBe(statusCode)
    expect(res.getHeaders()).toMatchObject(headers)
    expect(res.body).toBe(body)
  })
})
