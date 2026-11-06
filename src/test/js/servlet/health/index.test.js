import { reqresnext } from '../../reqresnext.js'
import { StandardIndicator, Endpoint } from '@qiwi/health-indicator'
import Health from '../../../../main/js/servlet/health/index.js'

describe('health', () => {
  it('constructor returns proper instance', () => {
    const deps = {}
    const health = new Health(deps)

    expect(health.indicator).toBeInstanceOf(StandardIndicator)
    expect(health.indicator.deps).toBe(deps)
    expect(health.endpoint).toBeInstanceOf(Endpoint)
  })

  describe('proto', () => {
    describe('handler', () => {
      it('sends proper value to client', () => {
        const { req, res } = reqresnext()
        const dep1 = { health () { return { status: 'UP' } } }
        const dep2 = { health () { return { status: 'DOWN', critical: false } } }
        const health = new Health({ dep1, dep2 })

        health.handler(req, res)

        expect(JSON.parse(res.body)).toEqual({
          deps: {
            dep1: { status: 'UP' },
            dep2: { status: 'DOWN', critical: false }
          },
          status: 'UP',
          critical: false
        })
      })
    })
  })
})
