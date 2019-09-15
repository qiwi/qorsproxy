export default class BaseError extends Error {
  constructor (message, details) {
    super(message)

    this.details = details
  }
}
