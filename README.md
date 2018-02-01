## Qorsproxy 3.0

Sometimes you need a proxy.
There're several solutions for this:
* Get one of the [thousands from google](https://www.google.ru/search?q=http+proxy+js)
* Just write your own. That's pretty easy:
```
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

####In previous series
* v1: https://www.npmjs.com/package/corsproxy-cli
* v2: https://gerrit.osmp.ru/#/admin/projects/store/pusher

####Requirements
* Unix compliant os
* NodeJS 8 (@std/esm)

#### Install

```
npm i
```

#### Start 
Any of you'd prefer:
```$
npm start -- --config=path
pm2 start npm --name qorsproxy -- start -- --port=8080 --config=/Users/a.golub/repo/qorsproxy/config/qorsproxy.dev.qiwi.tools.json
npm run start_pm2 -- -- --port=8080
```

#### Config example
```$
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


#### Usage

```$
curl 'http://127.0.0.1:9292/http://example.com' -H 'origin:http://localhost' → <!doctype html> ...
```

#### CLI options
- `--config` sets path to custom config
- `--port` defines server listen port. Defaults to `9292`
- `--host` DNS name or IP address
