## Qorsproxy
> cors proxy for ~~dev~~ any purposes

[![buildStatus](https://img.shields.io/travis/qiwi/qorsproxy.svg?maxAge=3600&branch=master)](https://travis-ci.org/qiwi/qorsproxy)
[![npm (tag)](https://img.shields.io/npm/v/qorsproxy/latest.svg)](https://www.npmjs.com/package/qorsproxy)
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
```bash
qorsproxy -p 8080 -c /Users/a.golub/repo/qorsproxy/config/qorsproxy.dev.qiwi.tools.json
```
or any other way:
```bash
npm start -- --config=path
pm2 start npm --name qorsproxy -- start -- --port=8080 --config=/Users/a.golub/repo/qorsproxy/config/qorsproxy.dev.qiwi.tools.json
npm run start:pm2 -- -- --port=8080
```

## Use

```bash
curl 'http://127.0.0.1:9292/http://example.com' -H 'origin:http://localhost' → <!doctype html> ...
```

## Configuration
### CLI options
- `--host`, `-h` DNS name or IP address
- `--port`, `-p` defines exposed port. Defaults to `9292`
- `--config`, `-c` sets path to the custom config
- `--watch`, `-w` if defined sets `fs.watchFile` interval for config update. 
If `port` or `host` has been changed, the server [would be restarted](src/main/js/container/index.js#L19). 
If config becomes invalid, the prev working version [remains applied](src/main/js/orchestrator.js#L59).

### JSON config
At the top level config describes `server`, `log` and proxy `rules` sections.

#### `rules` is the main one
It declares allowed connections and their side-effects like `mutations`, `interceptions`, `customAuthorization` and etc.
Qorsproxy applies [the first matched](./src/main/js/servlet/corsproxy/rules.js#L58) rule to the request, therefore declaration order matters.
`rules` may be declared as a map: 
```json
{
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
Or as array:
```json
{
  "rules": [
    {
      "from": [
        "*"
      ],
      "to": [
        "example.com"
      ]
    }
  ]
}
```



#### `log`
[Winston](https://github.com/winstonjs/winston) is under the hood and you're able to set some parameters:
```json
{
  "log": {
    "dir": "./logs/",
    "filename": "qors-%DATE%.log",
    "datePattern": "YYYY-MM-DD",
    "size": 52428800,
    "level": "info"
  }
}
```

#### `server`
Everything is simple here: `host` and `port`.
```json
{
  "server": {
    "host": "127.0.0.1",
    "port": 8080
  }
}
```

#### Pre-flight
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

#### Authorization
If intermediate authorization is required (change auth for [JWT](https://jwt.io/)) add `customAuthorization` to the target rule. See details at [schema](./src/main/js/config/schemas.js) and [impl](./src/main/js/servlet/corsproxy/middlewares/customAuthorization.js).

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
  "mutations": [
    {
      "direction": "from",
      "headers": [
        {
          "name": "transfer-encoding",
          "value": null
        }
      ]
    }
  ]
}
```

## Monitoring
There're several features to clarify what's going on with proxy.

#### `GET /health`
Exposes liveness probe.
```json
{
  "status":"UP",
  "critical":true,
  "deps":{
    "corsproxy":{
      "status":"UP",
      "critical":true
    }
  }
}
```

#### `GET /metrics`
Uptime, CPU and memory usage, request counter:
```json
{
  "process": {
    "uptime": "00:10:29",
    "memory": {"rss": 96956416, "heapTotal": 56356864, "heapUsed": 47617368, "external": 10413906},
    "cpu": {"user": 2229086, "system": 585411}
  },
  "servlets": {
    "corsproxy": {
      "count": 3,
      "traffic": 1270
    }
  }
}
```

#### `GET /info`
Common app info: version, name, etc.
```json
{
  "name": "qorsproxy",
  "version": "1.5.4",
  "description": "Cors proxy for dev purposes",
  "repository": "git@github.com:qiwi/qorsproxy.git"
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
