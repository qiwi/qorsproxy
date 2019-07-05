import request from 'request';
import { get, pick } from '../../../base';

const normalizeUrl = url => url.replace(/^\//, '');

const checkUrl = (url, targetUrl) => normalizeUrl(url).indexOf(targetUrl) === 0;

const extractAuthorization = (body, path) => {
	try {
		const json = JSON.parse(body);
		return get(json, path);
	} catch (error) {
		return false;
	}
};

const processRequest = (req, res, next, config) => {
	const options = {
		url: config.authorizationUrl,
		headers: pick(req.headers, config.headers)
	};
	request.get(options, (error, response, body) => {
		const authorization = extractAuthorization(body, config.authPath);
		if (authorization) {
			const options = {
				uri: normalizeUrl(req.url),
				method: req.method,
				headers: {
					Authorization: authorization
				},
				body: req.body
			};
			request(options).pipe(res);
		} else {
			next(error);
		}
	});
};

export default (req, res, next) => {
	const config = get(req, 'proxy.rule.customAuthorization');
	if (config && checkUrl(req.url, config.targetUrl)) {
		return processRequest(req, res, next, config);
	}
	return next();
};
