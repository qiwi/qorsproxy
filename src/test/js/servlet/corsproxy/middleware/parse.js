import reqresnext from 'reqresnext'
import parse from '../../../../../main/js/servlet/corsproxy/middlewares/parse'

describe('corsproxy.middleware.parse', () => {
  it('parses request data', () => {
    const { req, res, next } = reqresnext({
      url: '/http://example.com',
      headers: {
        authorization: 'Basic Zm9vOmJhcg==',
        origin: 'http://localhost:3000'
      }
    })

    parse(req, res, next)

    expect(req.from).to.equal('localhost')
    expect(req.to).to.equal('example.com')
    expect(req.secret).to.equal('4e99e8c12de7e01535248d2bac85e732')
  })
})
