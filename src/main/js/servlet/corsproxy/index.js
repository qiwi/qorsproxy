import express from 'express'
import crypto from 'node:crypto'

import parse from './parse.js'
import Stats from './stats.js'
import Rules from './rules.js'
import {
  pipe,
  cors,
  error,
  gatekeeper,
  from,
  to,
  end,
  intercept,
  logger,
  crumbs,
  customAuthorization,
  memo
} from './middlewares/index.js'

export default class Server {
  constructor () {
    this.online = false
    this.rules = new Rules()
    this.stats = new Stats()
    this.handler = express()

    // TODO autobind
    const statsReq = this.stats.req.bind(this.stats)
    const statsRes = this.stats.res.bind(this.stats)
    const contextify = this.contextify.bind(this)

    this.handler
      .use(statsReq)
      .use(contextify)
      .use(logger)
      .use(cors)
      .use(gatekeeper)
      .use(intercept)
      .use(to)
      .use(customAuthorization)
      .use(pipe)
      .use(from)
      .use(cors) // NOTE Handles res.piped.headers
      .use(statsRes)
      .use(crumbs)
      .use(memo)
      .use(end)
      .use(error)
      .disable('x-powered-by')
  }

  contextify (req, res, next) {
    const { from, to, secret, user, path, origin } = this.constructor.parse(req)
    const { host, port, securePort } = this
    const id = crypto.randomBytes(8).toString('hex')
    const rule = this.rules.get(from, to, secret, path)

    req.id = res.id = id

    req.proxy = {
      id,
      rule,
      from,
      to,
      user,
      secret,
      path,
      server: { host, port, securePort },
      origin
    }

    next()
  }

  /**
   *
   * @param {String} host
   * @param {Number} port
   * @param {Number} securePort
   * @param {Object} rules
   */
  configure ({ host, port, securePort, rules } = {}) {
    this.port = port
    this.securePort = securePort
    this.host = host
    this.rules.configure(rules)

    return this
  }

  health () {
    return {
      status: 'UP',
      critical: true
    }
  }

  metrics () {
    return this.stats.report()
  }

  static parse (req) {
    return parse(req)
  }
}
