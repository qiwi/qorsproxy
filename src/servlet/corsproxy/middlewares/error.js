import codes from '../codes';
import log from '../../../log';

/**
 * Error handler middleware
 * @param {Error} err
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export default (err, req, res, next) => {
	log.error('Proxy unexpected error', err);

	res
		.status(codes.INTERNAL_ERROR)
		.json({message: 'Proxy unexpected error'});
}
