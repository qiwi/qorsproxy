import reqresnext from 'reqresnext'
import end from '../../../../../main/js/servlet/corsproxy/middlewares/end'

describe('corsproxy.middleware.end', () => {
  it('transfers piped data to response', () => {
    const headers = { foo: 'bar' }
    const statusCode = 200
    const body = 'Baz'
    const { req, res, next } = reqresnext({}, { piped: { headers, statusCode, body } })

    end(req, res, next)
    expect(res.statusCode).to.equal(statusCode)
    expect(res.getHeaders()).to.own.include(headers)
    expect(res.body).to.equal(body)
  })
})
