import reqresnext from 'reqresnext'
import { each } from '../../../../../main/js/base/index.js'
import { from, parsePattern, to } from '../../../../../main/js/servlet/corsproxy/middlewares/mutator.js'

describe('corsproxy.middleware.mutator', () => {
  describe('parsePattern', () => {
    it('returns RegExp if possible', () => {
      expect(parsePattern('/foo/gi')).to.be.a('regexp')
    })

    it('returns input value otherwise', () => {
      each([
        '//',
        '/foo/giwtf',
        {},
        123
      ], v => expect(parsePattern(v)).to.equal(v))
    })
  })

  it('`from` assigns new response headers', () => {
    const { req, res, next } = reqresnext.default(
      {
        proxy: {
          rule: {
            mutations: [
              {
                direction: 'from',
                headers: [
                  {
                    name: 'foo',
                    value: null
                  },
                  {
                    name: 'fooo',
                    value: ''
                  },
                  {
                    name: 'bar',
                    value: 'baz'
                  },
                  {
                    name: 'baz',
                    value: {
                      from: '/;(\\w+)\\.qiwi\\.com;/i',
                      to: ';$1.qiwi.tools;'
                    }
                  },
                  {
                    name: 'qux',
                    value: {
                      from: '/^(\\w)(\\w)$/i',
                      to: '$2$1'
                    }
                  },
                  {
                    name: 'authorization',
                    value: 'OtherToken'
                  }
                ]
              }
            ]
          }
        }
      },
      {
        piped: {
          headers: {
            foo: 'bar',
            fooo: 'fooo',
            baz: ';kassa.qiwi.com;example.com;',
            qux: ['ab', 'cd', 'efg'],
            Authorization: 'OtherToken'
          }
        }
      }
    )
    const resHeaders = res.piped.headers

    from(req, res, next)

    expect(resHeaders.foo).to.be.undefined()
    expect(resHeaders.fooo).to.equal('')
    expect(resHeaders.bar).to.equal('baz')
    expect(resHeaders.baz).to.equal(';kassa.qiwi.tools;example.com;')
    expect(resHeaders.qux).to.eql(['ba', 'dc', 'efg'])
    expect(resHeaders.Authorization).to.equal('OtherToken')
    expect(resHeaders.authorization).to.equal('OtherToken')
  })

  it('`to` assigns new request headers', () => {
    const { req, res, next } = reqresnext.default(
      {
        headers: {
          foo: 'bar',
          baz: ';kassa.qiwi.com;example.com;',
          qux: ['ab', 'cd', 'efg'],
          'foo-bar-baz': 'a'
        },
        proxy: {
          rule: {
            mutations: [
              {
                direction: 'to',
                headers: [
                  {
                    name: 'foo',
                    value: null
                  },
                  {
                    name: 'bar',
                    value: 'baz'
                  },
                  {
                    name: 'baz',
                    value: {
                      from: '/;(\\w+)\\.qiwi\\.com;/i',
                      to: ';$1.qiwi.tools;'
                    }
                  },
                  {
                    name: 'qux',
                    value: {
                      from: '/^(\\w)(\\w)$/i',
                      to: '$2$1'
                    }
                  },
                  {
                    name: 'foo-bar-baz',
                    value: {
                      from: '/^(\\w+)$/i',
                      to: '$1$1$1'
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    )
    const reqHeaders = req.headers

    to(req, res, next)

    expect(reqHeaders.foo).to.be.undefined()
    expect(reqHeaders.bar).to.equal('baz')
    expect(reqHeaders['Foo-Bar-Baz']).to.equal('aaa')
    expect(reqHeaders['foo-bar-baz']).to.equal('aaa')
    expect(reqHeaders.baz).to.equal(';kassa.qiwi.tools;example.com;')
    expect(reqHeaders.qux).to.eql(['ba', 'dc', 'efg'])
  })
})
