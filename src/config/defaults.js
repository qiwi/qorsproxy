import ip from 'ip';

export const IP = ip.address();
export const DEFAULT_HOST = IP; // 'localhost'?

export default {
	"log": {
		"name": "qors",
		"dir": "./logs/",
		"pattern": ".yyyy-MM-dd.log",
		"size": 50 * 1024 * 1024,
		"level": "info"
	},
	"server": {
		"port": 9292,
		"host": DEFAULT_HOST,
		"ip": IP
	},
	"crumbs": {
		"xff": false,
		"xfh": true,
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
