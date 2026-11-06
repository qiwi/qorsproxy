import { reqresnext } from '../../reqresnext.js'
import Corsproxy from '../../../../main/js/servlet/corsproxy/index.js'
import url from '../../../../main/js/servlet/corsproxy/url.js'

describe('corsproxy.parse', () => {
  it('parses request data', () => {
    const { req } = reqresnext({
      url: '/https://example.com',
      headers: {
        authorization: 'Basic Zm9vOmJhcg==',
        origin: 'https://localhost:3000'
      }
    })

    const parsed = Corsproxy.parse(req)

    expect(parsed.origin).toBe('https://localhost:3000')
    expect(parsed.from).toBe('localhost')
    expect(parsed.to).toBe('example.com')
    expect(parsed.secret).toBe('4e99e8c12de7e01535248d2bac85e732')
    expect(parsed.user).toBe('foo')
    expect(parsed.path).toMatchObject(url.parse('https://example.com'))
  })
})
