export const HOST = 'Host'.toLowerCase()

export const X_FORWARDED_FOR = 'X-Forwarded-For'.toLowerCase()
export const XFF = X_FORWARDED_FOR

export const X_FORWARDED_HOST = 'X-Forwarded-Host'.toLowerCase()
export const XFH = X_FORWARDED_HOST

export default {
  HOST,
  X_FORWARDED_FOR,
  XFF,
  X_FORWARDED_HOST,
  XFH
}

// Based on https://github.com/marten-de-vries/header-case-normalizer
export const normalizeHeader = (header) => {
  const headerInLower = header.toLowerCase()
  const exceptions = {
    'content-md5': 'Content-MD5',
    'dnt': 'DNT',   // eslint-disable-line
    'etag': 'ETag', // eslint-disable-line
    'last-event-id': 'Last-Event-ID',
    'tcn': 'TCN',   // eslint-disable-line
    'te': 'TE',     // eslint-disable-line
    'www-authenticate': 'WWW-Authenticate',
    'x-dnsprefetch-control': 'X-DNSPrefetch-Control'
  }

  return exceptions[headerInLower] || headerInLower
    .split('-')
    .map(text => text.charAt(0).toUpperCase() + text.slice(1))
    .join('-')
}
