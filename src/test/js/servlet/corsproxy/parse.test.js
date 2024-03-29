import reqresnext from 'reqresnext'
import Corsproxy from '../../../../main/js/servlet/corsproxy/index.js'
import url from '../../../../main/js/servlet/corsproxy/url.js'

describe('corsproxy.parse', () => {
  it('parses request data', () => {
    const { req } = reqresnext.default({
      url: '/https://example.com',
      headers: {
        authorization: 'Basic Zm9vOmJhcg==',
        origin: 'https://localhost:3000'
      }
    })

    const parsed = Corsproxy.parse(req)

    expect(parsed.origin).to.equal('https://localhost:3000')
    expect(parsed.from).to.equal('localhost')
    expect(parsed.to).to.equal('example.com')
    expect(parsed.secret).to.equal('4e99e8c12de7e01535248d2bac85e732')
    expect(parsed.user).to.equal('foo')
    expect(parsed.path).to.include(url.parse('https://example.com'))
  })
})
