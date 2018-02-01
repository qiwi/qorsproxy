import path from 'path';
import winston from 'winston';
import DailyRotateFile  from 'winston-daily-rotate-file';

const { Logger, transports: {Console}, config: {colorize}} = winston;
winston.transports.DailyRotateFile = DailyRotateFile;

class Log {
	constructor(...opts) {
		this.logger = new Logger();
		this.configure(...opts);
	}
	configure(opts) {
		this.options = this.constructor.formatOptions(opts || {});
		this.logger.configure(this.options);

		return this;
	}

	debug(...args) {
		return this.logger.debug(...args);
	}

	info(...args) {
		return this.logger.info(...args);
	}

	warn(...args) {
		return this.logger.warn(...args);
	}

	error(...args) {
		return this.logger.error(...args);
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
}

export default new Log();