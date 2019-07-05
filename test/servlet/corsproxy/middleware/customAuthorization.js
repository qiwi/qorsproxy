import proxyquire from 'proxyquire';
import reqres from 'reqresnext';

const stubRequest = request =>
	proxyquire(
		'../../../../src/servlet/corsproxy/middlewares/customAuthorization',
		{ request: request }
	).default;

describe('corsproxy.middleware.customAuthorization', () => {
	const authBody = '{"key1":{"key2":"SuchSecretMuchSecurity"}}';
	const rule = {
		customAuthorization: {
			targetUrl: 'http://target',
			authorizationUrl: 'http://authorization',
			headers: ['authorization', 'additionalHeader'],
			authPath: 'key1.key2'
		}
	};
	const proxy = { rule };
	const headers = {
		authorization: '1',
		additionalHeader: '2',
		badHeader: '3'
	};
	const body = {
		bodyKey: 'bodyKey Value'
	};
	const expectedHeaders = {
		authorization: '1',
		additionalHeader: '2'
	};
	const targetUrl = '/http://target';
	const otherUrl = '/http://other';

	it('exchanges headers to Authorization', () => {
		let authReqOpts = {};
		let proxyedReqOpts = {};
		const request = sinon.stub().callsFake((opts, cb) => {
			proxyedReqOpts = opts;
			return { pipe: sinon.stub() };
		});
		sinon.stub(request, 'get').callsFake((opts, cb) => {
			authReqOpts = opts;
			cb(null, {}, authBody);
		});
		const customAuthorization = stubRequest(request);

		const { req, res, next } = reqres(
			{ proxy, url: targetUrl, headers },
			{}
		);
		customAuthorization(req, res, next);

		expect(authReqOpts.headers).to.deep.equal(expectedHeaders);
		expect(proxyedReqOpts.headers.Authorization).to.be.equal(
			'SuchSecretMuchSecurity'
		);
	});

	it('does not loose request body', () => {
		let authReqOpts = {};
		let proxyedReqOpts = {};
		const request = sinon.stub().callsFake((opts, cb) => {
			proxyedReqOpts = opts;
			return { pipe: sinon.stub() };
		});
		sinon.stub(request, 'get').callsFake((opts, cb) => {
			authReqOpts = opts;
			cb(null, {}, authBody);
		});
		const customAuthorization = stubRequest(request);

		const { req, res, next } = reqres(
			{ proxy, url: targetUrl, headers, body },
			{}
		);
		customAuthorization(req, res, next);

		expect(proxyedReqOpts.body).to.be.equal(body);
	});

	it('does nothing to urls not from config', () => {
		const request = sinon.stub();
		const customAuthorization = stubRequest(request);
		const pass = sinon.stub();

		const { req, res, next } = reqres(
			{ proxy, url: otherUrl, headers },
			{}
		);
		customAuthorization(req, res, pass);

		expect(pass.called).to.be.true;
		expect(request.called).to.be.false;
	});
});
