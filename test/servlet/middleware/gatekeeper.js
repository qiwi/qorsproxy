import chai from 'chai';
import reqres from '../../assets/reqres';
import gatekeeper from '../../../src/servlet/corsproxy/middlewares/gatekeeper';

const { expect } = chai;

const host = '127.0.0.1';
const port = 8080;
const rule = {};
const id = 1;
const user = null;
const from = 'http://localhost:8080';
const to = 'http://example.com';

describe('middleware.gatekeeper', () => {
	it('asserts destination host existance', () => {

		const {req, res, next} = reqres({proxy: {server: {host, port}, rule, id, from, to, user, path}}, {});

		gatekeeper(req, res, next);
	});
});