import logger from './log/index.js'
import Config, { READY, UPDATE, ERROR } from './config/index.js'
import { Container } from './container/index.js'
import { Corsproxy, Health, Metrics, Info } from './servlet/index.js'
import { getCertOptions } from './cert.js'

export default class Orchestrator {
  constructor (argv) {
    // TODO IoC/DI
    this.config = new Config(argv)
    this.container = new Container()

    const corsproxy = new Corsproxy()
    const health = new Health()
    const metrics = new Metrics()
    const info = new Info()
    const servlets = {
      '/info': info,
      '/health': health,
      '/metrics': metrics,
      '': corsproxy
    }

    this.config
      .on(READY, ({ log, server: { host, port, secure }, rules }) => {
        const { port: securePort } = secure
        logger
          .configure(log)
          .info(`Config path=${this.config.path || '<empty>'}`)
          .info('Config ready.')

        corsproxy
          .configure({ port, host, rules, securePort })

        health
          .configure({ corsproxy })

        metrics
          .configure({ corsproxy })

        this.container
          .configure({
            host,
            port,
            servlets,
            secure: getCertOptions(secure)
          })
          .then(c => c.start())
      })
      .on(UPDATE, ({ log, server: { host, port, secure }, rules }) => {
        const { port: securePort } = secure
        logger
          .configure(log)
          .warn('Config updated.')

        this.container.configure({
          host,
          port,
          secure: getCertOptions(secure)
        })
        corsproxy.configure({ host, port, rules, securePort })
      })
      .on(ERROR, error => {
        if (this.container.online) {
          logger.warn(error)
          logger.warn('Container uses the previous valid config.')
        } else {
          logger.error(error)
        }
      })
      .load()
  }
}
