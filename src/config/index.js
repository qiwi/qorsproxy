import { get, merge } from '../base';
import emitter from '../emitter';
import DEFAULTS from './defaults';
import ConfigLoader, {LOAD, LOAD_ERROR} from './loader';

export const EVT_PREFIX = 'config_';
export const READY = 'ready';
export const UPDATE = 'update';
export const ERROR = 'error';

export default class Config {
	constructor({config, host, port, watch}) {
		this.host = host;
		this.port = port;

		if (config) {
			this.loader = new ConfigLoader(config, watch)
				.on(LOAD, this.update.bind(this))
				.on(LOAD_ERROR, this.error.bind(this))
				.load();

		} else {
			this.update();
		}
	}

	update(data) {
		const event = this.data ? UPDATE : READY;

		this.inject(data);
		this.constructor.emit(event, this.data);

		return this;
	}

	error(error) {
		this.constructor.emit(ERROR, error);

		return this;
	}

	inject(data) {
		const {host, port} = this;

		this.data = merge(
			{},
			DEFAULTS,
			data,
			{server: {host, port}} // NOTE run opts has priority
		);
	}

	on(event, cb) {
		const _event = EVT_PREFIX + event;

		switch (event) {
			case READY:
				emitter.once(_event, cb);
				this.data && this.constructor.emit(READY, this.data);
				break;

			case UPDATE:
				emitter.on(_event, cb);
		}

		return this;
	}

	get(key) {
		return get(this.data, key);
	}

	getAll() {
		return this.data;
	}

	static emit(event, data) {
		emitter.emit(EVT_PREFIX + event, data);
	}
}