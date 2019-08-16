import EventEmitter from 'events';
import gen from 'reqresnext';
import Container from '../../../main/js/container';
import Server from '../../../main/js/container/server';

describe('container', () => {
	const host = '127.0.0.1';
	const port = 8080;
	const foo = {handler() {}};
	const bar = {handler() { throw new Error('Bar unhandled') }};
	const servlets = { foo, bar };

	describe('constructor', () => {
		it('returns proper instance', () => {
      const container = new Container().configure({host, port, servlets});

			expect(container.server).to.be.an.instanceof(Server);
			expect(container.online).to.be.a('boolean');
		});
	});

	describe('proto', () => {
    describe('configure', () => {
      const container = new Container().configure({host, port, servlets});

      beforeEach(() => {
        sinon.spy(container, 'restart');
      });

      afterEach(() => {
      	container.restart.restore();
      })

    	it('registers new servlets', () => {
        const servlets = {};
        container.configure({servlets});
        expect(container.servlets).to.equal(servlets);
	    });

			it('triggers restart when `port` changes', () => {
				const host = '0.0.0.0';
        container.online = true;
        container.configure({host});

        expect(container.host).to.equal(host);
        container.restart.should.have.been.called;
			});

      it('triggers restart when `host` changes', () => {
        const port = 8080;
        container.online = true;
        container.configure({port});

        expect(container.port).to.equal(port);
        container.restart.should.have.been.called;
      });
    });

    describe('server', () => {
      let container;

      beforeEach(() => {
        container = new Container().configure({host, port, servlets});
        const methods = ['listen', 'close']

        methods.forEach(m => {
          sinon.stub(container.server, m).callsFake((arg0, arg1, arg2) => {
            if (typeof arg0  === 'function') { arg0() }
            if (typeof arg2  === 'function') { arg2() }
          });
        })

        const listeners = {}
        sinon.stub(container.server, 'on').callsFake((event, handler) => {
          listeners[event] = handler
        });
        sinon.stub(container.server, 'emit').callsFake((event, ...args) => {
          const handler = listeners[event]
          if (handler) {
            handler(...args)
          }
        });
      })

      describe('start', () => {
        it('starts inner server if it looks stopped', () => {
          const cb = sinon.spy()
          container.online = false;
          container.start(cb);
          expect(container.server.listen).to.have.been.called;
          expect(cb).to.have.been.called;
        });

        it('does nothing otherwise', () => {
          container.online = true;
          container.start();
          expect(container.server.listen).to.not.have.been.called;
        });
      });

      describe('stop', () => {
        it('turns off inner server if it\'s online', () => {
          container.online = true;
          container.stop(() => {});
          expect(container.server.close).to.have.been.called;
        });

        it('does nothing otherwise', () => {
          container.online = false;
          container.stop();
          expect(container.server.close).to.not.have.been.called;
        });
      });

      describe('restart', () => {
        it('restarts server', () => {
          container.online = true;
          container.restart();
          expect(container.server.listen).to.have.been.called;
          expect(container.server.close).to.have.been.called;
          expect(container.online).to.be.true;
        });
      });
    });

    describe('collector', () => {
      it('aggregates chunk data', () => {
        const container = new Container().configure({host, port, servlets});
        const req = new EventEmitter();
        const res = {};

        sinon.stub(container, 'handler').callsFake(() => {});
        container.collector(req, res);

        req.emit('data', new Buffer('foo'));
        req.emit('data', null);
        req.emit('data', new Buffer('bar'));
        req.emit('end');

        expect(req.body).to.deep.equal(new Buffer('foobar'))
        container.handler.should.have.been.calledWith(req, res);
      });
    });

    describe('handler', () => {
      let container
      let servlets

      beforeEach(() => {
        servlets = {foo: {handler: foo.handler}, bar: {handler: bar.handler}}
        sinon.spy(servlets.foo, 'handler');
        sinon.spy(servlets.bar, 'handler');

        container = new Container().configure({host, port, servlets});
        container.online = true;
      })

      it('passes request control to handler', () => {
        const {req, res} = gen({url: 'foo/inner'});

        // TODO fix reqresnext
        req.on = (e, f) => {f(); return req}

        container.server.emit('request', req, res);
        req.emit('end')

        expect(servlets.foo.handler).to.have.been.called;
      })

      it('invokes found servlet', () => {
        const {req, res} = gen({url: 'foo/inner'});

        container.handler(req, res);
        expect(servlets.foo.handler).to.have.been.called;
      });

      it('returns InternalError on servlet unhandled', () => {
        const {req, res} = gen({url: 'bar/some'});

        container.handler(req, res);
        expect(servlets.bar.handler).to.have.been.called;
        expect(res.body).to.equal('Internal Server Error');
      });

      it('returns NotFound otherwise', () => {
        const {req, res} = gen({url: 'bazzz'});

        container.handler(req, res);
        expect(res.body).to.equal('Not Found');
      });

      it('drops connection if offline', () => {
        const {req, res} = gen({url: 'bazzz'});

        container.online = false;
        container.handler(req, res);
        expect(res.body).to.equal(undefined);
      });
    });
	});
});
