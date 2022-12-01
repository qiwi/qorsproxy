import request from 'request'
import { ECONNREFUSED } from '../../common/error.js'
import { REMOTE_UNKNOWN, REMOTE_IS_DOWN } from '../../common/status.js'
import url from '../url.js'

/**
 * Pipe middleware
 * @param {Object} req
 * @param {Object} res
 * @param {Function} [next]
 */
export default (req, res, next) => {
  const dest = url.format(url.parseRequest(req))
  const method = req.method.toLowerCase()
  const headers = req.headers
  const body = req.body && req.body.length ? Buffer.from(req.body.toString()) : null

  request[method]({
    url: dest,
    headers,
    encoding: null,
    body
  }, (error, response, body) => {
    if (error) {
      switch (error.code) {
        case ECONNREFUSED:
          res.status(REMOTE_IS_DOWN).json({ message: 'Connection refused: ' + dest })
          break

        default:
          res.status(REMOTE_UNKNOWN).json({ message: 'Unreachable dest: ' + dest })
      }
      return
    }

    res.piped = {
      statusCode: response.statusCode,
      headers: response.headers,
      body // Buffer
    }
    next()
  })
}
