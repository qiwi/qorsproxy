import path from 'path';
import winston from 'winston';
import DailyRotateFile  from 'winston-daily-rotate-file';

const { createLogger, transports: {Console}, config: {colorize}} = winston;
winston.transports.DailyRotateFile = DailyRotateFile;

export const DEBUG = 'debug';
export const INFO = 'info';
export const WARN = 'warn';
export const ERROR = 'error';

export const level = {
	DEBUG,
	INFO,
	WARN,
	ERROR,
};

class Log {
	constructor(...opts) {
		this.logger = createLogger();
		this.configure(...opts);
	}
	configure(opts) {
		this.options = this.constructor.formatOptions(opts || {});
		this.logger.configure(this.options);

		return this;
	}

	debug(...args) {
		this.logger.debug(...args); return this;
	}

	info(...args) {
		this.logger.info(...args); return this;
	}

	warn(...args) {
		this.logger.warn(...args); return this;
	}

	error(...args) {
		this.logger.error(...args); return this;
	}

	static formatOptions({dir, name, size, level='info', pattern}) {
		return {
			level: level,
			exitOnError: false,
			transports: [
				new Console({
					timestamp: this.timestamp,
					formatter: this.formatter,
					colorize
				}),
				size && new DailyRotateFile({
					json: false,
					maxsize: size,
					datePattern: pattern,
					dirname: path.resolve(dir + '/'),
					filename: name,
					timestamp: this.timestamp,
					formatter: this.formatter,
					colorize: (level, text) => text,
				})
			].filter(v => !!v)
		};
	}

	static timestamp() {
		return new Date().toISOString();
	}

	/**
	 * @param {Object} options
	 * @return {string}
	 */
	static formatter({level, timestamp, meta, message, colorize}) {
		return `${timestamp()} [${colorize(level, level.toUpperCase())}] ${undefined !== message ? message : ''} ${meta && Object.keys(meta).length ? '\n\t'+ JSON.stringify(meta) : ''}`;
	}

	static now() {
		return Date.now();
	}
}

export default new Log();