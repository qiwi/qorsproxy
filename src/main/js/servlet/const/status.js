export const OK = 200
export const NO_CONTENT = 204
export const BAD_REQUEST = 400
export const AUTH = 401
export const FORBIDDEN = 403
export const NOT_FOUND = 404
export const INTERNAL_ERROR = 500
export const SERVICE_UNAVAILABLE = 503

// NOTE Cloudflare's reverse proxy codes
export const REMOTE_UNKNOWN = 520
export const REMOTE_IS_DOWN = 521

export default {
  OK,
  NO_CONTENT,
  BAD_REQUEST,
  AUTH,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_ERROR,
  SERVICE_UNAVAILABLE,

  REMOTE_IS_DOWN,
  REMOTE_UNKNOWN
}
