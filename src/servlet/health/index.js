import { mapValues, find, isFunction } from '../../base';

export const OK = 'OK';
export const FAIL = 'FAIL';

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
		const status = find(details, this.constructor.isFail) ? FAIL : OK;

		res.writeHead(200, {'Content-Type': 'application/json'});
		res.write(JSON.stringify({
			status,
			details
		}));
		res.end();
	}

	static getHealth(component) {
		try {
			if (isFunction(component.health)) {
				return component.health();
			}

			return component.health || OK; // NOTE It may be getter

		} catch (e) {
			return FAIL;
		}
	}

	static isFail(health) {
		return health !== OK && health.status !== OK;
	}
}
