import reqres from 'reqresnext';
import memo from '../../../../src/servlet/corsproxy/middlewares/memo';
import path from 'path'
import fs from 'fs'

const stub = path.resolve(__dirname, './stub.json');
const sandbox = sinon.createSandbox();

describe('corsproxy.middleware.memo', () => {
	describe('', () => {
		before(() => {
			fs.writeFileSync(stub, JSON.stringify({}), 'utf8');
		});
		after(() => {
			sandbox.restore();

			fs.writeFileSync(stub, JSON.stringify({}), 'utf8');
		});

		it('collects response data to stub.json', () => {
			const {req, res, next} = reqres({
				method: 'GET',
				proxy: {
					id: '123',
					path: {
						protocol: 'http',
						host: 'example.com',
						href: 'http://example.com/'
					},
					to: 'example.com',
					rule: {
						memo: {
							strategy: 'override',
							dir: stub,
							host: ['example.com']
						}
					}
				},
				headers: {
	        'x-forwarded-for': '192.168.1.10'
				}
			});
			memo(req, res, next);

			res.send({foo: 'bar'})

			expect(fs.readFileSync(stub, 'utf8').slice(0, -15)).to.equal('{"GET:http://example.com/:body:":{"value":{"status":200,"content":"{\\"foo\\":\\"bar\\"}","headers":{"content-type":"application/json; charset=utf-8","content-length":"13"}},"exp":1545303079829}}'.slice(0, -15))
		});
	});

	describe('overrides res method', () => {
		let req, res, next, send, end, write;

		before(() => {
			({req, res, next} = reqres({
				method: 'GET',
				proxy: {
					id: '123',
					path: {
						protocol: 'http',
						host: 'example.com'
					},
					to: 'example.com',
					rule: {
						memo: {
							strategy: 'override',
							dir: stub,
							host: ['example.com']
						}
					}
				}
			}));
      sandbox.spy(res, 'send')
      sandbox.spy(res, 'end')
      sandbox.spy(res, 'write')
			({send, end, write} = res);

			memo(req, res, next);
		});

		it('write', () => {
			expect(res.write).not.to.equal(write);
			res.write('foo');

			expect(write).to.be.calledWith('foo');
		});

		it('send', () => {
			expect(res.send).not.to.equal(send);
      expect(res.end).not.to.equal(end);
			res.send();

			expect(send).to.be.called;
      expect(end).to.be.called;

      expect(res.send).to.equal(send);
      expect(res.end).to.equal(end);
		});
	});
});