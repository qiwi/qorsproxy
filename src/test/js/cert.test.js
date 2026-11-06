import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { getCertOptions } from '../../main/js/cert.js'

describe('getCertOptions', () => {
  it('reads the key and the cert, keeps other opts', () => {
    const key = fileURLToPath(new URL('../../../ssl/key.pem', import.meta.url))
    const cert = fileURLToPath(new URL('../../../ssl/cert.pem', import.meta.url))

    expect(getCertOptions({ port: 9293, key, cert })).toEqual({
      port: 9293,
      key: readFileSync(key),
      cert: readFileSync(cert)
    })
  })
})
