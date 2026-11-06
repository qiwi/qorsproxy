import { App } from '../../main/js/app.js'
import Orchestrator from '../../main/js/orchestrator.js'
import { Container } from '../../main/js/container/index.js'
import { Corsproxy, Health, Metrics, Info } from '../../main/js/servlet/index.js'
import logger from '../../main/js/log/index.js'

const tick = () => new Promise(resolve => setImmediate(resolve))

describe('orchestrator', () => {
  const host = '127.0.0.1'
  const port = 8080

  beforeEach(() => {
    vi.spyOn(Container.prototype, 'configure').mockImplementation(function () { return Promise.resolve(this) })
    vi.spyOn(Container.prototype, 'start').mockImplementation(function () { return Promise.resolve(this) })
    for (const method of ['configure', 'info', 'warn', 'error']) {
      vi.spyOn(logger, method).mockReturnValue(logger)
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('configures and starts the container when the config is ready', async () => {
    const orchestrator = new Orchestrator({ host, port })
    await tick()

    expect(Container.prototype.configure).toHaveBeenCalledWith(expect.objectContaining({
      host,
      port,
      servlets: {
        '/info': expect.any(Info),
        '/health': expect.any(Health),
        '/metrics': expect.any(Metrics),
        '': expect.any(Corsproxy)
      },
      secure: expect.objectContaining({ port: 9293, key: expect.any(Buffer), cert: expect.any(Buffer) })
    }))
    expect(Container.prototype.start).toHaveBeenCalled()
    expect(orchestrator.container).toBeInstanceOf(Container)
  })

  it('reconfigures the container on config update', async () => {
    const orchestrator = new Orchestrator({ host, port })
    await tick()

    orchestrator.config.update({ rules: {} })

    expect(logger.warn).toHaveBeenCalledWith('Config updated.')
    expect(Container.prototype.configure).toHaveBeenLastCalledWith(expect.objectContaining({ host, port }))
  })

  it('reports invalid configs', async () => {
    const orchestrator = new Orchestrator({ host, port })
    await tick()

    orchestrator.config.update({ server: 'foo' })
    expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ message: 'config_loader: invalid by schema' }))

    orchestrator.container.online = true
    orchestrator.config.update({ server: 'foo' })
    expect(logger.warn).toHaveBeenCalledWith('Container uses the previous valid config.')
  })

  it('App.main boots the orchestrator', async () => {
    const orchestrator = App.main({ host, port })
    await tick()

    expect(orchestrator).toBeInstanceOf(Orchestrator)
    expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/^Qorsproxy@\d+\.\d+\.\d+ is loading\.\.\.$/))
  })
})
