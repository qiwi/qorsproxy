import reqres from 'reqresnext';
import cors, {ALLOW_ORIGIN} from '../../../../../main/js/servlet/corsproxy/middlewares/cors';

describe('corsproxy.middleware.cors', () => {
	it(`sets ${ALLOW_ORIGIN} to origin if exists`, () => {
		const origin = 'foobar.com';
		const {req, res, next} = reqres({proxy: {origin}}, {piped: {headers: {}}});

		cors(req, res, next);
		expect(res.piped.headers[ALLOW_ORIGIN]).to.equal(origin);
	});

	it(`sets ${ALLOW_ORIGIN} to * if origin is empty`, () => {
		const origin = 'foobar.com';
		const {req, res, next} = reqres({proxy: {}}, {});

		cors(req, res, next);
		expect(res.get(ALLOW_ORIGIN)).to.equal('*');
	});
});
