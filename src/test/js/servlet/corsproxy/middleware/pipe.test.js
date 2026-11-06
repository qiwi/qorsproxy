import { reqresnext } from '../../../reqresnext.js'
import pipe from '../../../../../main/js/servlet/corsproxy/middlewares/pipe.js'
import { transport } from '../../../../../main/js/transport/index.js'
import { ECONNREFUSED } from '../../../../../main/js/servlet/common/error.js'
import { GET } from '../../../../../main/js/servlet/common/method.js'
import { OK, REMOTE_IS_DOWN, REMOTE_UNKNOWN } from '../../../../../main/js/servlet/common/status.js'

describe('corsproxy.middleware.pipe', () => {
  const method = GET
  const statusCode = OK
  const headers = { foo: 'bar' }
  const body = Buffer.from('Baz')
  const finished = (res) => new Promise(resolve => res.on('finish', resolve))

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('transmits request to target dst', async () => {
    const { req, res } = reqresnext({ method, url: 'https://example.com' })
    vi.spyOn(transport, 'request').mockResolvedValue({ statusCode, body: [body], headers })

    await new Promise(resolve => pipe(req, res, resolve))

    expect(res.piped.statusCode).toBe(statusCode)
    expect(res.piped.headers).toBe(headers)
    expect(res.piped.body.toString()).toBe(body.toString())
  })

  it('handles ECONNREFUSED error', async () => {
    const { req, res, next } = reqresnext({ method, url: 'https://example.com' })
    vi.spyOn(transport, 'request').mockRejectedValue({ code: ECONNREFUSED })

    pipe(req, res, next)
    await finished(res)

    expect(res.statusCode).toBe(REMOTE_IS_DOWN)
  })

  it('handles unexpected error', async () => {
    const { req, res, next } = reqresnext({ method, url: 'https://example.com' })
    const error = { code: 'unknown' }
    vi.spyOn(transport, 'request').mockRejectedValue(error)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    pipe(req, res, next)
    await finished(res)

    expect(res.statusCode).toBe(REMOTE_UNKNOWN)
    expect(console.error).toHaveBeenCalledWith(error)
  })
})
