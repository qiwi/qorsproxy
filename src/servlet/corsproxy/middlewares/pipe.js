import request from 'request';
import {ECONNREFUSED} from '../../const/error';
import {REMOTE_UNKNOWN, REMOTE_IS_DOWN} from '../../const/status';
import url from '../url';

/**
 * Pipe middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} [next]
 */
export default (req, res, next) => {
	let dest = url.format(url.parseRequest(req)),
		method = req.method.toLowerCase(),
		headers = req.headers;

	req.pipe(request[method]({url: dest, encoding: null, headers}, (error, response, body) => {
		if (error) {
			switch (error.code) {
				case ECONNREFUSED:
					res.status(REMOTE_IS_DOWN).json({message: 'Connection refused: ' + dest});
					break;

				default:
					res.status(REMOTE_UNKNOWN).json({message: 'Unreachable dest: ' + dest});
			}
			return;
		}

		res.piped = {
			statusCode: response.statusCode,
			headers: response.headers,
			body: body // Buffer
		};
		next();
	}));
}
