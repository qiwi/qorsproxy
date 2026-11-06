import { reqresnext } from '../../reqresnext.js'
import Corsproxy from '../../../../main/js/servlet/corsproxy/index.js'
import Rules from '../../../../main/js/servlet/corsproxy/rules.js'
import Stats from '../../../../main/js/servlet/corsproxy/stats.js'

describe('corsproxy', () => {
  const proxy = new Corsproxy()
  const host = 'localhost'
  const port = 3030
  const rules = {}

  it('constructor returns proper instance', () => {
    expect(proxy.handler).toBeDefined()
    expect(proxy.online).toBe(false)
    expect(proxy.rules).toBeInstanceOf(Rules)
    expect(proxy.stats).toBeInstanceOf(Stats)
  })

  describe('proto', () => {
    it('configure updates instance state', () => {
      proxy.configure({ host, port, rules })

      expect(proxy.host).toBe(host)
      expect(proxy.port).toBe(port)
    })

    it('health returns UP', () => {
      expect(proxy.health()).toEqual({ status: 'UP', critical: true })
    })

    it('metrics returns stats report', () => {
      expect(proxy.metrics()).toMatchObject(new Stats().report())
    })

    it('contextify picks rules by path', () => {
      const api = { to: ['example.com'], paths: ['/api'] }
      const proxy = new Corsproxy().configure({ host, port, rules: { api } })
      const contextify = (url) => {
        const { req, res, next } = reqresnext({ url })
        proxy.contextify(req, res, next)
        return req.proxy.rule
      }

      expect(contextify('/https://example.com/api/foo?bar=baz')).toBe(api)
      expect(contextify('/https://example.com/other')).toBeNull()
      expect(contextify('/')).toBeNull()
    })

    it('contextify sets req/res context', () => {
      const origin = 'http://localhost:3000'
      const { req, res, next } = reqresnext({
        url: '/https://example.com',
        headers: {
          origin
        }
      })

      proxy.contextify(req, res, next)

      expect(req.id).toBeDefined()
      expect(req.id).toBe(res.id)
      expect(req).toMatchObject({
        proxy: {
          from: 'localhost',
          to: 'example.com',
          origin,
          server: { host, port }
        }
      })
    })
  })
})
