import http from 'http';
import { find } from '../base';
import log from '../log';

export default class Server {
	constructor() {
		this.online = false;
		this.server = new http.Server(this.handler.bind(this));
	}

	configure({host, port, servlets}) {
		if (servlets) {
			this.servlets = servlets;
		}

		port = port|0;

		const restart = this.online && (this.port !== port || this.host !== host);

		this.port = port;
		this.host = host;

		restart &&
			this.restart();

		log.info('Container configured.');

		return this;
	}

	handler(req, res) {

		if(!this.online) {
			return;
		}

		const servlet = find(this.servlets, (servlet, path) => {
			return !req.url.indexOf(path);
		});

		if (servlet) {
			servlet.handler(req, res);
		}

		// return something
	}

	start() {
		if (!this.online) {
			this.server.listen(this.port, this.host, () => {
				log.info('Container is online: ' + this.host + ':' + this.port);
			});
		}
		this.online = true;

		return this;
	}

	stop(cb) {
		this.online = false;

		// NOTE Stops the server from accepting new connections and keeps existing connections.
		// This function is asynchronous, the server is finally closed when all connections are ended and the server emits a 'close' event.
		this.server.close(() => {
			log.warn('Container stopped.');
			cb && cb();
		});

		return this;
	}

	restart() {
		log.warn('Container restart required.');
		this.stop(this.start.bind(this));

		return this;
	}
}