import { get } from '../../../base/index.js'
import factory from '@qiwi/primitive-storage'

const storages = {}
const storageFactory = (dir) => {
  if (!storages[dir]) {
    storages[dir] = factory({
      defaultTtl: 60000000,
      path: dir
    })
  }

  return storages[dir]
}

export default (req, res, next) => {
  const memo = get(req, 'proxy.rule.memo')

  if (!memo) {
    next()
    return
  }

  const { dir, host } = memo
  const { proxy: { to, path: { href } }, body = '' } = req
  const key = `${req.method}::${href}::${body.toString('utf-8')}`
  const storage = storageFactory(dir)
  const { statusCode, headers, body: content } = res.piped

  if (!host.includes(to)) {
    next()
    return
  }

  const _entry = storage.get(key)

  if (statusCode >= 500 && _entry.statusCode <= 500) {
    res.piped = {
      statusCode: _entry.statusCode,
      headers: _entry.headers,
      body: Buffer.from(_entry.body)
    }
  } else {
    const entry = {
      statusCode: statusCode,
      body: content.toString('utf8'),
      headers
    }
    storage.set(key, entry)
  }

  next()
}
