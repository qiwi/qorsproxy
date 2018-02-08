import chai from 'chai';
import reqres from '../../../assets/reqres';
import intercept from '../../../../src/servlet/corsproxy/middlewares/intercept';
import {GET} from '../../../../src/servlet/const/method';
import {FORBIDDEN, OK} from '../../../../src/servlet/const/status';

const {expect} = chai;

describe('corsproxy.middleware.intercept', () => {
	it('captures request by method match', () => {
		const headers = {foo: 'bar'};
		const body = 'Baz';
		const {req, res, next} = reqres({
			method: GET,
			proxy: {
				rule: {
					interceptions: [{
						req: {method: GET},
						res: {status: FORBIDDEN, headers, body}
					}]
				}
			}
		});

		intercept(req, res, next);
		expect(res.statusCode).to.equal(FORBIDDEN);
		expect(res.headers).to.include(headers);
		expect(res.body).to.equal(body);
	});

	it('captures request by header match', () => {
		const headers = {foo: 'bar'};
		const body = 'Baz';
		const {req, res, next} = reqres({
			method: GET,
			headers,
			proxy: {
				rule: {
					interceptions: [{
						req: {headers},
						res: {body}
					}]
				}
			}
		});

		intercept(req, res, next);
		expect(res.statusCode).to.equal(OK);
		expect(res.body).to.equal(body);
	});

	it('proceeds to next if no match found', () => {
		const next = chai.spy(() => {});
		const {req, res} = reqres();

		intercept(req, res, next);
		expect(next).to.be.called();
		expect(res.body).to.equal('');
	});
});