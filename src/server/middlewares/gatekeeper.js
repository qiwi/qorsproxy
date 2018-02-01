import {OK, FORBIDDEN} from '../codes';
import url from '../url';

export const EMPTY = '<empty>';

/**
 * ACL middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export default (req, res, next) => {
	const { server: {host, port}, rule, id, from, to, user, path } = req.proxy;
	const target = url.format(path);

	let code = OK,
		data;

	switch (true) {
		case !path.host:
			data = {message: `Try like this: 'http://${host}:${port}/http://example.com'`};
			break;

		case path.host === host && +path.port === +port:
			data = {message: 'Ping? Pong!'};
			break;

		case !rule:
			code = FORBIDDEN;
			data = {
				message: 'Proxy error: request does not match any allowed route',
				from: `${from || EMPTY} (origin)`,
				to: `${target}`,
				user: `${user || EMPTY} (basicAuth)`
			};
			break;

		default:
			next();
			return;
	}

	res
		.status(code)
		.json(data);
}