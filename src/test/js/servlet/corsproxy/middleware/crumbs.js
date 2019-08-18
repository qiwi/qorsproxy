import reqresnext from 'reqresnext'
import crumbs from '../../../../../main/js/servlet/corsproxy/middlewares/crumbs'
import { XFH, HOST } from '../../../../../main/js/servlet/common/header'

const host = '127.0.0.1'
const port = 8080

describe('corsproxy.middleware.crumbs', () => {
  it('transfers XFH from response', () => {
    const headers = { foo: 'bar', [XFH]: 'qiwi.com' }
    const { req, res, next } = reqresnext({ proxy: { server: { host, port } } }, { piped: { headers } })

    crumbs(req, res, next)
    expect(headers).to.include({ foo: 'bar', [XFH]: 'qiwi.com' })
  })

  it('sets XFH to request HOST header if exists', () => {
    const headers = { foo: 'bar' }
    const { req, res, next } = reqresnext({ headers: { [HOST]: 'example.com' }, proxy: { server: { host, port } } }, { piped: { headers } })

    crumbs(req, res, next)
    expect(headers[XFH]).to.equal('example.com')
  })

  it('sets XFH to proxy host otherwise', () => {
    const headers = { foo: 'bar' }
    const { req, res, next } = reqresnext({ proxy: { server: { host, port } } }, { piped: { headers } })

    crumbs(req, res, next)
    expect(headers[XFH]).to.equal('127.0.0.1:8080')
  })
})
