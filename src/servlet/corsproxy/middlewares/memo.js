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

	const { dir, host } = memo;
	const { proxy: {to, path: {href}}, body = '' } = req
	const key = `${req.method}::${href}::${body.toString('utf-8')}`
	const storage = storageFactory(dir)
	const {statusCode, headers, body: content} = res.piped

	if (!host.includes(to)) {
		next();
		return;
	}

	const entry = {
		statusCode: statusCode,
		body: content.toString('utf8'),
		headers
	}

	storage.set(key, entry)

	next();
}