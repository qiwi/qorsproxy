import reqres from 'reqresnext';
import Corsproxy from '../../../src/servlet/corsproxy';
import url from '../../../src/servlet/corsproxy/url';

describe('corsproxy.parse', () => {
	it('parses request data', () => {
		const {req} = reqres({
			url: '/http://example.com',
			headers: {
				authorization: 'Basic Zm9vOmJhcg==',
				origin: 'http://localhost:3000'
			}
		});

		const parsed = Corsproxy.parse(req);

		expect(parsed.origin).to.equal('http://localhost:3000');
		expect(parsed.from).to.equal('localhost');
		expect(parsed.to).to.equal('example.com');
		expect(parsed.secret).to.equal('4e99e8c12de7e01535248d2bac85e732');
		expect(parsed.user).to.equal('foo');
		expect(parsed.path).to.include(url.parse('http://example.com'));
	});
});