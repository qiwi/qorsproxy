export function genReq(opts) {
	return {
		...opts,
		header() {},
		set() {}
	};
}

export function genRes(opts) {
	return {
		...opts,
		write() {},
		writeHead() {},
		send() {},
		end() {},

		header() {},
		json() {}
	};
}

export function gen(reqOpts, resOpts) {
	return {
		req: genReq(reqOpts),
		res: genRes(resOpts),
	};
}