import { find } from '../base';
import log from '../log';
import Server from './server';

export default class Container {
	constructor() {
		this.online = false;
		this.server = new Server();
    this.server.on('request', (request, response) => {
      let body = [];
      request.on('data', (chunk) => {
        chunk && body.push(chunk);
      }).on('end', () => {
      	if (body.length) {
          request.body = Buffer.concat(body);
        }

        this.handler.call(this, request, response)
      });
    });
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
		const url = req.url;
		let route;

		if(!this.online) {
			res.end();
			return;
		}

		const servlet = find(this.servlets, (servlet, r) => {
			route = r; // TODO add servlet name prop
			return !url.indexOf(r);
		});
		
		if (!servlet) {
			log.error(`Servlet not found. url=${url}`);
			this.server.constructor.notFound(req, res);
			return;
		}
		try {
			servlet.handler(req, res);
		} catch (e) {
			log.error(`Servlet unhandled exception. route=${route} url=${url}`, e);
			this.server.constructor.internalError(req, res);
		}
	}

	start(cb) {
		if (!this.online) {
			this.server.listen(
				this.port,
				this.host,
				() => {
					log.info('Container is online: ' + this.host + ':' + this.port);
					cb && cb();
				}
			);
			this.online = true;
		}

		return this;
	}

	stop(cb) {
		if (this.online) {
			// NOTE Stops the server from accepting new connections and keeps existing connections.
			// This function is asynchronous, the server is finally closed when all connections are ended and the server emits a 'close' event.
			this.online = false;
			this.server.close(() => {
				log.warn('Container stopped.');
				cb && cb();
			});
		}

		return this;
	}

	restart() {
		log.warn('Container restart required.');
		this.stop(this.start.bind(this));

		return this;
	}
}