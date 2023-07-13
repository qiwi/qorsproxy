import { isFunction, mapValues } from '../../base/index.js'
import env from '../../env/index.js'

export default class Metrics {
  constructor (components) {
    this.configure(components)
  }

  configure (components) {
    this.components = components

    return this
  }

  handler (req, res) {
    const details = mapValues(this.components, this.constructor.getMetrics)
    const data = {
      process: {
        uptime: this.constructor.formatUptime(env.process.uptime()),
        memory: env.process.memoryUsage(),
        cpu: env.process.cpuUsage()
      },
      servlets: details
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.write(JSON.stringify(data))
    res.end()
  }

  static getMetrics (component) {
    try {
      if (isFunction(component.metrics)) {
        return component.metrics()
      }

      return component.metrics || null // NOTE It may be getter
    } catch {
      return null
    }
  }

  static formatUptime (uptime) {
    function pad (s) {
      return (s < 10 ? '0' : '') + s
    }
    const hours = Math.floor(uptime / (60 * 60))
    const minutes = Math.floor(uptime % (60 * 60) / 60)
    const seconds = Math.floor(uptime % 60)

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  }
}
