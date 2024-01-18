import reqresnext from 'reqresnext'
import logger, { getLogLevelByStatus } from '../../../../../main/js/servlet/corsproxy/middlewares/logger.js'
import { OK, NO_CONTENT, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR } from '../../../../../main/js/servlet/common/status.js'
import log, { INFO, WARN, ERROR } from '../../../../../main/js/log/index.js'

const sandbox = sinon.createSandbox()

describe('corsproxy.middleware.logger', () => {
  it('gets logger level by status code', () => {
    expect(getLogLevelByStatus(OK)).to.equal(INFO)
    expect(getLogLevelByStatus(NO_CONTENT)).to.equal(INFO)
    expect(getLogLevelByStatus(BAD_REQUEST)).to.equal(WARN)
    expect(getLogLevelByStatus(FORBIDDEN)).to.equal(WARN)
    expect(getLogLevelByStatus(INTERNAL_SERVER_ERROR)).to.equal(ERROR)
  })

  describe('', () => {
    before(() => {
      sandbox.spy(log, INFO)
      sandbox.spy(log, WARN)
      sandbox.spy(log, ERROR)
      sandbox.stub(log.constructor, 'now').callsFake(() => 0)
    })
    after(() => {
      sandbox.restore()
    })

    it('logs current request', () => {
      const { req, res, next } = reqresnext.default({
        method: 'GET',
        proxy: {
          id: '123',
          path: {
            protocol: 'http',
            host: 'example.com'
          }
        },
        headers: {
          'x-forwarded-for': '192.168.1.10'
        }
      })
      logger(req, res, next)

      expect(log.info).to.have.been.calledWith('REQ 123 > method=GET origin=undefined ip=192.168.1.10 dest=http://example.com user=undefined headers={"x-forwarded-for":"192.168.1.10","host":"localhost"} bufferLength=0')
    })

    it('logs response on finish', () => {
      const { req, res, next } = reqresnext.default({
        method: 'GET',
        proxy: {
          id: '123',
          path: {
            protocol: 'http',
            host: 'example.com'
          }
        }
      }, {
        id: '123',
        statusCode: INTERNAL_SERVER_ERROR
      })

      logger(req, res, next)
      res.send('foo')

      expect(log.error).to.have.been.calledWith('RES 123 < status=500 method=GET duration=0ms headers={"content-type":"text/html; charset=utf-8","content-length":"3"} bufferLength=3')
    })
  })

  describe('overrides res method', () => {
    let req, res, next, send, end, write

    before(() => {
      ({ req, res, next } = reqresnext.default({
        method: 'GET',
        proxy: {
          id: '123',
          path: {
            protocol: 'http',
            host: 'example.com'
          }
        }
      }))
      sandbox.spy(res, 'send')
      sandbox.spy(res, 'end')
      sandbox.spy(res, 'write')

      send = res.send
      end = res.end
      write = res.write

      logger(req, res, next)
    })

    it('write', () => {
      expect(res.write).not.to.equal(write)
      res.write('foo')

      expect(write).to.be.calledWith('foo')
    })

    it('send', () => {
      expect(res.send).not.to.equal(send)
      expect(res.end).not.to.equal(end)
      res.send()

      expect(send).to.be.called()
      expect(end).to.be.called()

      expect(res.send).to.equal(send)
      expect(res.end).to.equal(end)
    })
  })
})
