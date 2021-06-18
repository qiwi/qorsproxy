import { XFH, XFF, HOST } from '../../common/header.js'

export const SEP = ' '

export default (req, res, next) => {
  const { server: { host, port, ip } } = req.proxy // eslint-disable-line
  const proxyHost = `${host}:${port}`
  const reqHeaders = req.headers
  const resHeaders = res.piped.headers

  const reqHeaderHost = reqHeaders[HOST]
  const { [XFH]: xfh, [XFF]: xff } = resHeaders // eslint-disable-line

  switch (true) {
    case !!xfh:
      break

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-Host
    case !!reqHeaderHost:
      resHeaders[XFH] = reqHeaderHost
      break

    default:
      resHeaders[XFH] = proxyHost
  }

  // TODO support Forwarded, XHF & XFP
  // resHeaders[XFF] = `${xff ? xff + SEP: ''}${ip}`;

  next()
}
