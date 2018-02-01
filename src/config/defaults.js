import ip from 'ip';

const DEFAULT_HOST = ip.address();

export default {
	"log": {
		"name": "qors",
		"dir": "./logs/",
		"pattern": ".yyyy-MM-dd.log",
		"size": 50 * 1024 * 1024,
		"level": "info"
	},
	"server": {
		"host": DEFAULT_HOST,
		"port": 9292
	},
	"rules": {
		"example": {
			"from": "*",
			"to": "example.com",
			"mutations": [{
				"direction": "to",
				"headers": [
					{
						"name": "host",
						"value": null
					}
				]
			}]
		}
	}
};
