import { Server } from 'http'
import { Server as SecureServer } from 'https'

export function applyServerMixin (Class) {
  return class extends Class {
    close () {
      return new Promise((resolve, reject) => {
        super.close(function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
    }

    listen (host, port) {
      return new Promise((resolve, reject) => {
        try {
          super.listen(host, port, resolve)
        } catch (e) {
          reject(e)
        }
      })
    }
  }
}

export class ServerHelper {
  static notFound (req, res) {
    this.sendError(res, 404, 'Not Found')
  }

  static internalError (req, res) {
    this.sendError(res, 500, 'Internal Server Error')
  }

  static sendError (res, status, message) {
    res.writeHead(status, { 'Content-Type': 'text/plain' })
    res.write(message)
    res.end()
  }
}

export const HttpServer = applyServerMixin(Server)

export const HttpsServer = applyServerMixin(SecureServer)
