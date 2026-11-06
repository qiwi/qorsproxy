import { reqresnext } from '../../../reqresnext.js'
import gatekeeper, {
  RECURSIVE_REQUEST,
  FORBIDDEN_REQUEST,
  CYCLED_REQUEST
} from '../../../../../main/js/servlet/corsproxy/middlewares/gatekeeper.js'
import { OK, FORBIDDEN } from '../../../../../main/js/servlet/common/status.js'
import { XFH } from '../../../../../main/js/servlet/common/header.js'

describe('corsproxy.middleware.gatekeeper', () => {
  const host = '127.0.0.1'
  const port = 8080
  const rule = {}
  const id = 1
  const user = null
  const from = 'http://localhost:8080'
  const to = 'http://example.com'

  it('asserts destination host existence', () => {
    const path = { host: null }
    const { req, res, next } = reqresnext({ proxy: { server: { host, port }, rule, id, from, to, user, path } }, {})

    gatekeeper(req, res, next)
    expect(res.statusCode).toBe(OK)
  })

  it('prevents recursive request', () => {
    const path = { hostname: host, host, port }
    const { req, res, next } = reqresnext({ proxy: { server: { host, port }, rule, id, from, to, user, path } }, {})

    gatekeeper(req, res, next)
    expect(res.statusCode).toBe(FORBIDDEN)
    expect(res.body).toBe(JSON.stringify({ message: RECURSIVE_REQUEST }))
  })

  it('breaks cycled request (XFH)', () => {
    const path = { hostname: host, host, port }
    const proxyHost = `${host}:${port}`
    const headers = { [XFH]: proxyHost }
    const { req, res, next } = reqresnext({ headers, proxy: { server: { host, port }, path } }, {})

    gatekeeper(req, res, next)
    expect(res.statusCode).toBe(FORBIDDEN)
    expect(res.body).toBe(JSON.stringify({ message: CYCLED_REQUEST }))
  })

  it('checks route/rule existence', () => {
    const path = { hostname: 'qiwi.com', host: 'qiwi.com', port: 80 }
    const { req, res, next } = reqresnext({ proxy: { server: { host, port }, path } }, {})

    gatekeeper(req, res, next)
    expect(res.statusCode).toBe(FORBIDDEN)
    expect(res.body).toContain(FORBIDDEN_REQUEST)
  })

  it('proceeds to next otherwise', () => {
    const rule = true
    const path = { hostname: 'example.com', host: 'example.com', port: 80 }
    const next = vi.fn()
    const { req, res } = reqresnext({ proxy: { rule, server: { host, port }, path } }, {})

    gatekeeper(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(res.body).toBeUndefined()
  })
})
