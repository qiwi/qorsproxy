import { transport } from '../../../transport/index.js'
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
  const method = req.method.toUpperCase()
  const headers = req.headers
  const body = req.body && req.body.length ? Buffer.from(req.body.toString()) : null

  transport.request(dest, {
    method,
    headers,
    body
  })
    .then(async (response) => {
      const body = []
      for await (const data of response.body) {
        body.push(data)
      }

      res.piped = {
        statusCode: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(body)
      }

      next()
    })
    .catch((error) => {
      switch (error?.code) {
        case ECONNREFUSED:
          res.status(REMOTE_IS_DOWN).json({ message: 'Connection refused: ' + dest })
          break

        default:
          res.status(REMOTE_UNKNOWN).json({ message: 'Unreachable dest: ' + dest })
      }
    })
}
