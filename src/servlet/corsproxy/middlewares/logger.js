import log from '../../../log';
import {BAD_REQUEST, INTERNAL_ERROR} from '../codes';
import url from '../url';

// TODO Support configurations
export default (req, res, next) => {
	const start = Date.now();

	const _write = res.write;
	const _end = res.end;
	const _send = res.send;
	const chunks = [];
	let sent;

	const { id, from, to, user, path } = req.proxy;
	const target = url.format(path);

	log.info(`REQ ${id} > method=${req.method} origin=${from} ip=${req.ip} dest=${target} user=${user} headers=${JSON.stringify(req.headers)}`);

	res.send = (...args) => {
		res.send = _send;
		sent = args;
		_send.apply(res, args);
	};

	res.write = (...args) => {
		chunks.push(new Buffer(args[0]));
		_write.apply(res, args);
	};

	res.end = (...args) => {
		const chunk = args[0];

		if (chunk) {
			chunks.push(new Buffer(chunk));
		}
		res.end = _end;
		res.write = _write;
		_end.apply(res, args);
	};

	// NOTE we can not get entire headers list on send
	res.on('finish', () => {
		const status = res.statusCode;
		const level = status < BAD_REQUEST ?
			'info' :
			status >= INTERNAL_ERROR ?
				'error':
				'warn';
		const content = ('' + (sent && sent[0] || Buffer.concat(chunks).toString('utf8'))).slice(0, 200);

		log[level](`RES ${res.id} < status=${status} duration=${Date.now() - start}ms headers=${JSON.stringify(res.header()._headers)} content=${content}...`);
	});

	next();
}