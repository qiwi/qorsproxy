import { reqresnext } from '../../reqresnext.js'
import Info from '../../../../main/js/servlet/info/index.js'
import env from '../../../../main/js/env/index.js'

describe('info', () => {
  it('sends the package info', () => {
    const { req, res } = reqresnext()
    vi.spyOn(res, 'writeHead')

    new Info().handler(req, res)

    expect(res.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' })
    expect(JSON.parse(res.body)).toEqual(JSON.parse(JSON.stringify(env.package)))
  })
})
