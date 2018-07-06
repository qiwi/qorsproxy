import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai'
import gen from 'reqresnext';
import Container from '../../src/container';
import Server from '../../src/container/server';

chai.use(sinonChai);
const { expect } = chai;

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
				container.online = false;
				container.start();
				expect(container.server.listen).to.have.been.called;
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
});