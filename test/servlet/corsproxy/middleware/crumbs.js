import reqres from 'reqresnext';
import crumbs from '../../../../src/servlet/corsproxy/middlewares/crumbs';
import {XFH, HOST} from '../../../../src/servlet/const/header';

const host = '127.0.0.1';
const port = 8080;

describe('corsproxy.middleware.crumbs', () => {
	it('transfers XFH from response', () => {
		const headers = {foo: 'bar', [XFH]: 'qiwi.com'};
		const {req, res, next} = reqres({proxy: {server: {host, port}}}, {piped: {headers}});

		crumbs(req, res, next);
		expect(headers).to.include({foo: 'bar', [XFH]: 'qiwi.com'});
	});

	it('sets XFH to request HOST header if exists', () => {
		const headers = {foo: 'bar'};
		const {req, res, next} = reqres({headers: {[HOST]: 'example.com'}, proxy: {server: {host, port}}}, {piped: {headers}});

		crumbs(req, res, next);
		expect(headers[XFH]).to.equal('example.com');
	});

	it('sets XFH to proxy host otherwise', () => {
		const headers = {foo: 'bar'};
		const {req, res, next} = reqres({proxy: {server: {host, port}}}, {piped: {headers}});

		crumbs(req, res, next);
		expect(headers[XFH]).to.equal('127.0.0.1:8080');
	});
});