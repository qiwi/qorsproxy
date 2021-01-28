import { find } from '../base'
import log from '../log'
import { HttpServer, HttpsServer, ServerHelper } from './server'

export class Container {
  constructor () {
    this.online = false
    this.server = new HttpServer()
    this.server.on('request', this.collector.bind(this))
    this.initSecureServer()
  }

  shouldRestart ({ host, port, secure }) {
    return this.online && (
      this.port !== port ||
      this.host !== host ||
      this.secure.port !== secure.port ||
      this.secure.cert !== secure.cert ||
      this.secure.key !== secure.key
    )
  }

  async configure ({ host, port, secure, servlets }) {
    if (servlets) {
      this.servlets = servlets
    }

    port = port | 0

    const restart = this.shouldRestart({ host, port, secure })

    this.secure = secure
    this.port = port
    this.host = host
    restart &&
    await this.restart()

    log.info('Container configured.')

    return this
  }

  collector (req, res) {
    const body = []

    req
      .on('data', chunk => {
        chunk && body.push(chunk)
      })
      .on('end', () => {
        if (body.length) {
          req.body = Buffer.concat(body)
        }
        this.handler(req, res)
      })
  }

  handler (req, res) {
    const url = req.url
    let route

    if (!this.online) {
      res.end()
      return
    }

    const servlet = find(this.servlets, (servlet, r) => {
      route = r // TODO add servlet name prop
      return !url.indexOf(r)
    })

    if (!servlet) {
      log.error(`Servlet not found. url=${url}`)
      ServerHelper.notFound(req, res)
      return
    }
    try {
      servlet.handler(req, res)
    } catch (e) {
      log.error(`Servlet unhandled exception. route=${route} url=${url}`, e)
      ServerHelper.internalError(req, res)
    }
  }

  initSecureServer () {
    this.httpsServer = new HttpsServer(this.secure)
    this.httpsServer.on('request', this.collector.bind(this))
  }

  async start () {
    if (!this.online) {
      this.initSecureServer()
      await Promise.all([
        this.server.listen(this.port, this.host),
        this.httpsServer.listen(this.secure.port, this.host)
      ])
      log.info(`Container is online: http://${this.host}:${this.port}, https://${this.host}:${this.secure.port}`)
      this.online = true
    }

    return this
  }

  async stop () {
    if (this.online) {
      // NOTE Stops the server from accepting new connections and keeps existing connections.
      // This function is asynchronous, the server is finally closed when all connections are ended and the server emits a 'close' event.
      this.online = false
      await Promise.all([
        this.server.close(),
        this.httpsServer.close()
      ])
      log.warn('Container stopped.')
    }

    return this
  }

  async restart () {
    log.warn('Container restart required.')
    await this.stop()
    await this.start()

    return this
  }
}

export default Container
