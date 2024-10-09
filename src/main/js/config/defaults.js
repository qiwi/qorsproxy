import { networkInterfaces } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const IP = Object.values(networkInterfaces()).flat().find(v => v.family === 'IPv4' && !v.internal)?.address || '127.0.0.1'
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
      to: '*',
      mutations: [{
        direction: 'to',
        headers: [
          {
            name: 'host',
            value: null
          }
        ]
      }]
    }
  }
}
