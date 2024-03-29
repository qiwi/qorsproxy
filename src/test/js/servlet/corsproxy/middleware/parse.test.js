import reqresnext from 'reqresnext'
import parse from '../../../../../main/js/servlet/corsproxy/middlewares/parse.js'

describe('corsproxy.middleware.parse', () => {
  it('parses request data', () => {
    const { req, res, next } = reqresnext.default({
      url: '/https://example.com',
      headers: {
        authorization: 'Basic Zm9vOmJhcg==',
        origin: 'https://localhost:3000'
      }
    })

    parse(req, res, next)

    expect(req.from).to.equal('localhost')
    expect(req.to).to.equal('example.com')
    expect(req.secret).to.equal('4e99e8c12de7e01535248d2bac85e732')
  })
})
