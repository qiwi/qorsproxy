import opt from 'optimist';
import log from './log';
import Orchestrator from './orchestrator';

class App {
	static main(...argv) {
		log.info('Qorsproxy loading...');

		new Orchestrator(...argv);
	}
}

new App().constructor.main(opt.argv);