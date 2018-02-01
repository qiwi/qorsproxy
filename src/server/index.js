import express from 'express';
import http from 'http';
import crypto from 'crypto';
import basicAuth from 'basic-auth';

import log from '../log';
import url from './url';
import Stats from './stats';
import Rules from './rules';
import { pipe, cors, error, gatekeeper, from, to, end, intercept, logger } from './middlewares';

export default class Server {
	/**
	 * @param {String} host
	 * @param {Number} port
	 * @param {Object} rules
	 */
	constructor({host, port, rules}={}) {
		this.online = false;
		this.rules = new Rules();
		this.stats = new Stats();
		this.app = express();

		// TODO autobind
		const statsReq = this.stats.req.bind(this.stats);
		const statsRes = this.stats.res.bind(this.stats);
		const statsReporter = this.stats.reporter.bind(this.stats);
		const contextify = this.contextify.bind(this);
		const throttle = this.throttle.bind(this);

		this.app
			.use(throttle)
			.use('/stats', statsReporter)
			.use(statsReq)
			.use(contextify)
			.use(logger)
			.use(gatekeeper)
			.use(intercept)
			.use(to)
			.use(pipe)
			.use(from)
			.use(cors)
			.use(statsRes)
			.use(end)
			.use(error)
			.disable('x-powered-by');

		this.server = http.createServer(this.app);
	}

	contextify(req, res, next) {
		const {from, to, secret, user, path} = this.constructor.parse(req);
		const {host, port} = this;
		const id = crypto.randomBytes(8).toString('hex');
		const rule = this.rules.get(from, to, secret);

		req.id = res.id = id;

		req.proxy = {
			id,
			rule,
			from,
			to,
			user,
			secret,
			path,
			server: {host, port}
		};

		next();
	}

	/**
	 *
	 * @param {String} host
	 * @param {Number} port
	 * @param {Object} [rules]
	 * @param {String/String[]} [alias=[port]]
	 */
	configure({host, port, rules}={}) {
		port = port|0;

		const restart = this.online && (this.port !== port || this.host !== host);

		this.rules.configure(rules);
		this.port = port;
		this.host = host;

		restart &&
			this.restart();

		log.info('The server is configured.');

		return this;
	}

	/**
	 *
	 * @param {Function} cb
	 * @return {Server}
	 */
	start(cb) {
		if (!this.online ) {
			this.server.listen(this.port, this.host, () => {
				log.info('Server is online: ' + this.host + ':' + this.port);
			});
		}
		this.online = true;

		return this;
	}

	/**
	 *
	 * @param {Function} cb
	 * @return {Server}
	 */
	stop(cb) {
		this.online = false;

		// NOTE Stops the server from accepting new connections and keeps existing connections.
		// This function is asynchronous, the server is finally closed when all connections are ended and the server emits a 'close' event.
		this.server.close(() => {
			log.warn('Server is stopped');
			cb && cb();
		});

		return this;
	}

	/**
	 * @return {Server}
	 */
	restart() {
		log.warn('Server restart is required');
		this.stop(this.start.bind(this));

		return this;
	}

	/**
	 *
	 * @param {Object} req
	 * @param {Object} res
	 * @param {Function} next
	 */
	throttle(req, res, next) {
		if(!this.online) {
			return;
		}
		next();
	}

	static parse(req) {
		let path = url.parseRequest(req),
			auth = basicAuth(req) || {},
			user = auth.name,
			password = auth.pass,
			secret = user && crypto.createHash('md5').update(user + ':' + password).digest('hex'),
			host = path.host,
			origin = req.get('origin');
		origin = origin && url.parse(origin).hostname || origin;

		return {
			path,
			to: host,
			from: origin, // TODO req.ip as fallback?
			user,
			secret
		};
	}
}