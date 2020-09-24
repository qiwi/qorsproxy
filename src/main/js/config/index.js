import { get, merge } from '../base'
import emitter from '../emitter'
import DEFAULTS from './defaults'
import ConfigLoader, { LOAD, LOAD_ERROR } from './loader'

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

    if (path) {
      this.loader = new ConfigLoader(path, watch)
        .on(LOAD, this.update.bind(this))
        .on(LOAD_ERROR, this.error.bind(this))
    }
  }

  load () {
    if (this.loader) {
      this.loader.load()
    } else {
      this.update()
    }

    return this
  }

  update (data) {
    const event = this.data ? UPDATE : READY

    this.inject(data)
    this.emit(event, this.data)

    return this
  }

  error (error) {
    this.emit(ERROR, error)

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
