import codes from './codes';

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

	reporter(req, res) {
		res
			.status(codes.OK)
			.json({
				count: this.count,
				traffic: this.traffic,
				uptime: process.uptime(),
				memory: process.memoryUsage(),
				cpu: process.cpuUsage()
			});
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