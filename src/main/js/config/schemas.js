export const IP = {
  pattern: '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\\:[0-9]+)?$',
  type: 'string'
}
export const DOMAIN = {
  pattern: '^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\\-]*[a-zA-Z0-9])\\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\\-]*[A-Za-z0-9])(\\:[0-9]+)?$',
  type: 'string'
}
export const HOST = { anyOf: [IP, DOMAIN] }
export const HOST_ARRAY = { type: 'array', items: HOST }
export const STRING_NON_EMPTY = { type: 'string', minLength: 1 }
export const INTEGER = { type: 'integer' }

const URL = { type: 'string', pattern: '^https?://.+' }
const STRING_ARRAY = { type: 'array', items: STRING_NON_EMPTY }
const STRING_OR_STRING_ARRAY = { oneOf: [STRING_ARRAY, STRING_NON_EMPTY] }
const CUSTOM_AUTHORIZATION = {
  type: 'object',
  properties: {
    targetUrl: URL,
    authorizationUrl: URL,
    headers: STRING_ARRAY,
    authPath: STRING_NON_EMPTY
  },
  required: ['targetUrl', 'authorizationUrl', 'headers', 'authPath']
}

const MEMO = {
  type: 'object',
  properties: {
    dir: STRING_NON_EMPTY,
    host: HOST_ARRAY,
    strategy: {
      type: 'string',
      pattern: '^(override|uphold)$'
    }
  }
}

const INTERCEPTION = {
  type: 'object',
  properties: {
    req: {
      type: 'object'
    },
    res: {
      type: 'object',
      properties: {
        body: { type: 'string' },
        status: { type: 'number' },
        headers: { type: 'object' }
      }
    }
  },
  required: ['req', 'res']
}

const RULE = {
  type: 'object',
  properties: {
    customAuthorization: CUSTOM_AUTHORIZATION,
    memo: MEMO,
    from: STRING_OR_STRING_ARRAY,
    to: STRING_OR_STRING_ARRAY,
    interceptions: { type: 'array', items: INTERCEPTION }
  }
}

// TODO refactor
export const SCHEMA = {
  type: 'object',
  properties: {
    log: {
      type: 'object',
      properties: {
        dir: STRING_NON_EMPTY,
        name: STRING_NON_EMPTY,
        pattern: STRING_NON_EMPTY,
        size: INTEGER,
        level: STRING_NON_EMPTY
      }
    },
    server: {
      type: 'object',
      port: INTEGER,
      host: HOST
    },
    rules: {
      oneOf: [
        {
          type: 'object',
          patternProperties: {
            '.+': RULE
          }
        },
        {
          type: 'array',
          items: RULE
        }
      ]
    }
  }
}
