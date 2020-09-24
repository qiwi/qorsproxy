import { readFileSync } from 'fs'

export function getCertOptions (opts) {
  return {
    ...opts,
    key: readFileSync(opts.key),
    cert: readFileSync(opts.cert)
  }
}
