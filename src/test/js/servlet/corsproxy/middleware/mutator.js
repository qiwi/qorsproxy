import { each } from '../../../../../main/js/base'
import reqresnext from 'reqresnext'
import { from, parsePattern, to } from '../../../../../main/js/servlet/corsproxy/middlewares/mutator'

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
    const { req, res, next } = reqresnext(
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
            baz: ';kassa.qiwi.com;example.com;',
            qux: ['ab', 'cd', 'efg']
          }
        }
      }
    )
    const resHeaders = res.piped.headers

    from(req, res, next)

    expect(resHeaders.foo).to.be.undefined()
    expect(resHeaders.bar).to.equal('baz')
    expect(resHeaders.baz).to.equal(';kassa.qiwi.tools;example.com;')
    expect(resHeaders.qux).to.eql(['ba', 'dc', 'efg'])
  })

  it('`to` assigns new request headers', () => {
    const { req, res, next } = reqresnext(
      {
        headers: {
          foo: 'bar',
          baz: ';kassa.qiwi.com;example.com;',
          qux: ['ab', 'cd', 'efg']
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
    expect(reqHeaders.baz).to.equal(';kassa.qiwi.tools;example.com;')
    expect(reqHeaders.qux).to.eql(['ba', 'dc', 'efg'])
  })
})
