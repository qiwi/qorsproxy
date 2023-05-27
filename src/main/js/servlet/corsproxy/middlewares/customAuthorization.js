import { transport } from '../../../transport/index.js'
import { get, pick } from '../../../base/index.js'

const normalizeUrl = url => url.replace(/^\//, '')

const checkUrl = (url, targetUrl) => normalizeUrl(url).indexOf(targetUrl) === 0

const extractAuthorization = (body, path) => {
  try {
    const json = JSON.parse(body.toString())
    return get(json, path)
  } catch (error) {
    return false
  }
}

const processRequest = (req, res, next, config) => {
  const options = {
    headers: pick(req.headers, config.headers),
    method: 'GET'
  }
  transport.request(config.authorizationUrl, options)
    .then(async result => {
      const body = []
      for await (const data of result.body) {
        body.push(data)
      }

      const authorization = extractAuthorization(body, config.authPath)
      if (authorization) {
        req.headers.Authorization = req.headers.authorization = authorization
        next()
      } else {
        res.status(403).send('auth failed')
      }
    })
    .catch((err) => next(err))
}

const customAuthorization = (req, res, next) => {
  const config = get(req, 'proxy.rule.customAuthorization')
  if (config && checkUrl(req.url, config.targetUrl)) {
    return processRequest(req, res, next, config)
  }
  return next()
}

export default customAuthorization
