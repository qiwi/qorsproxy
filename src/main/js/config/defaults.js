import ip from 'ip'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export const IP = ip.address()
export const DEFAULT_HOST = 'localhost'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..', '..', '..')

const keyPath = join(root, 'ssl', 'key.pem')
const certPath = join(root, 'ssl', 'cert.pem')

export default {
  log: {
    dir: './logs/',
    filename: 'qors-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    size: 50 * 1024 * 1024,
    level: 'info'
  },
  server: {
    port: 9292,
    host: DEFAULT_HOST,
    secure: {
      port: 9293,
      key: keyPath,
      cert: certPath
    },
    ip: IP
  },
  crumbs: {
    xff: false,
    xfh: true
  },
  rules: {
    example: {
      from: '*',
      to: 'example.com',
      mutations: [{
        direction: 'to',
        headers: [
          {
            name: 'host',
            value: null
          }
        ]
      }],
      memo: {
        dir: './memo/stub.json',
        strategy: 'override',
        host: ['example.com']
      }
    }
  }
}
