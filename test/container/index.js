import chai from 'chai';
import spies from 'chai-spies';
import { gen } from '../assets/reqres';
import Container from '../../src/container';
import Server from '../../src/container/server';

chai.use(spies);
const { expect } = chai;
const sandbox = chai.spy.sandbox();

describe('container', () => {
	const host = '127.0.0.1';
	const port = 8080;
	const foo = {handler() {}};
	const bar = {handler() { throw new Error('Bar unhandled') }};
	const servlets = { foo, bar };
	const container = new Container().configure({host, port, servlets});

	describe('constructor', () => {
		it('returns proper instance', () => {
			expect(container.server).to.be.an.instanceof(Server);
			expect(container.online).to.be.a('boolean');
		});
	});

	describe('handler', () => {
		before(() => {
			container.online = true;
			sandbox.on(foo, 'handler');
			sandbox.on(bar, 'handler');
		});

		after(() => {
			sandbox.restore(foo);
			sandbox.restore(bar);
		});

		it('invokes found servlet', () => {
			const {req, res} = gen({url: 'foo/inner'});

			container.handler(req, res);
			expect(servlets.foo.handler).to.have.been.called();
		});

		it('returns InternalError on servlet unhandled', () => {
			const {req, res} = gen({url: 'bar/some'});

			container.handler(req, res);
			expect(servlets.bar.handler).to.have.been.called();
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
			expect(res.body).to.equal('');
		});
	});

	describe('server', () => {
		let container;

		beforeEach(() => {
			container = new Container().configure({host, port, servlets});
			sandbox.on(container.server, ['listen', 'close'], (arg0, arg1, arg2) => {
				if (typeof arg0  === 'function') { arg0() }
				if (typeof arg2  === 'function') { arg2() }
			});
		});

		describe('start', () => {
			it('starts inner server if it looks stopped', () => {
				container.online = false;
				container.start();
				expect(container.server.listen).to.have.been.called();
			});

			it('does nothing otherwise', () => {
				container.online = true;
				container.start();
				expect(container.server.listen).to.not.have.been.called();
			});
		});

		describe('stop', () => {
			it('turns off inner server if it\'s online', () => {
				container.online = true;
				container.stop(() => {});
				expect(container.server.close).to.have.been.called();
			});

			it('does nothing otherwise', () => {
				container.online = false;
				container.stop();
				expect(container.server.close).to.not.have.been.called();
			});
		});

		describe('restart', () => {
			it('restarts server', () => {
				container.online = true;
				container.restart();
				expect(container.server.listen).to.have.been.called();
				expect(container.server.close).to.have.been.called();
				expect(container.online).to.be.true;
			});
		});
	});
});