// TODO configurable interceptor
export default (req, res, next) => {
	if ('OPTIONS' === req.method) {
		res.sendStatus(200);
	}
	next();
}