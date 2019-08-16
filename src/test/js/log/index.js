import { Log, Console, DailyRotateFile } from '../../../main/js/log'

describe('Log', () => {
  describe('constructor', () => {
    it('properly constructs an instance', () => {
      const opts = {}
      const log = new Log(opts)

      expect(log.logger).not.to.be.undefined()
    })
  })

  describe('proto', () => {
    const sandbox = sinon.sandbox.create()
    const opts = {}
    const log = new Log(opts)

    before(() => {
      sandbox.spy(log.logger, 'configure')
      sandbox.spy(log.logger, 'debug')
      sandbox.spy(log.logger, 'info')
      sandbox.spy(log.logger, 'warn')
      sandbox.spy(log.logger, 'error')
    })

    afterEach(() => {
      sandbox.reset() // restores original methods on `array`
    })

    it('`configure` passes formatted opts to inner logger', () => {
      const opts = {}
      const expected = Log.formatOptions(opts)
      delete expected.transports

      log.configure(opts)
      log.logger.configure.should.have.been.calledWith(sinon.match(expected))
    })

    describe('proxies', () => {
      const cases = ['debug', 'info', 'warn', 'error']

      cases.forEach(method => {
        it('`' + method + '` passes args to inner logger', () => {
          log[method]('foo')
          log.logger[method].should.have.been.calledWith('foo')
        })
      })
    })
  })

  describe('static', () => {
    it('`timestamp` formats instant', () => {
      expect(Log.timestamp()).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z+$/)
    })

    it('`nocolorize` returns text as is', () => {
      expect(Log.nocolorize('info', 'text')).to.equal('text')
    })

    it('`formatter` returns log string', () => {
      const formatter = Log.formatter
      const timestamp = () => 'time'
      const colorize = (level, text) => level + '|' + text

      expect(formatter({ colorize, timestamp, meta: { foo: 'bar' }, level: 'info', message: 'baz' })).to.equal('time [info|INFO] baz \n\t{"foo":"bar"}')
      expect(formatter({ colorize, timestamp, meta: null, level: 'error' })).to.equal('time [error|ERROR]  ')
    })

    it('`formatOptions` prepares opts for winston', () => {
      const dir = 'logs'
      const filename = 'filename'
      const name = 'name'
      const size = 10000
      const level = 'warn'
      const pattern = 'YYYY-MM-DD'
      const opts = Log.formatOptions({ dir, filename, name, size, level, pattern })

      expect(opts).to.own.include({ level, exitOnError: false })
      expect(opts.transports[0]).to.be.instanceOf(Console)
      expect(opts.transports[1]).to.be.instanceOf(DailyRotateFile)
    })
  })
})
