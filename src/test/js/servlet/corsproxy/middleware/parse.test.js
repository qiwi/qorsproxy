import { reqresnext } from '../../../reqresnext.js'
import parse from '../../../../../main/js/servlet/corsproxy/middlewares/parse.js'

describe('corsproxy.middleware.parse', () => {
  it('parses request data', () => {
    const { req, res, next } = reqresnext({
      url: '/https://example.com',
      headers: {
        authorization: 'Basic Zm9vOmJhcg==',
        origin: 'https://localhost:3000'
      }
    })

    parse(req, res, next)

    expect(req.from).toBe('localhost')
    expect(req.to).toBe('example.com')
    expect(req.secret).toBe('4e99e8c12de7e01535248d2bac85e732')
  })
})
