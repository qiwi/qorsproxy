import EventEmitter from 'events'
import reqresnext from 'reqresnext'
import { Container, HttpServer as Server } from '../../../main/js/container'

describe('container', () => {
  const host = '127.0.0.1'
  const port = 8080
  const secure = { port: 8081 }
  const foo = { handler () {} }
  const bar = { handler () { throw new Error('Bar unhandled') } }
  const servlets = { foo, bar }

  describe('constructor', () => {
    it('returns proper instance', async () => {
      const container = await new Container().configure({ host, port, servlets, secure })

      expect(container.server).to.be.an.instanceof(Server)
      expect(container.online).to.be.a('boolean')
    })
  })

  describe('proto', () => {
    describe('configure', async () => {
      const container = await new Container().configure({ host, port, servlets, secure })

      beforeEach(() => {
        sinon.spy(container, 'restart')
      })

      afterEach(() => {
        container.restart.restore()
      })

      it('registers new servlets', () => {
        const servlets = {}
        container.configure({ servlets })
        expect(container.servlets).to.equal(servlets)
      })

      it('triggers restart when `port` changes', () => {
        const host = '0.0.0.0'
        container.online = true
        container.configure({ host, secure })

        expect(container.host).to.equal(host)
        container.restart.should.have.been.called()
      })

      it('triggers restart when `host` changes', () => {
        const port = 8080
        container.online = true
        container.configure({ port, secure })

        expect(container.port).to.equal(port)
        expect(container.secure).to.equal(secure)
        container.restart.should.have.been.called()
      })
    })

    describe('server', () => {
      let container

      beforeEach(async () => {
        container = await new Container().configure({ host, port, servlets, secure })
        const methods = ['listen', 'close']

        methods.forEach(m => {
          sinon.stub(container.server, m).callsFake((arg0, arg1, arg2) => {
            if (typeof arg0 === 'function') { arg0() }
            if (typeof arg2 === 'function') { arg2() }
          })
          sinon.stub(container.httpsServer, m).callsFake((arg0, arg1, arg2) => {
            if (typeof arg0 === 'function') { arg0() }
            if (typeof arg2 === 'function') { arg2() }
          })
        })

        const listeners = {}
        const httpsServer = container.httpsServer
        sinon.stub(container.server, 'on').callsFake((event, handler) => {
          listeners[event] = handler
        })
        sinon.stub(container.server, 'emit').callsFake((event, ...args) => {
          const handler = listeners[event]
          if (handler) {
            handler(...args)
          }
        })
        sinon.stub(container, 'initSecureServer').callsFake(() => httpsServer)
      })

      describe('start', () => {
        it('starts inner server if it looks stopped', async () => {
          container.online = false
          await container.start()
          expect(container.server.listen).to.have.been.called()
          expect(container.httpsServer.listen).to.have.been.called()
        })

        it('does nothing otherwise', async () => {
          container.online = true
          await container.start()
          expect(container.server.listen).to.not.have.been.called()
          expect(container.httpsServer.listen).to.not.have.been.called()
        })
      })

      describe('stop', () => {
        it('turns off inner server if it\'s online', async () => {
          container.online = true
          await container.stop()
          expect(container.server.close).to.have.been.called()
          expect(container.httpsServer.close).to.have.been.called()
        })

        it('does nothing otherwise', async () => {
          container.online = false
          await container.stop()
          expect(container.server.close).to.not.have.been.called()
          expect(container.httpsServer.close).to.not.have.been.called()
        })
      })

      describe('restart', () => {
        it('restarts server', async () => {
          container.online = true
          await container.restart()
          expect(container.server.listen).to.have.been.called()
          expect(container.server.close).to.have.been.called()
          expect(container.httpsServer.close).to.have.been.called()
          expect(container.online).to.be.true()
        })
      })
    })

    describe('collector', () => {
      it('aggregates chunk data', async () => {
        const container = await new Container().configure({ host, port, servlets, secure })
        const req = new EventEmitter()
        const res = {}

        sinon.stub(container, 'handler').callsFake(() => {})
        container.collector(req, res)

        req.emit('data', Buffer.from('foo'))
        req.emit('data', null)
        req.emit('data', Buffer.from('bar'))
        req.emit('end')

        expect(req.body).to.deep.equal(Buffer.from('foobar'))
        container.handler.should.have.been.calledWith(req, res)
      })
    })

    describe('handler', () => {
      let container
      let servlets

      beforeEach(async () => {
        servlets = { foo: { handler: foo.handler }, bar: { handler: bar.handler } }
        sinon.spy(servlets.foo, 'handler')
        sinon.spy(servlets.bar, 'handler')

        container = await new Container().configure({ host, port, servlets, secure })
        container.online = true
      })

      it('passes request control to handler', () => {
        const { req, res } = reqresnext({ url: 'foo/inner' })

        // TODO fix reqresnext
        req.on = (e, f) => { f(); return req }

        container.server.emit('request', req, res)
        req.emit('end')

        expect(servlets.foo.handler).to.have.been.called()
      })

      it('invokes found servlet', () => {
        const { req, res } = reqresnext({ url: 'foo/inner' })

        container.handler(req, res)
        expect(servlets.foo.handler).to.have.been.called()
      })

      it('returns InternalError on servlet unhandled', () => {
        const { req, res } = reqresnext({ url: 'bar/some' })

        container.handler(req, res)
        expect(servlets.bar.handler).to.have.been.called()
        expect(res.body).to.equal('Internal Server Error')
      })

      it('returns NotFound otherwise', () => {
        const { req, res } = reqresnext({ url: 'bazzz' })

        container.handler(req, res)
        expect(res.body).to.equal('Not Found')
      })

      it('drops connection if offline', () => {
        const { req, res } = reqresnext({ url: 'bazzz' })

        container.online = false
        container.handler(req, res)
        expect(res.body).to.equal(undefined)
      })
    })
  })
})
