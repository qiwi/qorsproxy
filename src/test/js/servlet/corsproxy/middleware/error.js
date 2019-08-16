import reqresnext from 'reqresnext'
import error from '../../../../../main/js/servlet/corsproxy/middlewares/error'
import { INTERNAL_ERROR } from '../../../../../main/js/servlet/corsproxy/codes'

describe('corsproxy.middleware.error', () => {
  it('handles error', () => {
    const err = new Error('Some error')
    const { req, res, next } = reqresnext()

    error(err, req, res, next)
    expect(res.statusCode).to.equal(INTERNAL_ERROR)
    expect(res.body).to.be.a('string')
  })
})
