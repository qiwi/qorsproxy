import chai from 'chai';
import spies from 'chai-spies';
import { gen } from '../assets/reqres';
import Container from '../../src/container';
import Server from '../../src/container/server';

chai.use(spies);
const { expect } = chai;

describe('container', () => {
	const host = '127.0.0.1';
	const port = 8080;
	const foo = () => {};
	const bar = () => { throw new Error('Bar unhandled') };
	const servlets = { foo, bar };
	const container = new Container().configure({host, port, servlets});

	describe('constructor', () => {
		it('returns proper instance', () => {
			expect(container.server).to.be.an.instanceof(Server);
			expect(container.online).to.be.a('boolean');
		});
	});

	describe('handler', () => {
		it('invokes found servlet', () => {
			const {req, res} = gen({url: 'fo'});
			chai.spy.on(servlets, 'foo');

			container.handler(req, res);
			expect(servlets.foo).to.have.been.called;
		});

		it('returns InternalError on servlet unhandled', () => {

		});

		it('returns NotFound otherwise', () => {

		});
	});

	describe('start', () => {
		it('starts inner server if it looks stoppped', () => {

		});

		it('does nothing otherwise', () => {});
	});

	describe('stop', () => {
		it('turns off inner server if it\'s online', () => {

		});

		it('does nothing otherwise', () => {});
	});

	describe('restart', () => {
		it('restarts server', () => {

		});
	});

	/*describe('static', () => {
		it('notFound', () => {
			//expect(Server.notFound({})).
		});

		it('internalError', () => {

		});
	});*/
});