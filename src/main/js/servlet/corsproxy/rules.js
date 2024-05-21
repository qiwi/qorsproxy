import { each } from '../../base/index.js'

export const ANY = '*'
export const SEPARATOR = '__'

export default class Rules {
  constructor (rules) {
    this.configure(rules)
  }

  configure (rules) {
    this.rules = new Map()

    let key

    each(rules, rule => {
      each([rule.from || ANY].flat(), origin => {
        each([rule.to || ANY].flat(), target => {
          each([rule.secret || rule.secrets || ANY].flat(), secret => {
            key = this.constructor.getKey(origin, target, secret)
            this.rules.set(key, rule)
          })
        })
      })
    })

    return this
  }

  /**
   *
   * @param {String} [origin]
   * @param {String} [host]
   * @param {String} [secret]
   * @param {String} [path]
   * @returns {Object/null}
   */
  get (origin, host, secret, path = '/') {
    // TODO Support ip
    // TODO Support masks
    // TODO Use TreeMap
    const map = [
      [origin, host, secret],
      [origin, host, ANY],
      [ANY, host, secret],
      [origin, ANY, secret],
      [ANY, host, ANY],
      [origin, ANY, ANY],
      [ANY, ANY, secret],
      [ANY, ANY, ANY],
    ]

    for (const [o, h, s] of map) {
      const key = this.constructor.getKey(o, h, s)
      const rule = this.rules.get(key)

      if (rule) {
        if (rule.paths?.every(p => !path.startsWith(p))) {
            continue
        }
        return rule
      }
    }

    return null
  }

  /**
   * @param [from='*']
   * @param [to='*']
   * @param [secret='*']
   * @returns {string}
   */
  static getKey (from = ANY, to = ANY, secret = ANY) {
    return from + SEPARATOR + to + SEPARATOR + secret
  }
};
