import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Log} from '../../src/log';

chai.should();
chai.use(sinonChai);
const {expect} = chai;

describe('Log', () => {
  describe('constructor', () => {
    it('properly constructs an instance', () => {
      const opts = {}
      const log = new Log(opts)

      expect(log.logger).not.to.be.undefined
    })
  })

  describe('proto', () => {
    const sandbox = sinon.sandbox.create();
    const opts = {}
    const log = new Log(opts)
    log.logger.configure = () => {}
    const methods = ['configure', 'debug']
    const spy = sandbox.spy(log.logger, 'configure');

    //log.logger = fakeLogger
    //chai.spy.on(log.logger, methods);

    before(() => {

    });

    afterEach(() => {
      sandbox.reset(); // restores original methods on `array`
    })

    it('`configure` passes formatted opts to inner logger', () => {
      const opts = {}
      const expected = Log.formatOptions(opts)
      delete expected.transports

      log.configure(opts)
      spy.should.have.been.calledWith(sinon.match(expected))
    })
  })

  describe('static', () => {})
})
