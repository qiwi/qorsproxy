import fs from 'fs';
import path from 'path';
import jsonschema from 'jsonschema';

import { isError } from "../base";
import emitter from '../emitter';
import {SCHEMA} from "./schemas";

export const EVT_PREFIX = 'config_loader_';
export const LOAD = 'load';
export const LOAD_ERROR = 'error';

export default class ConfigLoader {
	constructor(path, watch) {
		this.path = path;
		this.watch = !!watch;
	}
	on(event, cb) {
		emitter.on(EVT_PREFIX + event, cb);

		return this;
	}
	/**
	 * @returns {Object/Error}
	 */
	load() {
		const constructor = this.constructor;
		let data = constructor.read(this.path);
		if (isError(data)) {
			return data;
		}

		data = constructor.parse(data);
		if (isError(data)) {
			return data;
		}

		data = constructor.validate(data);
		if (isError(data)) {
			constructor.emitError(data);
		}

		constructor.emitLoad(data);return this;
	}

	/**
	 * @returns {string/Error}
	 */
	static read(_path) {
		try {
			return fs.readFileSync(path.resolve(_path), { encoding: 'utf8' })
		} catch (e) {
			return new Error(`config_loader: read error path=${_path}`)
		}
	}

	/**
	 *
	 * @param data
	 * @returns {any/Error}
	 */
	static parse(data) {
		try {
			return JSON.parse(data);
		} catch (e) {
			return new Error('config_loader: parse error')
		}
	}
	/**
	 * Validates profile data.
	 */
	static validate(data) {
		if (jsonschema.validate(data, SCHEMA).valid) {
			return data;

		} else {
			return new Error('config_loader: invalid by schema');
		}
	}

	static emitError(error) {
		emitter.emit(EVT_PREFIX + LOAD_ERROR, error);
	}

	static emitLoad(data) {
		emitter.emit(EVT_PREFIX + LOAD, data);
	}
}

