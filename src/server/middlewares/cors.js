
export default (req, res, next) => {
	const corsHeaders = {
		'Access-Control-Allow-Origin': req.get('origin') || '*',
		'Access-Control-Expose-Headers': 'Cookie, Set-Cookie, Location',
		'Access-Control-Allow-Methods': 'GET, HEAD, PATCH, PUT, POST, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'set-cookie, Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
		'Access-Control-Allow-Credentials': 'true'
	};
	
	res.piped.headers = {...res.piped.headers, ...corsHeaders};

	next();
}