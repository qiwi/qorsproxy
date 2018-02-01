import crypto from 'crypto';
import basicAuth from 'basic-auth';
import url from '../url';

export default (req, res, next) => {
	let path = url.parseRequest(req),
		auth = basicAuth(req) || {},
		user = auth.name,
		password = auth.pass,
		secret = user && crypto.createHash('md5').update(user + ':' + password).digest('hex'),
		host = path.host,
		origin = req.get('origin');
		origin = origin && url.parse(origin).hostname || origin;

	req.to = host;
	req.from = origin;
	req.secret = secret;

	next();
}