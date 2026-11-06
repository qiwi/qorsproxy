import { Log, Console, DailyRotateFile } from '../../../main/js/log/index.js'

describe('Log', () => {
  describe('constructor', () => {
    it('properly constructs an instance', () => {
      const opts = {}
      const log = new Log(opts)

      expect(log.logger).toBeDefined()
    })
  })

  describe('proto', () => {
    const opts = {}
    const log = new Log(opts)

    beforeAll(() => {
      vi.spyOn(log.logger, 'configure')
      vi.spyOn(log.logger, 'debug')
      vi.spyOn(log.logger, 'info')
      vi.spyOn(log.logger, 'warn')
      vi.spyOn(log.logger, 'error')
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('`configure` passes formatted opts to inner logger', () => {
      const opts = {}
      const expected = Log.formatOptions(opts)
      delete expected.transports
      delete expected.format

      log.configure(opts)
      expect(log.logger.configure).toHaveBeenCalledWith(expect.objectContaining(expected))
    })

    describe('proxies', () => {
      const cases = ['debug', 'info', 'warn', 'error']

      cases.forEach(method => {
        it('`' + method + '` passes args to inner logger', () => {
          log[method]('foo')
          expect(log.logger[method]).toHaveBeenCalledWith('foo')
        })
      })
    })
  })

  describe('static', () => {
    it('`timestamp` formats instant', () => {
      expect(Log.timestamp()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z+$/)
    })

    it('`nocolorize` returns text as is', () => {
      expect(Log.nocolorize('info', 'text')).toBe('text')
    })

    it('`formatter` returns log string', () => {
      const formatter = Log.formatter
      const timestamp = () => 'time'
      const colorize = (level, text) => level + '|' + text

      expect(formatter({ colorize, timestamp, meta: { foo: 'bar' }, level: 'info', message: 'baz' })).toBe('time [info|INFO] baz \n\t{"foo":"bar"}')
      expect(formatter({ colorize, timestamp, meta: null, level: 'error' })).toBe('time [error|ERROR]  ')
    })

    it('`formatOptions` prepares opts for winston', () => {
      const dir = 'logs'
      const filename = 'filename'
      const name = 'name'
      const size = 10_000
      const level = 'warn'
      const pattern = 'YYYY-MM-DD'
      const opts = Log.formatOptions({ dir, filename, name, size, level, pattern })

      expect(opts).toMatchObject({ level, exitOnError: false })
      expect(opts.transports[0]).toBeInstanceOf(Console)
      expect(opts.transports[1]).toBeInstanceOf(DailyRotateFile)
    })
  })
})
