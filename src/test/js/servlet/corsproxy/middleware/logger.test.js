import { reqresnext } from '../../../reqresnext.js'
import logger, { getLogLevelByStatus } from '../../../../../main/js/servlet/corsproxy/middlewares/logger.js'
import { OK, NO_CONTENT, BAD_REQUEST, FORBIDDEN, INTERNAL_SERVER_ERROR } from '../../../../../main/js/servlet/common/status.js'
import log, { INFO, WARN, ERROR } from '../../../../../main/js/log/index.js'

describe('corsproxy.middleware.logger', () => {
  it('gets logger level by status code', () => {
    expect(getLogLevelByStatus(OK)).toBe(INFO)
    expect(getLogLevelByStatus(NO_CONTENT)).toBe(INFO)
    expect(getLogLevelByStatus(BAD_REQUEST)).toBe(WARN)
    expect(getLogLevelByStatus(FORBIDDEN)).toBe(WARN)
    expect(getLogLevelByStatus(INTERNAL_SERVER_ERROR)).toBe(ERROR)
  })

  describe('', () => {
    beforeAll(() => {
      vi.spyOn(log, INFO)
      vi.spyOn(log, WARN)
      vi.spyOn(log, ERROR)
      vi.spyOn(log.constructor, 'now').mockReturnValue(0)
    })
    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('logs current request', () => {
      const { req, res, next } = reqresnext({
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

      expect(log.info).toHaveBeenCalledWith('REQ 123 > method=GET origin=undefined ip=192.168.1.10 dest=http://example.com user=undefined headers={"x-forwarded-for":"192.168.1.10","host":"localhost"} bufferLength=0')
    })

    it('logs response on finish', () => {
      const { req, res, next } = reqresnext({
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

      expect(log.error).toHaveBeenCalledWith('RES 123 < status=500 method=GET duration=0ms headers={"content-type":"text/html; charset=utf-8","content-length":"3","etag":"W/\\"3-C+7Hteo/D9vJXQ3UfzxbwnXaijM\\""} bufferLength=3')
    })
  })

  describe('overrides res method', () => {
    let req, res, next, send, end, write

    beforeAll(() => {
      ({ req, res, next } = reqresnext({
        method: 'GET',
        proxy: {
          id: '123',
          path: {
            protocol: 'http',
            host: 'example.com'
          }
        }
      }))
      vi.spyOn(res, 'send')
      vi.spyOn(res, 'end')
      vi.spyOn(res, 'write')

      send = res.send
      end = res.end
      write = res.write

      logger(req, res, next)
    })
    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('write', () => {
      expect(res.write).not.toBe(write)
      res.write('foo')

      expect(write).toHaveBeenCalledWith('foo')
    })

    it('send', () => {
      expect(res.send).not.toBe(send)
      expect(res.end).not.toBe(end)
      res.send()

      expect(send).toHaveBeenCalled()
      expect(end).toHaveBeenCalled()

      expect(res.send).toBe(send)
      expect(res.end).toBe(end)
    })
  })
})
