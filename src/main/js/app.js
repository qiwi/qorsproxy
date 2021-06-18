import { readFileSync } from 'fs'
import log from './log/index.js'
import Orchestrator from './orchestrator.js'

export class App {
  static main (argv) {
    const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url)))

    log.info(`Qorsproxy@${pkg.version} is loading...`)
    log.info(`argv=${JSON.stringify(argv)}`)

    return new Orchestrator(argv)
  }
}

export default App
