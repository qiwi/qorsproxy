import { get, merge, isError, isPlainObject, isString } from '../base/index.js'
import emitter from '../emitter/index.js'
import DEFAULTS from './defaults.js'
import ConfigLoader, { LOAD, LOAD_ERROR } from './loader.js'
import jsonschema from 'jsonschema'
import { SCHEMA } from './schemas.js'
import Error from '../common/error.js'

export const EVT_PREFIX = 'config_'
export const READY = 'ready'
export const UPDATE = 'update'
export const ERROR = 'error'

export default class Config {
  constructor ({ config: path, host, port, secure, watch }) {
    this.id = Math.random()
    this.host = host
    this.port = port
    this.path = path
    this.secure = secure

    if (isString(path)) {
      this.loader = new ConfigLoader(path, watch)
        .on(LOAD, (data) => this.update(data))
        .on(LOAD_ERROR, (err) => this.emit(ERROR, err))
    }
  }

  /**
   * Validates profile data.
   */
  validate (data) {
    const validationResult = jsonschema.validate(data, SCHEMA)

    return validationResult.valid ? data : new Error('config_loader: invalid by schema', validationResult.errors);
  }

  load () {
    if (this.loader) {
      this.loader.load()
    } else if (isPlainObject(this.path)) {
      this.update(this.path)
    } else {
      this.update(DEFAULTS)
    }

    return this
  }

  update (data) {
    const _data = this.validate(data)

    if (isError(_data)) {
      this.emit(ERROR, _data)
      return this
    }

    const event = this.data ? UPDATE : READY
    this.inject(data)
    this.emit(event, this.data)

    return this
  }

  inject (data) {
    const { host, port, secure } = this

    this.data = merge(
      {},
      DEFAULTS,
      data,
      { server: { host, port, secure } } // NOTE run opts has priority
    )
  }

  on (event, cb) {
    const _event = EVT_PREFIX + event + this.id

    switch (event) {
      case READY:
        emitter.once(_event, cb)
        this.data && this.emit(READY, this.data)
        break

      case ERROR:
      case UPDATE:
        emitter.on(_event, cb)
    }

    return this
  }

  get (key) {
    return get(this.data, key)
  }

  getAll () {
    return this.data
  }

  emit (event, data) {
    emitter.emit(EVT_PREFIX + event + this.id, data)
  }
}
