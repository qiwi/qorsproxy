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
			headers: ['Authorization', 'additionalHeader'],
			authPath: 'key1.key2'
		}
	};
	const proxy = { rule };
	const headers = {
		Authorization: '1',
		additionalHeader: '2',
		badHeader: '3',
		host: null
	};
	const body = {
		bodyKey: 'bodyKey Value'
	};
	const expectedAuthEndpointHeaders = {
        Authorization: '1',
		additionalHeader: '2'
	};
	const expectedTargetEndpointHeaders = {
        Authorization: 'SuchSecretMuchSecurity',
		additionalHeader: '2',
        badHeader: '3',
        host: null
	};
	const targetUrl = '/http://target';
	const otherUrl = '/http://other';

	it('adds Authorization to headers ', () => {
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

		expect(authReqOpts.headers).to.deep.equal(expectedAuthEndpointHeaders);
		expect(proxyedReqOpts.headers).to.deep.equal(expectedTargetEndpointHeaders);
	});

	it('transmits body to target endpoint', () => {
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
