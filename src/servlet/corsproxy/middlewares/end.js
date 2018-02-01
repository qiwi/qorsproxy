export default (req, res) => {
	const {body, headers, statusCode} = res.piped;

	res.header(headers);
	res.status(statusCode);
	res.send(body);
}