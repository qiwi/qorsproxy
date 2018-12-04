import yargs from 'yargs';
import log from './log';
import Orchestrator from './orchestrator';

class App {
	static main(argv) {
		log.info('Qorsproxy is loading...');
		log.info(`argv=${JSON.stringify(argv)}`)

		new Orchestrator(argv);
	}
}

new App().constructor.main(yargs.argv);