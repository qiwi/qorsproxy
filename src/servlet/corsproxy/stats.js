export default class Stats {
	constructor() {
		this.traffic = 0;
		this.count = 0;
		this.error = 0; // TODO handle
	}

	incrementTraffic(length) {
		this.traffic += length|0;
	}

	incrementCount() {
		return this.count += 1;
	}

	report() {
		return {
			count: this.count,
			traffic: this.traffic
			// TODO add average response time
		};
	}

	req(req, res, next) {
		this.incrementCount();
		next();
	}

	res(req, res, next) {
		res.piped && this.incrementTraffic(res.piped.body.length);
		next();
	}
}

function formatUptime(uptime){
	function pad(s){
		return (s < 10 ? '0' : '') + s;
	}
	const hours = Math.floor(uptime / (60 * 60));
	const minutes = Math.floor(uptime % (60 * 60) / 60);
	const seconds = Math.floor(uptime % 60);

	return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}