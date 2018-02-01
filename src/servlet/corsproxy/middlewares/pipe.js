import request from 'request';
import codes from '../codes';
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
				case codes.ECONNREFUSED:
					res.status(codes.BAD_REQUEST).json({message: 'Connection refused: ' + dest});
					break;

				default:
					res.status(codes.NOT_FOUND).json({message: 'Unreachable dest: ' + dest});
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
