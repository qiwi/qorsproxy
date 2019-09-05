import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { createLogger, transports: { Console }, format: {json}, config: { colorize } } = winston
winston.transports.DailyRotateFile = DailyRotateFile

export const DEBUG = 'debug'
export const INFO = 'info'
export const WARN = 'warn'
export const ERROR = 'error'

export {
  Console,
  DailyRotateFile
}

export const level = {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

const createFormat = () => {
  const replaceError = ({ label, level, message, stack }) => ({ label, level, message, stack })
  const replacer = (key, value) => value instanceof Error ? replaceError(value) : value

  return json({ replacer })
}

export class Log {
  constructor (...opts) {
    this.logger = createLogger()
    this.configure(...opts)
  }

  configure (opts) {
    this.options = this.constructor.formatOptions(opts || {})
    this.logger.configure(this.options)

    return this
  }

  debug (...args) {
    this.logger.debug(...args); return this
  }

  info (...args) {
    this.logger.info(...args); return this
  }

  warn (...args) {
    this.logger.warn(...args); return this
  }

  error (...args) {
    this.logger.error(...args); return this
  }

  static formatOptions ({ dir, filename, name, size, level = INFO, pattern }) {
    return {
      level: level,
      exitOnError: false,
      format: createFormat(),
      transports: [
        new Console({
          timestamp: this.timestamp,
          formatter: this.formatter,
          colorize
        }),
        size && new DailyRotateFile({
          json: false,
          maxsize: size,
          datePattern: pattern,
          dirname: path.resolve(dir + '/'),
          filename: filename || name, // `name` is legacy option
          timestamp: this.timestamp,
          formatter: this.formatter,
          colorize: this.nocolorize
        })
      ].filter(v => !!v)
    }
  }

  static timestamp () {
    return new Date().toISOString()
  }

  /**
   * @param {Object} options
   * @return {string}
   */
  static formatter ({ level, timestamp, meta, message, colorize }) {
    return `${timestamp()} [${colorize(level, level.toUpperCase())}] ${undefined !== message ? message : ''} ${meta && Object.keys(meta).length ? '\n\t' + JSON.stringify(meta) : ''}`
  }

  static now () {
    return Date.now()
  }

  static nocolorize (level, text) {
    return text
  }
}

export default new Log()
