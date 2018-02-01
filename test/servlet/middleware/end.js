import chai from 'chai';
import reqres from '../../assets/reqres';
import end from '../../../src/servlet/corsproxy/middlewares/end';

const { expect } = chai;

describe('middleware.end', () => {
	it('transfers piped data to response', () => {
		const headers = {foo: 'bar'};
		const statusCode = 200;
		const body = 'Baz';
		const {req, res, next} = reqres({}, {piped: {headers, statusCode, body}});

		end(req, res, next);
		expect(res.statusCode).to.equal(statusCode);
		expect(res.headers).to.own.include(headers);
		expect(res.body).to.equal(body);
	});
});