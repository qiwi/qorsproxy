import crypto from 'crypto'
import basicAuth from 'basic-auth'
import url from '../url'

export default (req, res, next) => {
  const path = url.parseRequest(req)
  const auth = basicAuth(req) || {}
  const user = auth.name
  const password = auth.pass
  const secret = user && crypto.createHash('md5').update(user + ':' + password).digest('hex')
  const host = path.host
  let origin = req.get('origin')
  origin = (origin && url.parse(origin).hostname) || origin

  req.to = host
  req.from = origin
  req.secret = secret

  next()
}
