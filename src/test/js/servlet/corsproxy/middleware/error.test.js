import reqresnext from 'reqresnext'
import error from '../../../../../main/js/servlet/corsproxy/middlewares/error.js'
import { INTERNAL_SERVER_ERROR } from '../../../../../main/js/servlet/common/status.js'

describe('corsproxy.middleware.error', () => {
  it('handles error', () => {
    const err = new Error('Some error')
    const { req, res, next } = reqresnext.default()

    error(err, req, res, next)
    expect(res.statusCode).to.equal(INTERNAL_SERVER_ERROR)
    expect(res.body).to.be.a('string')
  })
})
