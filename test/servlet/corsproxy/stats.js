import chai from 'chai';
import reqres from 'reqresnext';
import Stats from '../../../src/servlet/corsproxy/stats';

const { expect } = chai;

describe('corsproxy.stats', () => {
	let stats, req, res, next
	const length = 100;

	beforeEach(() => {
		({req, res, next} = reqres({}, {piped: {body: {length}}}));
    stats = new Stats();
	});

	it('constructor returns proper instance', () => {
		expect(stats.traffic).to.equal(0);
		expect(stats.count).to.equal(0);
	});

	describe('prototype', () => {
		it('`incrementCount` increases the request number', () => {
			stats.incrementCount();
			expect(stats.count).to.equal(1);
		});

		it('`incrementTraffic` adds buffer length to sum', () => {
			stats.incrementTraffic(100);
			expect(stats.traffic).to.equal(100);
		});

		it('`report` return map', () => {
			stats.incrementCount();
			stats.incrementTraffic(200);
			expect(stats.report()).to.include({count: 1, traffic: 200});
		});

		it('`req` mware triggers incrementCount', () => {
			stats.req(req, res, next);
			expect(stats.count).to.equal(1);
		});

		it('`res` mware triggers incrementTraffic', () => {
			stats.res(req, res, next);
			expect(stats.traffic).to.equal(length);
		});
	})
});