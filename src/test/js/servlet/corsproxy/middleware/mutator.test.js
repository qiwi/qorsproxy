import { reqresnext } from '../../../reqresnext.js'
import { each } from '../../../../../main/js/base/index.js'
import { from, parsePattern, to } from '../../../../../main/js/servlet/corsproxy/middlewares/mutator.js'

describe('corsproxy.middleware.mutator', () => {
  describe('parsePattern', () => {
    it('returns RegExp if possible', () => {
      expect(parsePattern('/foo/gi')).toBeInstanceOf(RegExp)
    })

    it('returns input value otherwise', () => {
      each([
        '//',
        '/foo/giwtf',
        {},
        123
      ], v => expect(parsePattern(v)).toBe(v))
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

    expect(resHeaders.foo).toBeUndefined()
    expect(resHeaders.fooo).toBe('')
    expect(resHeaders.bar).toBe('baz')
    expect(resHeaders.baz).toBe(';kassa.qiwi.tools;example.com;')
    expect(resHeaders.qux).toEqual(['ba', 'dc', 'efg'])
    expect(resHeaders.Authorization).toBe('OtherToken')
    expect(resHeaders.authorization).toBe('OtherToken')
  })

  it('`to` assigns new request headers', () => {
    const { req, res, next } = reqresnext(
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

    expect(reqHeaders.foo).toBeUndefined()
    expect(reqHeaders.bar).toBe('baz')
    expect(reqHeaders['Foo-Bar-Baz']).toBe('aaa')
    expect(reqHeaders['foo-bar-baz']).toBe('aaa')
    expect(reqHeaders.baz).toBe(';kassa.qiwi.tools;example.com;')
    expect(reqHeaders.qux).toEqual(['ba', 'dc', 'efg'])
  })
})
