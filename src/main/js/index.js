#!/usr/bin/env node

require = require('esm')(module, {
  mode: 'all',
  cjs: true
})

const meow = require('meow')
const app = require('./app').default
const cli = meow(`
  Usage
    $ qorsproxy --config=/Users/foo/projects/bar/proxy.config.json

  Options
    --config, -c  Override the default config
    --host, -h    DNS name or IP address
    --port, -p    Defines exposed port
    --watch, -w   If defined sets 'fs.watchFile' interval for the config update

  Examples
    $ qorsproxy --host=localhost --port=8080
    $ qorsproxy --config=/Users/foo/projects/bar/proxy.config.json -w=1000
    $ qorsproxy --version
    $ qorsproxy --help
`, {
  flags: {
    config: {
      type: 'string',
      alias: 'c'
    },
    watch: {
      type: 'string',
      alias: 'w'
    },
    host: {
      type: 'string',
      alias: 'h'
    },
    port: {
      type: 'string',
      alias: 'p'
    }
  }
})

app.main(cli.flags)
