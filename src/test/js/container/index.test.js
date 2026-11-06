import EventEmitter from 'node:events'
import { reqresnext } from '../reqresnext.js'
import { Container, HttpServer as Server } from '../../../main/js/container/index.js'

describe('container', () => {
  const host = '127.0.0.1'
  const port = 8080
  const secure = { port: 8081 }
  const foo = { handler () {} }
  const bar = { handler () { throw new Error('Bar unhandled') } }
  const servlets = { foo, bar }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('returns proper instance', async () => {
      const container = await new Container().configure({ host, port, servlets, secure })

      expect(container.server).toBeInstanceOf(Server)
      expect(container.online).toBeTypeOf('boolean')
    })
  })

  describe('proto', () => {
    describe('configure', async () => {
      const container = await new Container().configure({ host, port, servlets, secure })
      container.server.listen = () => {}
      container.server.close = () => {}
      container.httpsServer.listen = () => {}
      container.httpsServer.close = () => {}

      beforeEach(() => {
        vi.spyOn(container, 'restart')
      })

      it('registers new servlets', async () => {
        const servlets = {}
        await container.configure({ servlets })
        expect(container.servlets).toBe(servlets)
      })

      it('triggers restart when `host` changes', async () => {
        const host = '0.0.0.0'
        container.online = true
        await container.configure({ host, secure })

        expect(container.host).toBe(host)
        expect(container.restart).toHaveBeenCalled()
      })

      it('triggers restart when `port` changes', async () => {
        const port = 8080
        container.online = true
        await container.configure({ port, secure })

        expect(container.port).toBe(port)
        expect(container.secure).toBe(secure)
        expect(container.restart).toHaveBeenCalled()
      })
    })

    describe('server', () => {
      let container

      beforeEach(async () => {
        container = await new Container().configure({ host, port, servlets, secure })
        const methods = ['listen', 'close']
        const fake = (arg0, arg1, arg2) => {
          if (typeof arg0 === 'function') { arg0() }
          if (typeof arg2 === 'function') { arg2() }
        }

        methods.forEach(m => {
          vi.spyOn(container.server, m).mockImplementation(fake)
          vi.spyOn(container.httpsServer, m).mockImplementation(fake)
        })

        const listeners = {}
        const httpsServer = container.httpsServer
        vi.spyOn(container.server, 'on').mockImplementation((event, handler) => {
          listeners[event] = handler
        })
        vi.spyOn(container.server, 'emit').mockImplementation((event, ...args) => {
          const handler = listeners[event]
          if (handler) {
            handler(...args)
          }
        })
        vi.spyOn(container, 'initSecureServer').mockImplementation(() => httpsServer)
      })

      describe('start', () => {
        it('starts inner server if it looks stopped', async () => {
          container.online = false
          await container.start()
          expect(container.server.listen).toHaveBeenCalled()
          expect(container.httpsServer.listen).toHaveBeenCalled()
        })

        it('does nothing otherwise', async () => {
          container.online = true
          await container.start()
          expect(container.server.listen).not.toHaveBeenCalled()
          expect(container.httpsServer.listen).not.toHaveBeenCalled()
        })
      })

      describe('stop', () => {
        it('turns off inner server if it\'s online', async () => {
          container.online = true
          await container.stop()
          expect(container.server.close).toHaveBeenCalled()
          expect(container.httpsServer.close).toHaveBeenCalled()
        })

        it('does nothing otherwise', async () => {
          container.online = false
          await container.stop()
          expect(container.server.close).not.toHaveBeenCalled()
          expect(container.httpsServer.close).not.toHaveBeenCalled()
        })
      })

      describe('restart', () => {
        it('restarts server', async () => {
          container.online = true
          await container.restart()
          expect(container.server.listen).toHaveBeenCalled()
          expect(container.server.close).toHaveBeenCalled()
          expect(container.httpsServer.close).toHaveBeenCalled()
          expect(container.online).toBe(true)
        })
      })
    })

    describe('collector', () => {
      it('aggregates chunk data', async () => {
        const container = await new Container().configure({ host, port, servlets, secure })
        const req = new EventEmitter()
        const res = {}

        vi.spyOn(container, 'handler').mockImplementation(() => {})
        container.collector(req, res)

        req.emit('data', Buffer.from('foo'))
        req.emit('data', null)
        req.emit('data', Buffer.from('bar'))
        req.emit('end')

        expect(req.body).toEqual(Buffer.from('foobar'))
        expect(container.handler).toHaveBeenCalledWith(req, res)
      })
    })

    describe('handler', () => {
      let container
      let servlets

      beforeEach(async () => {
        servlets = { foo: { handler: foo.handler }, bar: { handler: bar.handler } }
        vi.spyOn(servlets.foo, 'handler')
        vi.spyOn(servlets.bar, 'handler')

        container = await new Container().configure({ host, port, servlets, secure })
        container.online = true
      })

      it('passes request control to handler', () => {
        const { req, res } = reqresnext({ url: 'foo/inner' })

        req.on = (e, f) => { f(); return req }

        container.server.emit('request', req, res)
        req.emit('end')

        expect(servlets.foo.handler).toHaveBeenCalled()
      })

      it('invokes found servlet', () => {
        const { req, res } = reqresnext({ url: 'foo/inner' })

        container.handler(req, res)
        expect(servlets.foo.handler).toHaveBeenCalled()
      })

      it('returns InternalError on servlet unhandled', () => {
        const { req, res } = reqresnext({ url: 'bar/some' })

        container.handler(req, res)
        expect(servlets.bar.handler).toHaveBeenCalled()
        expect(res.body).toBe('Internal Server Error')
      })

      it('returns NotFound otherwise', () => {
        const { req, res } = reqresnext({ url: 'bazzz' })

        container.handler(req, res)
        expect(res.body).toBe('Not Found')
      })

      it('drops connection if offline', () => {
        const { req, res } = reqresnext({ url: 'bazzz' })

        container.online = false
        container.handler(req, res)
        expect(res.body).toBeUndefined()
      })
    })
  })
})
