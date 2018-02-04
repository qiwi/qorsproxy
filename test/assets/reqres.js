import { assign, isObject } from '../../src/base';

export class Req {
	constructor(opts) {
		this.headers = {};
		assign(this, opts);
	}
	header() {}
	set() {}
}

export class Res {
	constructor(opts) {
		this.body = '';
		this.headers = {};
		assign(this, opts);
	}

	write(data) { this.body += data; return this;}
	writeHead() {}
	send(value) {
		this.body = '' + (isObject(value) ? JSON.stringify(value) : value);
		return this;
	}
	end() {
		return this;
	}

	header(value) {
		if (isObject(value)) {
			assign(this.headers, value);
		}
		return this;
	}
	json(value) {
		this.send(JSON.stringify(value));
		return this;
	}
	status(status) {
		this.statusCode = status;
		return this;
	}
}

export function gen(reqOpts, resOpts) {
	return {
		req: new Req(reqOpts),
		res: new Res(resOpts),
		next() {}
	};
}

export default gen;