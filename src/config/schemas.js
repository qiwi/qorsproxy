export const IP = {
	pattern: "^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\:[0-9]+)?$",
	type: 'string'
};
export const DOMAIN = {
	pattern: "^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])(\:[0-9]+)?$",
	type: 'string'
};
export const HOST = {anyOf: [IP, DOMAIN]};
export const HOST_ARRAY = {type: 'array', items: HOST};
export const STRING_NON_EMPTY = {type: 'string', minLength: 1};
export const INTEGER = {type: 'integer'};

export const SCHEMA = {
	type: 'object',
	properties: {
		log: {
			type: 'object',
			properties: {
				dir: STRING_NON_EMPTY,
				name: STRING_NON_EMPTY,
				pattern: STRING_NON_EMPTY,
				size: INTEGER,
				level: STRING_NON_EMPTY
			}
		},
		alias: HOST_ARRAY,
		port: INTEGER,
		host: HOST,
		rules: {
			type: 'object',
			patternProperties: {
				'.+': {
					type: 'object',
					properties: {
						origins: HOST_ARRAY,
						targets: HOST_ARRAY
					}
				}
			}
		}
	}
};