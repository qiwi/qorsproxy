## Qorsproxy
> cors proxy for ~~dev~~ any purposes

[![buildStatus](https://img.shields.io/travis/qiwi/qorsproxy.svg?maxAge=3600&branch=master)](https://travis-ci.org/qiwi/qorsproxy)
[![dependencyStatus](https://img.shields.io/david/qiwi/qorsproxy.svg?maxAge=3600)](https://david-dm.org/qiwi/qorsproxy)
[![devDependencyStatus](https://img.shields.io/david/dev/qiwi/qorsproxy.svg?maxAge=3600)](https://david-dm.org/qiwi/qorsproxy)
[![Maintainability](https://api.codeclimate.com/v1/badges/50acfd98bab6f903d950/maintainability)](https://codeclimate.com/github/qiwi/qorsproxy/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/50acfd98bab6f903d950/test_coverage)](https://codeclimate.com/github/qiwi/qorsproxy/test_coverage)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## Install

```bash
npm i qorsproxy --save-dev
```

## Start 
Any of you'd prefer:

```bash
npm start -- --config=path
pm2 start npm --name qorsproxy -- start -- --port=8080 --config=/Users/a.golub/repo/qorsproxy/config/qorsproxy.dev.qiwi.tools.json
npm run start:pm2 -- -- --port=8080
```

## Use

```bash
curl 'http://127.0.0.1:9292/http://example.com' -H 'origin:http://localhost' → <!doctype html> ...
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

## Pre-flight
If you need support for OPTIONS request, extend target rule:

```json
"interceptions": [
  {
    "req": {
      "method": "OPTIONS"
    },
    "res": {
      "status": 200
    }
  }
],
```

## Authorization
If intermediate authorization is required (change auth for [JWT](https://jwt.io/)) add `customAuthorization` to the target rule. See details at [schema](src/config/schemas.js) and [impl](src/servlet/corsproxy/middlewares/customAuthorization.js)

```json
"customAuthorization": {
    "targetUrl": "example.com",
    "authorizationUrl": "example-authorization.com",
    "headers": ["authorization", "cookie"],
    "authPath": "Edge.Headers.Authorization[0]"
}
```

## Cypress
Cypress [has a trouble](https://github.com/cypress-io/cypress/issues/1185) with `Transfer-Encoding: chunked` header, so in this case you may use workaround:
```json
{
  "headers": [
    {
      "name": "transfer-encoding",
      "value": null
    }
  ]
}
```


## Alternatives
* Get any [from google](https://www.google.ru/search?q=http+proxy+js)
* Write your own. That's pretty easy:

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
