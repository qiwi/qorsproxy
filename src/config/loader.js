import fs from 'fs'
import jsonschema from 'jsonschema'

import { isError } from '../base'
import emitter from '../emitter'
import { SCHEMA } from './schemas'

export const EVT_PREFIX = 'config_loader_'
export const LOAD = 'load'
export const LOAD_ERROR = 'error'

export default class ConfigLoader {
  constructor (path, watch) {
    this.id = Math.random()
    this.watch = watch | 0
    this.path = path

    if (this.watch > 0) {
      fs.watchFile(this.path, { persistent: true, interval: this.watch }, this.load.bind(this))
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

    data = constructor.validate(data)
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
      return new Error(`config_loader: read error path=${path}`)
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
      return new Error('config_loader: parse error')
    }
  }

  /**
   * Validates profile data.
   */
  static validate (data) {
    if (jsonschema.validate(data, SCHEMA).valid) {
      return data
    } else {
      return new Error('config_loader: invalid by schema')
    }
  }

  emitError (error) {
    emitter.emit(EVT_PREFIX + LOAD_ERROR + this.id, error)
  }

  emitLoad (data) {
    emitter.emit(EVT_PREFIX + LOAD + this.id, data)
  }
}
