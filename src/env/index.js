export default {
	process,
	package: {
		name: process.env.npm_package_name,
		version: process.env.npm_package_version,
		description: process.env.npm_package_description,
		repository: process.env.npm_package_repository_url
	}
};