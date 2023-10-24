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
   * @returns {Object/null}
   */
  get (origin, host, secret) {
    // TODO Support ip
    // TODO Support masks
    // TODO Use TreeMap
    const map = [
      origin, host, secret,
      origin, host, ANY,
      ANY, host, secret,
      origin, ANY, secret,
      ANY, host, ANY,
      origin, ANY, ANY,
      ANY, ANY, secret,
      ANY, ANY, ANY,
    ]
    let rule
    let key

    for (let i = 0; i < 8 * 3; i += 3) {
      key = this.constructor.getKey(map[i], map[i + 1], map[i + 2])
      rule = this.rules.get(key)

      if (rule) {
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
