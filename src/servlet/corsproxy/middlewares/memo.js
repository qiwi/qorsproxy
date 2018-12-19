import { get } from '../../../base';
import factory from '@qiwi/primitive-storage'

const storages = {}
const storageFactory = (dir) => {
	if (!storages[dir]) {
		storages[dir] = factory({
			defaultTtl: 60000000,
			path: dir
		})
	}

	return storages[dir]
}

export default (req, res, next) => {
	const memo = get(req, 'proxy.rule.memo');

	if (!memo) {
		next();
		return;
	}

	const _write = res.write;
	const _end = res.end;
	const _send = res.send;
	const chunks = [];
	const { dir, host } = memo;
	const { proxy: {to, path: {href}}, body = '' } = req
	const key = `${req.method}:${href}:body:${body.toString('utf-8')}`
	const storage = storageFactory(dir)

	if (!host.includes(to)) {
		next();
		return;
	}

	res.send = (...args) => {
		res.send = _send;
		_send.apply(res, args);
	};

	res.write = (...args) => {
		chunks.push(Buffer.from(args[0]));
		_write.apply(res, args);
	};

	res.end = (...args) => {
		const chunk = args[0];

		if (chunk) {
			chunks.push(Buffer.from(chunk));
		}
		res.end = _end;
		res.write = _write;
		_end.apply(res, args);
	};

	// NOTE we can not get entire headers list on send
	res.on('finish', () => {
		const status = res.statusCode;
		const content = Buffer.concat(chunks)

		chunks.length = 0;

		storage.set(key, {
			status,
			content: content.toString('utf8'),
			headers: res.header()._headers
		})
	});

	next();
}