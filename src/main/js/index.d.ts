interface Config {
  on(name: string, cb: Function): Config
}

interface Container {
  start(): Promise<Container>
  stop(): Promise<Container>
}

interface Orchestrator {
  config: Config
  container: Container
}

export const App: {
  main(argv: {
    config: string
    watch?: boolean
    host?: string
    port?: string
    secure?: boolean
  }): Orchestrator
}
