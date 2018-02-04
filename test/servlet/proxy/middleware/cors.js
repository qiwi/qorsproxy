import chai from 'chai';
import reqres from '../../../assets/reqres';
import cors, {ALLOW_ORIGIN} from '../../../../src/servlet/corsproxy/middlewares/cors';

const { expect } = chai;

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
		expect(res.headers[ALLOW_ORIGIN]).to.equal('*');
	});
});