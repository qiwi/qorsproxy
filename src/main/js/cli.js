#!/usr/bin/env node

import meow from 'meow'
import { App } from './app.js'

const cli = meow(`
  Usage
    $ qorsproxy --config=/Users/foo/projects/bar/proxy.config.json

  Options
    --config,      -c   Override the default config
    --host,        -h   DNS name or IP address
    --port,        -p   Defines exposed port
    --secure.port,      Defines exposed secure port
    --secure.cert,      Path to SSL certificate
    --secure.key,       Path to SSL private key
    --watch,       -w   If defined sets 'fs.watchFile' interval for the config update

  Examples
    $ qorsproxy --host=localhost --port=8080
    $ qorsproxy --config=/Users/foo/projects/bar/proxy.config.json -w=1000
    $ qorsproxy --version
    $ qorsproxy --help
`, {
  importMeta: import.meta,
  flags: {
    config: {
      type: 'string',
      shortFlag: 'c'
    },
    watch: {
      type: 'string',
      shortFlag: 'w'
    },
    host: {
      type: 'string',
      shortFlag: 'h'
    },
    port: {
      type: 'string',
      shortFlag: 'p'
    },
    secure: {
      type: 'string',
      multiple: true
    }
  }
})

App.main(cli.flags)
