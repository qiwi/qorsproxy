import request from 'request';
import reqres from 'reqresnext';
import pipe from '../../../../../main/js/servlet/corsproxy/middlewares/pipe';
import {ECONNREFUSED} from '../../../../../main/js/servlet/const/error';
import {GET} from '../../../../../main/js/servlet/const/method';
import {OK, REMOTE_IS_DOWN, REMOTE_UNKNOWN} from '../../../../../main/js/servlet/const/status';

const sandbox = sinon.createSandbox();

describe('corsproxy.middleware.pipe', () => {
	const method = GET;
	const statusCode = OK;
	const headers = {foo: 'bar'};
	const body = 'Baz';

	afterEach(() => {
		sandbox.restore()
	})

	it('transmits request to target dst', () => {
		sandbox.stub(request, method.toLocaleLowerCase()).callsFake( (opts, cb) => {
			cb(null, {statusCode, headers, body}, body);
		});
    const {req, res, next} = reqres({
      method,
      url: 'http://example.com'
    })

		pipe(req, res, next);
		expect(res.piped.statusCode).to.equal(statusCode);
		expect(res.piped.headers).to.equal(headers);
		expect(res.piped.body).to.equal(body);
	});

	it('handles ECONNREFUSED error', () => {
		sandbox.stub(request, method.toLocaleLowerCase()).callsFake( (opts, cb) => {
			cb({code: ECONNREFUSED});
		});
    const {req, res, next} = reqres({
      method,
      url: 'http://example.com'
    })

		pipe(req, res, next);
		expect(res.statusCode).to.equal(REMOTE_IS_DOWN);
	});

	it('handles unexpected error', () => {
		sandbox.stub(request, method.toLocaleLowerCase()).callsFake( (opts, cb) => {
			cb({code: 'unknown'});
		});
    const {req, res, next} = reqres({
      method,
      url: 'http://example.com'
    })

		pipe(req, res, next);
		expect(res.statusCode).to.equal(REMOTE_UNKNOWN);
	});
});
