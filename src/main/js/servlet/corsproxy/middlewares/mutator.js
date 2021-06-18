import { each, isObject, isNull, isArray } from './../../../base/index.js'
import { normalizeHeader } from '../../common/header.js'

export const FROM = 'from'
export const TO = 'to'

function from (req, res, next) {
  const headers = res.piped.headers
  const rule = req.proxy.rule
  const mutations = (rule.mutations || []).filter(m => m.direction === FROM)

  mutate(headers, mutations)

  next()
}

function to (req, res, next) {
  const headers = req.headers
  const rule = req.proxy.rule
  const mutations = (rule.mutations || []).filter(m => m.direction === TO)

  mutate(headers, mutations)

  next()
}

export {
  from,
  to
}

function mutate (headers, mutations) {
  each(mutations, m => {
    each(m.headers, ({ name, value }) => {
      const lowerName = name.toLowerCase()
      const normalName = normalizeHeader(name)
      const prev = headers[normalName] || headers[lowerName] || headers[name]
      const modify = str => str.replace(parsePattern(value.from), value.to)

      if (value === null) {
        delete headers[name]
        delete headers[normalName]
        delete headers[lowerName]
        return
      }

      if (!isObject(value)) {
        headers[name] = headers[normalName] = headers[lowerName] = '' + value
        return
      }

      if (prev) {
        headers[name] = headers[normalName] = headers[lowerName] = isArray(prev)
          ? prev.map(modify)
          : modify(prev)
      }
    })
  })
}

export function parsePattern (value) {
  const ARGS_PATTERN = /\/(.+)\/(.*)/
  const args = ('' + value).match(ARGS_PATTERN)

  if (isNull(args)) {
    return value
  }
  try {
    return new RegExp(args[1], args[2])
  } catch (e) {
    return value
  }
}
