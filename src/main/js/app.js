import log from './log/index.js'
import Orchestrator from './orchestrator.js'
import packageJson from '../../../package.json'

export class App {
  static main (argv) {
    log.info(`Qorsproxy@${packageJson.version} is loading...`)
    log.info(`argv=${JSON.stringify(argv)}`)

    return new Orchestrator(argv)
  }
}

export default App
