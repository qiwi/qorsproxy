import chai from 'chai';
import chaiSubset from 'chai-subset';
import reqres from '../../assets/reqres';
import Corsproxy from '../../../src/servlet/corsproxy';
import Rules from '../../../src/servlet/corsproxy/rules';
import Stats from '../../../src/servlet/corsproxy/stats';
import url from '../../../src/servlet/corsproxy/url';

const { expect } = chai;
chai.use(chaiSubset);

describe('corsproxy', () => {
	const proxy = new Corsproxy();
	const host = 'localhost';
	const port = 3030;
	const rules = {};

	it('constructor returns proper instance', () => {
		expect(proxy.handler).not.to.be.undefined;
		expect(proxy.online).to.be.false;
		expect(proxy.rules).to.be.an.instanceof(Rules);
		expect(proxy.stats).to.be.an.instanceof(Stats);
	});

	describe('proto', () => {
		it('configure updates instance state', () => {
			proxy.configure({host, port, rules});

			expect(proxy.host).to.equal(host);
			expect(proxy.port).to.equal(port);
		});

		it('health returns OK', () => {
			expect(proxy.health()).to.equal('OK');
		});

		it('metrics returns stats report', () => {
			expect(proxy.metrics()).to.include(new Stats().report())
		});

		it('contextify sets req/res context', () => {
			const origin = 'http://localhost:3000';
			const {req, res, next} = reqres({
				url: '/http://example.com',
				headers: {
					origin
				}
			});

			proxy.contextify(req, res, next);

			expect(req.id).not.to.be.undefined;
			expect(req.id).to.equal(res.id);
			expect(req).to.containSubset({
				proxy: {
					from: 'localhost',
					to: 'example.com',
					origin,
					server: {host, port}
				}
			});
		});
	});
});