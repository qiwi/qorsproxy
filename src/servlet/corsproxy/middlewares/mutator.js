import {each, isObject, isNull, isArray} from './../../../base';

export const FROM = 'from';
export const TO = 'to';

function from(req, res, next) {
	const headers = res.piped.headers;
	const rule = req.proxy.rule;
	const mutations = (rule.mutations || []).filter(m => m.direction === FROM);

	mutate(headers, mutations);

	next();
}

function to(req, res, next) {
	const headers = req.headers;
	const rule = req.proxy.rule;
	const mutations = (rule.mutations || []).filter(m => m.direction === TO);

	mutate(headers, mutations);

	next();
}

export {
	from,
	to
}

function mutate(headers, mutations) {
	each(mutations, m => {
		each(m.headers, ({name, value}) => {
			const prev = headers[name];

			if (!value) {
				delete headers[name];
				return
			}

			if (!isObject(value)) {
				headers[name] = '' + value;
				return;
			}

			if (prev) {
				if (isArray(prev)) {
					headers[name] = prev.map(prev => prev.replace(parsePattern(value.from), value.to));
				} else {
					headers[name] = prev.replace(parsePattern(value.from), value.to);
				}
			}
		});
	});
}

export function parsePattern(value) {
	const ARGS_PATTERN = /\/(.+)\/(.*)/;
	const args = ('' + value).match(ARGS_PATTERN);

	if (isNull(args)) {
		return value;
	}
	try {
		return new RegExp(args[1], args[2]);
	} catch (e) {
		return value;
	}
}