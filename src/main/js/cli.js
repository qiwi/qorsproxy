#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { parseArgv } from './argv.js'
import { App } from './app.js'

const help = `
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
`

const flags = parseArgv(process.argv.slice(2))

if (flags.help || flags.version) {
  const { description, version } = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'))
  console.log(flags.help ? `\n  ${description}\n${help}` : version)
  process.exit(0)
}

App.main(flags)
