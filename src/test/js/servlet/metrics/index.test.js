import { reqresnext } from '../../reqresnext.js'
import Metrics from '../../../../main/js/servlet/metrics/index.js'

describe('metrics', () => {
  it('sends process and servlets metrics', () => {
    const { req, res } = reqresnext()
    const components = {
      fn: { metrics: () => ({ count: 1 }) },
      getter: { get metrics () { return { count: 2 } } },
      none: {},
      broken: { metrics () { throw new Error('broken') } }
    }
    vi.spyOn(res, 'writeHead')

    new Metrics(components).handler(req, res)
    const data = JSON.parse(res.body)

    expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' })
    expect(data.process.uptime).toMatch(/^\d{2,}:\d{2}:\d{2}$/)
    expect(data.process).toHaveProperty('memory.rss')
    expect(data.process).toHaveProperty('cpu.user')
    expect(data.servlets).toEqual({ fn: { count: 1 }, getter: { count: 2 }, none: null, broken: null })
  })

  it('formats uptime', () => {
    expect(Metrics.formatUptime(0)).toBe('00:00:00')
    expect(Metrics.formatUptime(3725.9)).toBe('01:02:05')
    expect(Metrics.formatUptime(36_000)).toBe('10:00:00')
  })
})
