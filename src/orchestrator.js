import logger from './log';
import Server from './server';
import Config, { READY, UPDATE, ERROR } from './config';

export default class Orchestrator {
	constructor(...argv) {
		// TODO IoC/DI
		const config = new Config(...argv);
		const server = new Server();

		config
			.on(READY, ({log, server: {host, port}, rules}) => {
				logger
					.configure(log)
					.info('Config ready.');

				server
					.configure({host, port, rules})
					.start();
			})
			.on(UPDATE, ({log, server: {host, port}, rules}) => {
				logger
					.configure(log)
					.warn('Config updated.');

				server.configure({host, port, rules});
			})
			.on(ERROR, error => {
				if (server.online) {
					logger.warn(error);
					logger.warn('Server uses previous valid config.');
				} else {
					logger.error(error);
				}
			});
	}
}