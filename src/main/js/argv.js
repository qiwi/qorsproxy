import mri from 'mri'

const alias = { c: 'config', h: 'host', p: 'port', w: 'watch' }
const short = new Set(Object.keys(alias))
const string = ['config', 'host', 'port', 'watch']
const unsafe = new Set(['__proto__', 'constructor', 'prototype'])

const camelCase = (key) => key.replace(/-+([^-])/g, (_, c) => c.toUpperCase())

/**
 * Parses CLI args the way the former meow setup did: long names only, camelCased keys,
 * `--secure.port=9293` → `{ secure: { port: 9293 } }`, numbers coerced except for string flags.
 * @param {string[]} argv
 * @returns {Object}
 */
export const parseArgv = (argv) => {
  // mri mutates the options it gets
  const { _, ...parsed } = mri(argv, { alias: { ...alias }, string: [...string] })
  const flags = {}

  for (const [key, value] of Object.entries(parsed)) {
    const path = key.split('.').map(camelCase)
    if (short.has(key) || path.some(k => unsafe.has(k))) continue

    const last = path.pop()
    const target = path.reduce((obj, k) => {
      if (typeof obj[k] !== 'object' || obj[k] === null) obj[k] = {}
      return obj[k]
    }, flags)
    target[last] = value
  }

  return flags
}
