import chai from 'chai';
import spies from 'chai-spies';
import reqres from '../../../assets/reqres';
import logger, {getLogLevelByStatus} from '../../../../src/servlet/corsproxy/middlewares/logger';
import {OK, NO_CONTENT, BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR} from '../../../../src/servlet/const/status';
import log, {INFO, WARN, ERROR} from '../../../../src/log';

chai.use(spies);
const {expect} = chai;
const sandbox = chai.spy.sandbox();

describe('corsproxy.middleware.logger', () => {
	it('gets logger level by status code', () => {
		expect(getLogLevelByStatus(OK)).to.equal(INFO);
		expect(getLogLevelByStatus(NO_CONTENT)).to.equal(INFO);
		expect(getLogLevelByStatus(BAD_REQUEST)).to.equal(WARN);
		expect(getLogLevelByStatus(FORBIDDEN)).to.equal(WARN);
		expect(getLogLevelByStatus(INTERNAL_ERROR)).to.equal(ERROR);
	});

	describe('', () => {
		before(() => {
			sandbox.on(log, [INFO, WARN, ERROR]);
			sandbox.on(log.constructor, 'now', () => 0)
		});
		after(() => {
			sandbox.restore(log);
			sandbox.restore(log.constructor);
		});

		it('logs current request', () => {
			const {req, res, next} = reqres({
				ip: '192.168.1.10',
				method: 'GET',
				proxy: {
					id: '123',
					path: {
						protocol: 'http',
						host: 'example.com'
					}
				}
			});
			logger(req, res, next);

			expect(log.info).to.have.been.called.with('REQ 123 > method=GET origin=undefined ip=192.168.1.10 dest=http://example.com user=undefined headers={}');
		});

		it('logs response on finish', () => {
			const {req, res, next} = reqres({
				ip: '192.168.1.10',
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
				statusCode: INTERNAL_ERROR
			});

			logger(req, res, next);
			res.send('foo');

			expect(log.error).to.have.been.called.with('RES 123 < status=500 duration=0ms headers=undefined bufferLength=3');
		});
	});

	describe('injects res method', () => {
		let req, res, next, send, end, write;

		before(() => {
			({req, res, next} = reqres({
				ip: '192.168.1.10',
				method: 'GET',
				proxy: {
					id: '123',
					path: {
						protocol: 'http',
						host: 'example.com'
					}
				}
			}));
			sandbox.on(res, ['send', 'end', 'write']);
			({send, end, write} = res);

			logger(req, res, next);
		});

		it('write', () => {
			expect(res.write).not.to.equal(write);
			res.write('foo');

			expect(write).to.be.called.with('foo');
		});

		it('send', () => {
			expect(res.send).not.to.equal(send);
			res.send();

			expect(send).to.be.called();
			expect(res.send).to.equal(send);
		});

		it('end', () => {
			expect(res.end).not.to.equal(end);
			res.end('foo');

			expect(res.end).to.be.called();
			expect(res.end).to.equal(end);
		});
	});
});