import logger from './log'
import Config, { READY, UPDATE, ERROR } from './config'
import Container from './container'
import { Corsproxy, Health, Metrics, Info } from './servlet'
import { getCertOptions } from './cert'

export default class Orchestrator {
  constructor (argv) {
    // TODO IoC/DI
    const config = new Config(argv)
    const container = new Container()
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

    config
      .on(READY, ({ log, server: { host, port, securePort, keyPath, certPath }, rules }) => {
        logger
          .configure(log)
          .info(`Config path=${config.path || '<empty>'}`)
          .info('Config ready.')

        corsproxy
          .configure({ port, host, rules, securePort })

        health
          .configure({ corsproxy })

        metrics
          .configure({ corsproxy })

        container
          .configure({
            host,
            port,
            servlets,
            securePort,
            secureOpts: getCertOptions(keyPath, certPath)
          })
          .then(c => c.start())
      })
      .on(UPDATE, ({ log, server: { host, port, securePort, keyPath, certPath }, rules }) => {
        logger
          .configure(log)
          .warn('Config updated.')

        container.configure({
          host,
          port,
          securePort,
          secureOpts: getCertOptions(keyPath, certPath)
        })
        corsproxy.configure({ host, port, rules, securePort })
      })
      .on(ERROR, error => {
        if (container.online) {
          logger.warn(error)
          logger.warn('Container uses the previous valid config.')
        } else {
          logger.error(error)
        }
      })
      .load()
  }
}
