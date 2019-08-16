import reqresnext from 'reqresnext'
import Corsproxy from '../../../../main/js/servlet/corsproxy'
import Rules from '../../../../main/js/servlet/corsproxy/rules'
import Stats from '../../../../main/js/servlet/corsproxy/stats'

describe('corsproxy', () => {
  const proxy = new Corsproxy()
  const host = 'localhost'
  const port = 3030
  const rules = {}

  it('constructor returns proper instance', () => {
    expect(proxy.handler).not.to.be.undefined()
    expect(proxy.online).to.be.false()
    expect(proxy.rules).to.be.an.instanceof(Rules)
    expect(proxy.stats).to.be.an.instanceof(Stats)
  })

  describe('proto', () => {
    it('configure updates instance state', () => {
      proxy.configure({ host, port, rules })

      expect(proxy.host).to.equal(host)
      expect(proxy.port).to.equal(port)
    })

    it('health returns UP', () => {
      expect(proxy.health()).to.deep.equal({ status: 'UP', critical: true })
    })

    it('metrics returns stats report', () => {
      expect(proxy.metrics()).to.include(new Stats().report())
    })

    it('contextify sets req/res context', () => {
      const origin = 'http://localhost:3000'
      const { req, res, next } = reqresnext({
        url: '/http://example.com',
        headers: {
          origin
        }
      })

      proxy.contextify(req, res, next)

      expect(req.id).not.to.be.undefined()
      expect(req.id).to.equal(res.id)
      expect(req).to.containSubset({
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
