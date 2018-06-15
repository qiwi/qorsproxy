import { Server } from 'http';

export default class extends Server {
	constructor(handler) {
		super(handler);
	}

	static notFound(req, res) {
		this.sendError(res, 404, 'Not Found');
	}

	static internalError(req, res) {
		this.sendError(res, 500, 'Internal Server Error');
	}

	static sendError(res, status, message) {
		res.writeHead(status, {'Content-Type': 'text/plain'});
		res.write(message);
		res.end();
	}
}