import chai from 'chai';
import request from 'request';
import reqres from '../../../assets/reqres';
import pipe from '../../../../src/servlet/corsproxy/middlewares/pipe';
import {ECONNREFUSED} from '../../../../src/servlet/const/error';
import {GET} from '../../../../src/servlet/const/method';
import {OK, REMOTE_IS_DOWN, REMOTE_UNKNOWN} from '../../../../src/servlet/const/status';

const { expect } = chai;
const sandbox = chai.spy.sandbox();

describe('corsproxy.middleware.pipe', () => {
	afterEach(() => {
		sandbox.restore(request);
	});

	const method = GET;
	const statusCode = OK;
	const headers = {foo: 'bar'};
	const body = 'Baz';
	const {req, res, next} = reqres({
		method,
		url: '/http://example.com'
	});

	it('transmits request to target dst', () => {
		sandbox.on(request, method.toLocaleLowerCase(), (opts, cb) => {
			cb(null, {statusCode, headers, body}, body);
		});

		pipe(req, res, next);

		expect(res.piped.statusCode).to.equal(statusCode);
		expect(res.piped.headers).to.equal(headers);
		expect(res.piped.body).to.equal(body);
	});

	it('handles ECONNREFUSED error', () => {
		sandbox.on(request, method.toLocaleLowerCase(), (opts, cb) => {
			cb({code: ECONNREFUSED});
		});

		pipe(req, res, next);

		expect(res.statusCode).to.equal(REMOTE_IS_DOWN);
	});

	it('handles unexpected error', () => {
		sandbox.on(request, method.toLocaleLowerCase(), (opts, cb) => {
			cb({code: 'unknown'});
		});

		pipe(req, res, next);

		expect(res.statusCode).to.equal(REMOTE_UNKNOWN);
	});
});