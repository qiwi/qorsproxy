import codes from '../codes';

'use strict';

/**
 * Error handler middleware
 * @param {Error} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export default (err, req, res, next) => {
	res
		.status(codes.UNEXPECTED)
		.json({message: 'Proxy unexpected error'});
}
