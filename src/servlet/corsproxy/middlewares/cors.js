export const ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
export const ALLOW_HEADERS = 'Access-Control-Allow-Headers';
export const EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
export const ALLOW_METHODS = 'Access-Control-Allow-Methods';
export const ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials';

export default (req, res, next) => {
	// TODO customize by config
	const corsHeaders = {
		[ALLOW_ORIGIN]: req.proxy.origin || '*',
		[ALLOW_HEADERS]: 'set-cookie, Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
		[EXPOSE_HEADERS]: 'Cookie, Set-Cookie, Location',
		[ALLOW_METHODS]: 'GET, HEAD, PATCH, PUT, POST, DELETE, OPTIONS',
		[ALLOW_CREDENTIALS]: 'true'
	};

	if (res.piped) { // NOTE we need to override any cors headers from remote
		res.piped.headers = {...res.piped.headers, ...corsHeaders}
	} else {
		res.header(corsHeaders);
	}

	next();
}