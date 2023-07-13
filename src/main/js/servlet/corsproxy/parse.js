import basicAuth from 'basic-auth'
import crypto from 'node:crypto'
import url from './url.js'

export default (req) => {
  const path = url.parseRequest(req)
  const auth = basicAuth(req) || {}
  const user = auth.name
  const password = auth.pass
  const secret = user && crypto.createHash('md5').update(user + ':' + password).digest('hex')
  const host = path.host
  const origin = req.get('origin')
  const from = (origin && url.parse(origin).hostname) || origin

  return {
    path,
    to: host,
    from, // TODO req.ip as fallback?
    user,
    secret,
    origin
  }
}
