## Qorsproxy

[![buildStatus](https://img.shields.io/travis/qiwi/qorsproxy.svg?maxAge=3600&branch=master)](https://travis-ci.org/qiwi/qorsproxy)
[![Coveralls](https://img.shields.io/coveralls/qiwi/qorsproxy.svg?maxAge=3600)](https://coveralls.io/github/qiwi/qorsproxy)
[![dependencyStatus](https://img.shields.io/david/qiwi/qorsproxy.svg?maxAge=3600)](https://david-dm.org/qiwi/qorsproxy)
[![devDependencyStatus](https://img.shields.io/david/dev/qiwi/qorsproxy.svg?maxAge=3600)](https://david-dm.org/qiwi/qorsproxy)
[![Code Climate](https://codeclimate.com/github/codeclimate/codeclimate/badges/gpa.svg)](https://codeclimate.com/github/qiwi/qorsproxy) [![Greenkeeper badge](https://badges.greenkeeper.io/qiwi/qorsproxy.svg)](https://greenkeeper.io/)

Sometimes you need a proxy.
There're several solutions:
* Get any from [from google](https://www.google.ru/search?q=http+proxy+js)
* Just write your own. That's pretty easy:

```javascript
const http = require('http');
http.createServer(handler).listen(3000);

function handler(req, res) {
	console.log('serve: ' + req.url);

	const options = {
		hostname: 'example.com',
		port: 80,
		path: req.url,
		method: req.method
	};

	const proxy = http.request(options, _res => {
		_res.pipe(res, {
			end: true
		});
	});

	req.pipe(proxy, {
		end: true
	});
}
```

* Try out any weird thing just for fun.

#### Requirements
* Unix compliant OS
* NodeJS 8+ (@std/esm)

## Install

```bash
npm i qorsproxy --save-dev
```

## Start 
Any of you'd prefer:

```bash
npm start -- --config=path
pm2 start npm --name qorsproxy -- start -- --port=8080 --config=/Users/a.golub/repo/qorsproxy/config/qorsproxy.dev.qiwi.tools.json
npm run start_pm2 -- -- --port=8080
```

#### CLI options
- `--config` sets path to custom config
- `--port` defines server listen port. Defaults to `9292`
- `--host` DNS name or IP address

## Configuration

```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8080
  },
  "rules": {
    "localhost": {
      "from": [
        "*"
      ],
      "to": [
        "example.com"
      ],
      "mutations": [
        {
          "direction": "to",
          "headers": [
            {
              "name": "origin",
              "value": "localhost"
            }
          ]
        },
        {
          "direction": "from",
          "headers": [
            {
              "name": "set-cookie",
              "value": {
                "from": "/;Domain.+;/",
                "to": ";Domain: foobar.com;"
              }
            }
          ]
        }
      ]
    }
  }
}
```

## Usage

```bash
curl 'http://127.0.0.1:9292/http://example.com' -H 'origin:http://localhost' → <!doctype html> ...
```
