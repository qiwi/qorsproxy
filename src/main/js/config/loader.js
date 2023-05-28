import fs from 'fs'

import { isError } from '../base/index.js'
import emitter from '../emitter/index.js'
import Error from '../common/error.js'

export const EVT_PREFIX = 'config_loader_'
export const LOAD = 'load'
export const LOAD_ERROR = 'error'

export default class ConfigLoader {
  constructor (path, watch) {
    this.id = Math.random()
    this.watch = (watch | 0) * 1000
    this.path = path

    if (this.watch > 0) {
      fs.watchFile(this.path, { persistent: true, interval: this.watch }, (curr, prev) => {
        if (curr.mtimeMs !== prev.mtimeMs) {
          this.load()
        }
      })
    }
  }

  on (event, cb) {
    emitter.on(EVT_PREFIX + event + this.id, cb)

    return this
  }

  /**
   * @returns {Object/Error}
   */
  load () {
    const constructor = this.constructor
    let data = this.constructor.read(this.path)

    if (isError(data)) {
      this.emitError(data)
      return this
    }

    data = constructor.parse(data)
    if (isError(data)) {
      this.emitError(data)
      return this
    }

    this.emitLoad(data)
    return this
  }

  /**
   * @returns {string/Error}
   */
  static read (path) {
    try {
      return fs.readFileSync(path, { encoding: 'utf8' })
    } catch (e) {
      return new Error(`config_loader: read error path=${path}`, e)
    }
  }

  /**
   *
   * @param data
   * @returns {any/Error}
   */
  static parse (data) {
    try {
      return JSON.parse(data)
    } catch (e) {
      return new Error('config_loader: parse error', e)
    }
  }

  emitError (error) {
    emitter.emit(EVT_PREFIX + LOAD_ERROR + this.id, error)
  }

  emitLoad (data) {
    emitter.emit(EVT_PREFIX + LOAD + this.id, data)
  }
}
