import { OK, FORBIDDEN } from '../../const/status'
import { XFH } from '../../const/header'

export const EMPTY = '<empty>'
export const RECURSIVE_REQUEST = 'Proxy error: recursive request'
export const CYCLED_REQUEST = 'Proxy error: cycled request'
export const FORBIDDEN_REQUEST = 'Proxy error: request does not match any allowed route'

/**
 * ACL middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
export default (req, res, next) => {
  const xfh = req.headers[XFH]
  const { server: { host, port }, rule, from, to, user, path } = req.proxy
  const proxyHost = `${host}:${port}`

  let code
  let data

  switch (true) {
    case !path.host:
      code = OK
      data = { message: `Try like this: 'http://${host}:${port}/http://example.com'` }
      break

    // NOTE breaks cycled request chain
    case xfh === proxyHost:
      code = FORBIDDEN
      data = { message: CYCLED_REQUEST }
      break

    // NOTE prevents recursive request
    case path.hostname === host && +path.port === +port:
      code = FORBIDDEN
      data = { message: RECURSIVE_REQUEST }
      break

    case !rule:
      code = FORBIDDEN
      data = {
        message: FORBIDDEN_REQUEST,
        from: `${from || EMPTY} (origin)`,
        to: `${to}`,
        user: `${user || EMPTY} (basicAuth)`
      }
      break

    default:
      next()
      return
  }

  res
    .status(code)
    .send(data)
}
