import { mapValues, find, isFunction } from '../../base';
import {DEFAULT_MAP, DEFAULT_CODE} from './mapping';
import {UP, DOWN, UNKNOWN} from './status';

/*export const UP = 'UP';
export const DOWN = 'DOWN';*/

export default class Health {
	constructor(components) {
		this.configure(components);
	}

	configure(components) {
		this.components = components || {};

		return this;
	}

	handler(req, res) {
		const details = mapValues(this.components, this.constructor.getHealth);
		const status = find(details, this.constructor.isFail) ? DOWN : UP;
		const code = this.constructor.resolveHttpCode(status);

		res.writeHead(code, {'Content-Type': 'application/json'});
		res.write(JSON.stringify({
			status,
			details
		}));
		res.end();
	}

	static resolveHttpCode(status, map=DEFAULT_MAP, code=DEFAULT_CODE) {
		// NOTE Inspired by Spring contract
		// https://docs.spring.io/spring-boot/docs/current/reference/html/production-ready-endpoints.html
		return map[status] || code;
	}

	static getHealth(component) {
		try {
			if (isFunction(component.health)) {
				return component.health();
			}

			return component.health || UP; // NOTE It may be getter

		} catch (e) {
			return DOWN;
		}
	}

	static isFail(health) {
		return health !== UP && health.status !== UP;
	}
}
