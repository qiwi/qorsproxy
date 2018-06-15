import fs from 'fs';
import path from 'path';
import chai from 'chai';
import Config, { READY, UPDATE, ERROR } from '../../src/config';

const { expect } = chai;

describe('config', () => {
	const host = '127.0.0.1';
	const port = 8080;
	const watch = 10;
	const configPath = path.resolve(__dirname, './test.json');
	const configData = {a: 'a', b: 'b'};
	const configDataStr = JSON.stringify(configData);

	describe('default', () => {
		const config = new Config({host, port}).load();

		it('exports argv params', () => {
			expect(config.host).to.be.a('string');
			expect(config.port).to.be.a('number');
		});

		describe('prototype', () => {
			it('get returns value by key', () => {
				expect(config.get('log.filename')).to.equal('qors-%DATE%.log');
			});

			it('get returns undefined if key is out of map', () => {
				expect(config.get('foo')).to.be.undefined;
			});

			it('getAll returns entire data', () => {
				expect(config.getAll()).to.be.an('object').that.has.all.keys('crumbs', 'log', 'server', 'rules');
			});
		});
	});

	describe('events', () => {
		it('READY', done => {
      fs.writeFileSync(configPath, configDataStr)
			const config = new Config({host, port, watch, config: configPath});
			config
				.on(READY, data => {
					expect(data).to.own.include(configData);
					done();
				})
				.load();
		});

		it('UPDATE', done => {
			const config = new Config({host, port, watch, config: configPath});
			fs.writeFileSync(configPath, JSON.stringify({c: 'c'}));

			config
				.on(UPDATE, data => {
					expect(data).to.own.include({c: 'c'});
					done();
				})
				.load();
		});

		it('ERROR (read)', done => {
			fs.unlinkSync(configPath);

			const config = new Config({host, port, config: configPath});
			config
				.on(ERROR, data => {
					expect(data).to.be.an('error');
					expect(data.message).to.equal(`config_loader: read error path=${configPath}`);
					done();
				})
				.load();
		});

		it('ERROR (parse)', done => {
			fs.writeFileSync(configPath, 'foo:bar');

			const config = new Config({host, port, config: configPath});
			config
				.on(ERROR, data => {
					expect(data).to.be.an('error');
					expect(data.message).to.equal('config_loader: parse error');
					done();
				})
				.load();
		});

		it('ERROR (validate)', done => {
			fs.writeFileSync(configPath, JSON.stringify({server: 'foo'}));

			const config = new Config({host, port, config: configPath});
			config
				.on(ERROR, data => {
					expect(data).to.be.an('error');
					expect(data.message).to.equal('config_loader: invalid by schema');
					done();
				})
				.load();
		});
	});
});
