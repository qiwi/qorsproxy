import log, { INFO, WARN, ERROR } from '../../../log'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from '../../common/status'
import url from '../url'

// TODO Support configurations
export default (req, res, next) => {
  const start = log.constructor.now()

  const _write = res.write
  const _end = res.end
  const _send = res.send
  const chunks = []
  let sent

  const { id, from, to, user, path } = req.proxy // eslint-disable-line
  const target = url.format(path)

  log.info(`REQ ${id} > method=${req.method} origin=${from} ip=${req.ip} dest=${target} user=${user} headers=${JSON.stringify(req.headers)}`)

  res.send = (...args) => {
    res.send = _send
    sent = args
    _send.apply(res, args)
  }

  res.write = (...args) => {
    chunks.push(Buffer.from(args[0]))
    _write.apply(res, args)
  }

  res.end = (...args) => {
    const chunk = args[0]

    if (chunk) {
      chunks.push(Buffer.from(chunk))
    }
    res.end = _end
    res.write = _write
    _end.apply(res, args)
  }

  // NOTE we can not get entire headers list on send
  res.on('finish', () => {
    const status = res.statusCode
    const level = getLogLevelByStatus(status)
    const contentLength = (sent ? Buffer.from('' + sent[0]) : Buffer.concat(chunks)).length

    sent = null
    chunks.lenght = 0

    log[level](`RES ${res.id} < status=${status} duration=${log.constructor.now() - start}ms headers=${JSON.stringify(res.header()._headers)} bufferLength=${contentLength}`)
  })

  next()
}

export function getLogLevelByStatus (status) {
  return status < BAD_REQUEST
    ? INFO
    : status >= INTERNAL_SERVER_ERROR
      ? ERROR
      : WARN
}
