import reqresnext from 'reqresnext'
import memo from '../../../../../main/js/servlet/corsproxy/middlewares/memo.js'
import path, { dirname } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const stub = path.resolve(__dirname, './stub.json')
const sandbox = sinon.createSandbox()

describe('corsproxy.middleware.memo', () => {
  describe('', () => {
    before(() => {
      fs.writeFileSync(stub, JSON.stringify({}), 'utf8')
    })
    after(() => {
      sandbox.restore()

      fs.writeFileSync(stub, JSON.stringify({}), 'utf8')
    })

    it('collects response data to stub.json', () => {
      const { req, res, next } = reqresnext.default({
        method: 'GET',
        proxy: {
          id: '123',
          path: {
            protocol: 'http',
            host: 'example.com',
            href: 'https://example.com/'
          },
          to: 'example.com',
          rule: {
            memo: {
              strategy: 'override',
              dir: stub,
              host: ['example.com']
            }
          }
        },
        headers: {
          'x-forwarded-for': '192.168.1.10'
        }
      }, {
        piped: {
          statusCode: 200,
          body: Buffer.from(JSON.stringify({ foo: 'bar' })),
          headers: { 'content-type': 'application/json; charset=utf-8', 'content-length': '13' }
        }
      })
      memo(req, res, next)

      const key = 'GET::https://example.com/::'
      const value = { statusCode: 200, body: '{"foo":"bar"}', headers: { 'content-type': 'application/json; charset=utf-8', 'content-length': '13' } }
      const json = JSON.parse(fs.readFileSync(stub, 'utf8'))

      expect(json[key].value).to.deep.equal(value)
    })

    it('replaces errored (>=500) responses with sucessed (<=500) stubs', () => {
      const { req, res, next } = reqresnext.default({
        method: 'GET',
        proxy: {
          id: '123',
          path: {
            protocol: 'http',
            host: 'example.com',
            href: 'https://example.com/'
          },
          to: 'example.com',
          rule: {
            memo: {
              strategy: 'override',
              dir: stub,
              host: ['example.com']
            }
          }
        },
        headers: {
          'x-forwarded-for': '192.168.1.10'
        }
      }, {
        piped: {
          statusCode: 500,
          body: Buffer.from(JSON.stringify({ message: 'internal error' })),
          headers: { 'content-type': 'application/json; charset=utf-8', 'content-length': '37' }
        }
      })
      const key = 'GET::https://example.com/::'
      const value = { statusCode: 200, body: '{"foo":"bar"}', headers: { 'content-type': 'application/json; charset=utf-8', 'content-length': '13' } }
      const json = { [key]: { value, exp: Date.now() * 2 } }

      fs.writeFileSync(stub, JSON.stringify(json), 'utf8')
      memo(req, res, next)

      expect(JSON.parse(res.piped.body.toString('utf8'))).to.deep.equal({ foo: 'bar' })
    })
  })
})
