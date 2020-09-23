import { readFileSync } from 'fs'

export function getCertOptions (keyPath, certPath) {
  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath)
  }
}
