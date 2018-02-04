import { assign, isObject, each } from '../../src/base';

export class Req {
	constructor(opts) {
		this.headers = {};
		assign(this, opts);
	}
	get(name) {
		return this.headers[name];
	}
	header() {}
	set() {}
}

export class Res {
	constructor(opts) {
		this.body = '';
		this.headers = {};
		this.__handlers = {};
		assign(this, opts);
	}

	write(data) { this.body += data; return this;}
	writeHead() {
		return this;
	}
	send(value) {
		this.body = '' + (isObject(value) ? JSON.stringify(value) : value);
		this.__trigger('finish');
		return this;
	}
	end() {
		this.__trigger('finish');
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
	on(event, handler) {
		this.__handlers[event] = this.__handlers[event] || [];
		this.__handlers[event]
			.push(handler);

		return this;
	}
	__trigger(event) {
		each(this.__handlers[event], handler => handler());
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